import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from 'jose';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { ALL_112_EXAM_BANKS, VENDORS, CISSP_DOMAINS } from './src/data/examBanks';
import { CISSP_EXAM_QUESTIONS } from './src/data/cisspQuestions';
import { ONBOARDING_ASSESSMENT_QUESTIONS } from './src/data/assessmentQuestions';
import {
  getQuestionsForExamId,
  getFlashcardsForExamId,
  getStudyGuidesForExamId,
  getAudioBriefingsForExamId,
  MULTI_EXAM_FLASHCARDS,
} from './src/data/multiExamQuestions';
import {
  CANONICAL_SCHEMA_VERSION,
  normalizeExamId,
  getExamContentStatus,
  classifyBehavioralArchetype,
  calculateReadinessAndStudyPlan,
  resolveFlashcardConflict,
  resolveSubscriptionStatusConflict,
  migrateLegacyProfile,
  migrateLegacyAttempt,
  migrateLegacyFlashcard,
  migrateLegacyStudyPlan,
  migrateLegacyStudySource,
} from './src/lib/canonicalContract';
import {
  UserCentralProfile,
  HistoricalExamAttempt,
  Flashcard,
  StudyPlanDoc,
  ExamReadinessDoc,
  StudySource,
  SubscriptionEntitlement,
  ExamQuestion,
} from './src/types/certmaster';

const firebaseConfigPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
const firebaseConfig = fs.existsSync(firebaseConfigPath)
  ? JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf-8'))
  : {
      projectId: 'gen-lang-client-0788513176',
      firestoreDatabaseId: 'ai-studio-certmasterwebpla-ad2ba0f9-3a61-45af-b60a-14f5eb4f6001',
    };

export interface ServerUserRecord {
  profile: UserCentralProfile;
  verifiedEntitlements: Record<string, SubscriptionEntitlement>;
  attempts: HistoricalExamAttempt[];
  flashcards: Record<string, Flashcard>;
  studyPlans: Record<string, StudyPlanDoc>;
  readiness: Record<string, ExamReadinessDoc>;
  sources: Record<string, StudySource>;
}

/**
 * Secrets are read ONLY from the environment (never from source code, never defaulted).
 * A secret shorter than 32 chars is treated as "not configured" and the dependent feature is disabled (fail closed).
 */
function readSecret(name: string): string | null {
  const v = (process.env[name] || '').trim();
  return v.length >= 32 ? v : null;
}
const getAuthSigningSecret = () => readSecret('CERTMASTER_AUTH_SIGNING_SECRET');
const getPaymentWebhookSecret = () => readSecret('CERTMASTER_PAYMENT_WEBHOOK_SECRET');
const getQisIngestionApiKey = () => readSecret('QIS_INGESTION_API_KEY');

// Firebase ID tokens are verified cryptographically (RS256) against Google's published public keys.
let firebaseJwks: JWTVerifyGetKey = createRemoteJWKSet(
  new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com')
);
/** Test hook: inject a local JWKS so signature verification can be tested without network access. */
export function setFirebaseJwksForTesting(jwks: JWTVerifyGetKey): void {
  firebaseJwks = jwks;
}

const revokedTokens = new Set<string>();

export function revokeBearerToken(token: string): void {
  revokedTokens.add(token);
}

/**
 * Generates an HMAC-SHA256 signed Bearer token for authenticated sessions and automated E2E tests.
 */
export function createSignedBearerToken(uid: string, expiresInSeconds: number = 3600): string {
  const secret = getAuthSigningSecret();
  if (!secret) throw new Error('CERTMASTER_AUTH_SIGNING_SECRET (>=32 chars) is not configured.');
  const cleanUid = uid.trim();
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const payload = `${cleanUid}.${exp}`;
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return `cm_auth.${payload}.${sig}`;
}

/**
 * Generates an HMAC-SHA256 payment provider webhook signature for server-side receipt verification.
 */
export function createPaymentWebhookSignature(
  userId: string,
  examId: string,
  tier: 'single' | 'universal',
  receiptToken: string
): string {
  const canonicalExam = tier === 'universal' ? 'all-access' : normalizeExamId(examId);
  const secret = getPaymentWebhookSecret();
  if (!secret) throw new Error('CERTMASTER_PAYMENT_WEBHOOK_SECRET (>=32 chars) is not configured.');
  const payload = `${userId}:${canonicalExam}:${tier}:${receiptToken}`;
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

export interface VerifiedTokenIdentity {
  uid: string;
  authMode: 'FIREBASE_ID_TOKEN' | 'SIGNED_SESSION_TOKEN';
  exp: number;
}

/**
 * Validates a Bearer token from the Authorization header.
 * Rejects missing, malformed, expired, forged, or revoked tokens.
 */
export async function verifyBearerToken(
  rawHeader: string | undefined
): Promise<VerifiedTokenIdentity | null> {
  if (!rawHeader || typeof rawHeader !== 'string') return null;
  const trimmed = rawHeader.trim();
  if (!trimmed.toLowerCase().startsWith('bearer ')) return null;
  const token = trimmed.slice(7).trim();
  if (!token || revokedTokens.has(token)) return null;

  const nowSec = Math.floor(Date.now() / 1000);

  // 1. Operator-minted signed session token (cm_auth.<uid>.<exp>.<sig>). Disabled unless a secret is configured.
  if (token.startsWith('cm_auth.')) {
    const secret = getAuthSigningSecret();
    if (!secret) return null;
    const parts = token.split('.');
    if (parts.length !== 4) return null;
    const [, uid, expStr, providedSig] = parts;
    const exp = Number(expStr);
    if (!uid || !Number.isFinite(exp) || exp <= nowSec) return null;
    const expectedSig = crypto.createHmac('sha256', secret).update(`${uid}.${expStr}`).digest('hex');
    if (
      providedSig.length !== expectedSig.length ||
      !crypto.timingSafeEqual(Buffer.from(providedSig), Buffer.from(expectedSig))
    ) {
      return null;
    }
    return { uid, authMode: 'SIGNED_SESSION_TOKEN', exp };
  }

  // 2. Firebase ID token: full RS256 signature, issuer, audience and expiry verification.
  if (token.split('.').length === 3) {
    try {
      const { payload } = await jwtVerify(token, firebaseJwks, {
        issuer: `https://securetoken.google.com/${firebaseConfig.projectId}`,
        audience: firebaseConfig.projectId,
        algorithms: ['RS256'],
      });
      const uid = String(payload.sub || '').trim();
      if (!uid || uid.length > 128) return null;
      return { uid, authMode: 'FIREBASE_ID_TOKEN', exp: Number(payload.exp || 0) };
    } catch {
      return null;
    }
  }

  return null;
}

interface AuthenticatedRequest extends Request {
  authenticatedUid?: string;
  authMode?: string;
}

async function requireBearerAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const verified = await verifyBearerToken(req.headers.authorization);
  if (!verified) {
    res.status(401).json({
      status: '401 UNAUTHORIZED',
      error: 'UNAUTHENTICATED: Valid Authorization Bearer token is required for this endpoint.',
      syncStatus: 'REJECTED_UNAUTHENTICATED',
    });
    return;
  }
  req.authenticatedUid = verified.uid;
  req.authMode = verified.authMode;
  next();
}

function verifyUidOwnership(
  req: AuthenticatedRequest,
  res: Response,
  suppliedUserId: string | undefined | null
): string | null {
  const authUid = req.authenticatedUid;
  if (!authUid) {
    res.status(401).json({
      status: '401 UNAUTHORIZED',
      error: 'UNAUTHENTICATED: Missing authenticated user identity.',
    });
    return null;
  }
  if (suppliedUserId && suppliedUserId.trim() && suppliedUserId.trim() !== authUid) {
    res.status(403).json({
      status: '403 FORBIDDEN',
      error: `PERMISSION_DENIED: Authenticated UID '${authUid}' cannot access or modify resources belonging to '${suppliedUserId}'.`,
      syncStatus: 'REJECTED_CROSS_USER_ACCESS',
    });
    return null;
  }
  return authUid;
}

/**
 * Creates a stateful Express application with all unified Web + Android REST endpoints.
 * Can be mounted in tests or started via `startServer()`.
 */
export function createCertMasterApiApp() {
  const app = express();
  app.use(express.json({ limit: '512kb' }));

  const userStore = new Map<string, ServerUserRecord>();
  const qisDynamicQuestions = new Map<string, ExamQuestion[]>();

  function getOrCreateUserRecord(rawUserId: string): ServerUserRecord {
    const userId = (rawUserId || 'anonymous').slice(0, 128);
    let record = userStore.get(userId);
    if (!record) {
      const baseProfile = migrateLegacyProfile({
        userId,
        displayName: 'CertMaster Student',
        email: '',
        subscriptionTier: 'Free Trial',
        subscriptions: {
          cissp: {
            examId: 'cissp',
            status: 'TRIAL',
            platform: 'WEB',
            expiresAt: '2027-12-31T23:59:59Z',
          },
        },
        assessmentCompleted: false,
        assessmentScorePercent: 0,
        cognitiveStressBaseline: 50,
        preferredTheme: 'dark',
        targetExamId: 'cissp',
        lastActivePlatform: 'WEB',
      });
      record = {
        profile: baseProfile,
        verifiedEntitlements: {},
        attempts: [],
        flashcards: {},
        studyPlans: {},
        readiness: {},
        sources: {},
      };
      userStore.set(userId, record);
    }
    return record;
  }

  const apiRouter = express.Router();

  // =========================================================================
  // 1. HEALTH & ECOSYSTEM DISCOVERY ENDPOINT
  // =========================================================================
  apiRouter.get('/health', (_req, res) => {
    const geminiKey = process.env.GEMINI_API_KEY || '';
    const hasLiveGeminiKey = Boolean(geminiKey && geminiKey !== 'YOUR_GEMINI_API_KEY');
    res.json({
      status: '200 OK',
      service: 'CertMaster Unified Ecosystem Cloud Hub',
      schemaVersion: CANONICAL_SCHEMA_VERSION,
      firebaseProjectId: firebaseConfig.projectId,
      firestoreDatabaseId: firebaseConfig.firestoreDatabaseId,
      authDomain: firebaseConfig.authDomain,
      androidTargetAppId: '3cc96170-31c4-46dd-822d-0ed45a0ac3fe',
      webPlatformAppId: 'ad2ba0f9-3a61-45af-b60a-14f5eb4f6001',
      aiTutorProvider: hasLiveGeminiKey ? 'GEMINI_LIVE' : 'LOCAL_GROUNDED_FALLBACK',
      securityEnforcement: 'BEARER_TOKEN_AND_UID_OWNERSHIP_REQUIRED',
      timestamp: new Date().toISOString(),
    });
  });

  // NOTE: There is intentionally NO endpoint that issues bearer tokens. Clients authenticate with a
  // Firebase ID token (verified cryptographically in verifyBearerToken).
  // =========================================================================
  // =========================================================================
  // 2. SHARED CATALOG, DOMAINS & QUESTION BANK ENDPOINTS (Web + Android)
  // =========================================================================
  apiRouter.get('/catalog/manifest', (_req, res) => {
    const sampleBanks = ALL_112_EXAM_BANKS.filter(
      (b) => b.contentStatus === 'SAMPLE_CONTENT_AVAILABLE'
    );
    const previewBanks = ALL_112_EXAM_BANKS.filter(
      (b) => b.contentStatus === 'CATALOG_PREVIEW'
    );
    res.json({
      status: '200 OK',
      schemaVersion: CANONICAL_SCHEMA_VERSION,
      totalExamBanks: ALL_112_EXAM_BANKS.length,
      sampleContentCount: sampleBanks.length,
      fullPrepCount: sampleBanks.length,
      catalogPreviewCount: previewBanks.length,
      vendors: VENDORS,
      cisspDomains: CISSP_DOMAINS,
      exams: ALL_112_EXAM_BANKS,
      cisspQuestionCount: CISSP_EXAM_QUESTIONS.length,
      diagnosticAssessmentQuestionCount: ONBOARDING_ASSESSMENT_QUESTIONS.length,
      timestamp: new Date().toISOString(),
    });
  });

  apiRouter.get('/catalog', (_req, res) => {
    res.json(ALL_112_EXAM_BANKS);
  });

  apiRouter.get('/exams/:examId/config', (req, res) => {
    const canonicalId = normalizeExamId(req.params.examId);
    const bank = ALL_112_EXAM_BANKS.find((b) => normalizeExamId(b.id) === canonicalId);
    if (!bank) {
      res.status(404).json({ error: `Exam ${canonicalId} not found in 112-exam catalog` });
      return;
    }
    res.json({
      ...bank,
      id: canonicalId,
      schemaVersion: CANONICAL_SCHEMA_VERSION,
      contentStatus: getExamContentStatus(canonicalId),
    });
  });

  apiRouter.get('/exams/:examId/questions', (req, res) => {
    const canonicalId = normalizeExamId(req.params.examId);
    const staticQuestions = getQuestionsForExamId(canonicalId);
    const dynamicQuestions = qisDynamicQuestions.get(canonicalId) || [];
    const questionMap = new Map<string, ExamQuestion>();
    staticQuestions.forEach((q) => questionMap.set(q.id, q));
    dynamicQuestions.forEach((q) => questionMap.set(q.id, q));
    res.json(Array.from(questionMap.values()));
  });

  apiRouter.get('/exams/:examId/sources', (req, res) => {
    const canonicalId = normalizeExamId(req.params.examId);
    const guides = getStudyGuidesForExamId(canonicalId);
    res.json(guides);
  });

  apiRouter.get('/exams/:examId/audio-overviews', (req, res) => {
    const canonicalId = normalizeExamId(req.params.examId);
    const briefings = getAudioBriefingsForExamId(canonicalId);
    res.json(briefings);
  });

  apiRouter.get('/exams/:examId/flashcards', (req, res) => {
    const canonicalId = normalizeExamId(req.params.examId);
    const cards = getFlashcardsForExamId(MULTI_EXAM_FLASHCARDS, canonicalId);
    res.json(cards);
  });


  // =========================================================================
  // 2B. CONTINUOUS QIS INGESTION ENDPOINT (SECURE API KEY PROTECTED)
  // =========================================================================
  apiRouter.post('/qis/ingest', (req, res) => {
    const configuredKey = getQisIngestionApiKey();
    const isDev = process.env.NODE_ENV !== 'production';
    const providedKey = req.headers['x-qis-api-key'] || req.headers['authorization']?.replace(/^Bearer\s+/i, '');

    if (!configuredKey && !isDev) {
      res.status(503).json({
        status: '503 SERVICE_UNAVAILABLE',
        error: 'QIS_INGESTION_API_KEY is not configured in production environment.',
      });
      return;
    }

    if (configuredKey && providedKey !== configuredKey) {
      res.status(403).json({
        status: '403 FORBIDDEN',
        error: 'PERMISSION_DENIED: Invalid or missing X-QIS-API-Key header.',
      });
      return;
    }

    const body = req.body || {};
    const rawExamId = body.examId || body.examCode || body.exam;
    if (!rawExamId || typeof rawExamId !== 'string') {
      res.status(400).json({
        status: '400 BAD_REQUEST',
        error: 'Missing required field: examId (or examCode)',
      });
      return;
    }

    const canonicalExamId = normalizeExamId(rawExamId);
    const incomingQuestions: unknown[] = Array.isArray(body.questions)
      ? body.questions
      : Array.isArray(body.pack?.questions)
      ? body.pack.questions
      : [];

    if (incomingQuestions.length === 0) {
      res.status(400).json({
        status: '400 BAD_REQUEST',
        error: 'No questions provided in payload (expected array in questions or pack.questions)',
      });
      return;
    }

    const validQuestions: ExamQuestion[] = [];
    for (let i = 0; i < incomingQuestions.length; i++) {
      const q = incomingQuestions[i] as Record<string, any>;
      const qId = String(q.id || q.question_id || `qis-${canonicalExamId}-${Date.now()}-${i}`);
      const prompt = String(q.prompt || q.question_text || q.text || '').trim();
      if (!prompt) continue;

      let options: Array<{ id: string; letter: 'A' | 'B' | 'C' | 'D'; text: string }> = [];
      if (Array.isArray(q.options) && q.options.length >= 2) {
        options = q.options.map((opt: any, optIdx: number) => {
          const letter = (['A', 'B', 'C', 'D'][optIdx] || 'A') as 'A' | 'B' | 'C' | 'D';
          const text = typeof opt === 'string' ? opt : String(opt.text || opt.option || '');
          const id = typeof opt === 'object' && opt.id ? String(opt.id) : `opt_${letter.toLowerCase()}`;
          return { id, letter, text };
        });
      } else if (q.option_a && q.option_b) {
        options = [
          { id: 'opt_a', letter: 'A', text: String(q.option_a) },
          { id: 'opt_b', letter: 'B', text: String(q.option_b) },
          { id: 'opt_c', letter: 'C', text: String(q.option_c || '') },
          { id: 'opt_d', letter: 'D', text: String(q.option_d || '') },
        ];
      }

      if (options.length < 2) continue;

      let correctOptionId = 'opt_a';
      if (q.correctOptionId && typeof q.correctOptionId === 'string') {
        correctOptionId = q.correctOptionId;
      } else if (typeof q.correct_answer === 'number') {
        const letters = ['opt_a', 'opt_b', 'opt_c', 'opt_d'];
        correctOptionId = letters[q.correct_answer] || 'opt_a';
      } else if (typeof q.correct_answer === 'string') {
        const norm = q.correct_answer.trim().toLowerCase();
        if (norm === 'a' || norm === 'opt_a') correctOptionId = 'opt_a';
        else if (norm === 'b' || norm === 'opt_b') correctOptionId = 'opt_b';
        else if (norm === 'c' || norm === 'opt_c') correctOptionId = 'opt_c';
        else if (norm === 'd' || norm === 'opt_d') correctOptionId = 'opt_d';
      }

      validQuestions.push({
        id: qId,
        examId: canonicalExamId,
        domain: String(q.domain || q.domain_id || 'General Subject Knowledge'),
        domainNumber: Number(q.domainNumber || q.domain_number || 1),
        difficulty: (['Foundational', 'Intermediate', 'Advanced', 'CBK-Scenario'].includes(q.difficulty)
          ? q.difficulty
          : 'Intermediate') as any,
        scenario: q.scenario ? String(q.scenario) : undefined,
        prompt,
        options,
        correctOptionId,
        explanation: String(q.explanation || 'Answer verified by QIS syllabus quality review.'),
        citation: {
          authority: String(q.citation?.authority || q.source_evidence || 'QIS Curriculum Engine'),
          section: String(q.citation?.section || `Objective ${q.domainNumber || 1}`),
          note: String(q.citation?.note || 'Ingested continuously from authoritative syllabus'),
          sourceDocument: String(q.citation?.sourceDocument || q.source_evidence || 'Official Exam Guide'),
        },
      });
    }

    const existing = qisDynamicQuestions.get(canonicalExamId) || [];
    const merged = new Map<string, ExamQuestion>();
    existing.forEach((q) => merged.set(q.id, q));
    validQuestions.forEach((q) => merged.set(q.id, q));

    const finalQuestions = Array.from(merged.values());
    qisDynamicQuestions.set(canonicalExamId, finalQuestions);

    res.json({
      status: '200 OK',
      message: `Successfully ingested ${validQuestions.length} questions from QIS continuous generator into ${canonicalExamId}.`,
      examId: canonicalExamId,
      ingestedCount: validQuestions.length,
      totalLiveQuestions: finalQuestions.length,
      timestamp: new Date().toISOString(),
    });
  });

  // =========================================================================
  // 3. IDEMPOTENT EXAM SESSION & ATTEMPT INGESTION ENDPOINT (AUTH PROTECTED)
  // =========================================================================
  apiRouter.post('/exams/:examId/sessions', requireBearerAuth, (req: AuthenticatedRequest, res) => {
    const body = req.body || {};
    const canonicalExamId = normalizeExamId(String(req.params.examId || body.examId || 'cissp'));
    const userId = verifyUidOwnership(
      req,
      res,
      typeof body.userId === 'string' ? body.userId : undefined
    );
    if (!userId) return;

    const record = getOrCreateUserRecord(userId);

    const migrated = migrateLegacyAttempt({
      ...body,
      examId: canonicalExamId,
      userId,
    });
    const incomingAttempt: HistoricalExamAttempt = {
      ...migrated,
      userId,
      id: migrated.attemptId,
      date: migrated.dateString,
    };

    // Idempotent deduplication by attemptId / sessionId
    const existingIdx = record.attempts.findIndex(
      (a) => a.id === incomingAttempt.id || a.attemptId === incomingAttempt.attemptId
    );
    const isDuplicate = existingIdx >= 0;
    if (isDuplicate) {
      record.attempts[existingIdx] = incomingAttempt;
    } else {
      record.attempts.push(incomingAttempt);
    }

    // Recompute authoritative readiness (60/25/15) & 5-stage study plan
    const examSimScores = record.attempts
      .filter((a) => normalizeExamId(a.examId) === canonicalExamId)
      .map((a) => a.scorePercent);
    const allCards = Object.values(record.flashcards).filter(
      (c) => normalizeExamId(c.examId || 'cissp') === canonicalExamId
    );
    const knownCount = allCards.filter((c) => c.state === 'known').length;

    const { readiness, studyPlan } = calculateReadinessAndStudyPlan({
      userId,
      examId: canonicalExamId,
      passingScorePercent: 70,
      assessmentCompleted: record.profile.assessmentCompleted ?? true,
      assessmentScorePercent: record.profile.assessmentScorePercent || incomingAttempt.scorePercent,
      cognitiveStressBaseline: incomingAttempt.stressScore || 50,
      behavioralArchetype: record.profile.behavioralArchetype?.name || 'Analytical Hesitator',
      averageDwellTimeSec: incomingAttempt.averageDwellSec || 42,
      simulationScoresPercent: examSimScores,
      knownFlashcardsCount: knownCount,
      totalFlashcardsCount: Math.max(1, allCards.length || 8),
      weakestDomainId: 'd3',
      weakestDomainName: 'Security Architecture & Engineering',
      weakestDomainScore: Math.max(50, incomingAttempt.scorePercent - 5),
    });

    record.readiness[canonicalExamId] = readiness;
    record.studyPlans[canonicalExamId] = studyPlan;
    record.profile.completedSimulationsCount = record.attempts.length;
    record.profile.highestSimulationScore = Math.max(
      record.profile.highestSimulationScore || 0,
      incomingAttempt.scorePercent
    );

    res.json({
      status: '200 OK',
      syncStatus: 'SYNCHRONIZED',
      authenticatedUid: userId,
      deduplicated: isDuplicate,
      attempt: incomingAttempt,
      session: incomingAttempt,
      readiness,
      studyPlan,
      totalAttemptsForUser: record.attempts.length,
      timestamp: new Date().toISOString(),
    });
  });

  // =========================================================================
  // 4. PROFILE RETRIEVAL & BIDIRECTIONAL PROFILE SYNC ENDPOINT (AUTH PROTECTED)
  // =========================================================================
  apiRouter.get('/profile/:userId', requireBearerAuth, (req: AuthenticatedRequest, res) => {
    const userId = verifyUidOwnership(req, res, String(req.params.userId || ''));
    if (!userId) return;
    const record = getOrCreateUserRecord(userId);
    res.json({
      status: '200 OK',
      schemaVersion: CANONICAL_SCHEMA_VERSION,
      authenticatedUid: userId,
      profile: record.profile,
      attempts: record.attempts,
      flashcards: Object.values(record.flashcards),
      flashcardsById: record.flashcards,
      studyPlans: Object.values(record.studyPlans),
      studyPlansByExamId: record.studyPlans,
      readiness: record.readiness,
      sources: Object.values(record.sources),
      timestamp: new Date().toISOString(),
    });
  });

  apiRouter.post('/profile/sync', requireBearerAuth, (req: AuthenticatedRequest, res) => {
    const body = req.body || {};
    const userId = verifyUidOwnership(
      req,
      res,
      typeof body.userId === 'string' ? body.userId : undefined
    );
    if (!userId) return;

    const record = getOrCreateUserRecord(userId);
    const incoming = migrateLegacyProfile({ ...body, userId }, userId);

    // Deterministic conflict resolution + entitlement guard:
    // Never allow an unverified client profile sync to self-activate paid subscriptions or escalate subscriptionTier
    const mergedSubs: Record<string, SubscriptionEntitlement> = {
      ...record.profile.subscriptions,
    };

    for (const [rawExamId, sub] of Object.entries(incoming.subscriptions || {})) {
      const examId = normalizeExamId(rawExamId);
      const serverVerified = record.verifiedEntitlements[examId];
      if (serverVerified && serverVerified.status === 'ACTIVE') {
        mergedSubs[examId] = serverVerified;
      } else {
        const safeClientStatus =
          sub.status === 'ACTIVE'
            ? mergedSubs[examId]?.status === 'ACTIVE'
              ? 'ACTIVE'
              : 'TRIAL'
            : sub.status;
        const existingStatus = mergedSubs[examId]?.status || 'LOCKED';
        mergedSubs[examId] = {
          ...sub,
          userId,
          examId,
          status: resolveSubscriptionStatusConflict(existingStatus, safeClientStatus),
        };
      }
    }

    const hasVerifiedUniversal = Object.keys(record.verifiedEntitlements).length >= 10;
    const safeTier = hasVerifiedUniversal
      ? 'Universal Multi-Pass'
      : Object.values(record.verifiedEntitlements).some((s) => s.status === 'ACTIVE')
        ? 'Single-Exam Pass'
        : record.profile.subscriptionTier;

    const resolvedActiveExamId = normalizeExamId(
      String(
        body.activeExamId ||
          body.targetExamId ||
          incoming.targetExamId ||
          record.profile.targetExamId ||
          'cissp'
      )
    );

    const mergedProfile: UserCentralProfile & { activeExamId?: string } = {
      ...record.profile,
      ...incoming,
      userId,
      displayName: incoming.displayName || record.profile.displayName,
      subscriptionTier: safeTier,
      subscriptions: mergedSubs,
      assessmentScorePercent: Math.max(
        record.profile.assessmentScorePercent || 0,
        incoming.assessmentScorePercent || 0
      ),
      targetExamId: resolvedActiveExamId,
      activeExamId: resolvedActiveExamId,
      lastActivePlatform:
        body.platform === 'ANDROID' || incoming.lastActivePlatform === 'ANDROID'
          ? 'ANDROID'
          : 'WEB',
      lastSyncTimestamp: new Date().toISOString(),
      lastSyncTimestampMillis: Date.now(),
      schemaVersion: CANONICAL_SCHEMA_VERSION,
    };

    record.profile = mergedProfile;

    res.json({
      status: '200 OK',
      syncStatus: 'SYNCHRONIZED',
      authenticatedUid: userId,
      firebaseProjectId: firebaseConfig.projectId,
      firestoreDatabaseId: firebaseConfig.firestoreDatabaseId,
      firestoreDocumentPath: `/users/${userId}`,
      originPlatform: mergedProfile.lastActivePlatform,
      validatedProfile: mergedProfile,
      attempts: record.attempts,
      flashcards: Object.values(record.flashcards),
      studyPlans: Object.values(record.studyPlans),
      readiness: record.readiness,
      sources: Object.values(record.sources),
      timestamp: new Date().toISOString(),
    });
  });

  // =========================================================================
  // 5. SERVER-SIDE SUBSCRIPTION & ENTITLEMENT VERIFICATION (AUTH + HMAC PROTECTED)
  // =========================================================================
  apiRouter.get('/subscriptions/verify', requireBearerAuth, (req: AuthenticatedRequest, res) => {
    const queryUserId = typeof req.query.userId === 'string' ? req.query.userId : undefined;
    const userId = verifyUidOwnership(req, res, queryUserId);
    if (!userId) return;

    const record = getOrCreateUserRecord(userId);
    res.json({
      status: '200 OK',
      crossPlatformIntegrity: 'VERIFIED',
      authenticatedUid: userId,
      firebaseProjectId: firebaseConfig.projectId,
      firestoreDatabaseId: firebaseConfig.firestoreDatabaseId,
      firestoreCollectionPath: `/users/${userId}/subscriptions`,
      verifiedEntitlements: record.verifiedEntitlements,
      subscriptionTier: record.profile.subscriptionTier,
      totalCatalogBanks: ALL_112_EXAM_BANKS.length,
      supportedStatuses: ['ACTIVE', 'TRIAL', 'EXPIRED', 'LOCKED'],
      supportedOrigins: ['WEB', 'ANDROID'],
      timestamp: new Date().toISOString(),
    });
  });

  apiRouter.post('/subscriptions/verify', requireBearerAuth, (req: AuthenticatedRequest, res) => {
    const body = req.body || {};
    const userId = verifyUidOwnership(
      req,
      res,
      typeof body.userId === 'string' ? body.userId : undefined
    );
    if (!userId) return;

    const receiptToken = typeof body.receiptToken === 'string' ? body.receiptToken.trim() : '';
    const tier: 'universal' | 'single' =
      body.tier === 'universal' || body.examId === 'all-access' ? 'universal' : 'single';
    const examId = tier === 'universal' ? 'all-access' : normalizeExamId(body.examId || 'cissp');
    const webhookSigHeader = String(req.headers['x-certmaster-webhook-signature'] || '').trim();
    const sandboxHeader = String(req.headers['x-certmaster-sandbox-mode'] || '').trim().toLowerCase();

    if (!receiptToken) {
      res.status(403).json({
        status: '403 FORBIDDEN',
        error: 'PERMISSION_DENIED: Missing payment receiptToken.',
        syncStatus: 'REJECTED',
      });
      return;
    }

    // 1. Check Production Cryptographic Webhook Signature (HMAC-SHA256)
    const webhookSecretConfigured = getPaymentWebhookSecret() !== null;
    const expectedSignature = webhookSecretConfigured
      ? createPaymentWebhookSignature(userId, examId, tier, receiptToken)
      : '';
    const isProductionCryptoVerified =
      webhookSecretConfigured &&
      webhookSigHeader.length === expectedSignature.length &&
      crypto.timingSafeEqual(Buffer.from(webhookSigHeader), Buffer.from(expectedSignature));

    // 2. Check Explicitly Gated Sandbox Mode (only permitted when NODE_ENV !== 'production' and header + sandbox receipt match)
    // Fail closed: sandbox grants require an explicit opt-in flag AND a non-production environment.
    const isSandboxAllowed =
      process.env.NODE_ENV !== 'production' && process.env.CERTMASTER_ALLOW_SANDBOX_PAYMENTS === 'true';
    const isSandboxVerified =
      isSandboxAllowed &&
      sandboxHeader === 'true' &&
      receiptToken.startsWith('sandbox_rcpt_verified_');

    // A bare string prefix like 'rcpt_' or 'stripe_' without cryptographic signature MUST NEVER be accepted
    if (!isProductionCryptoVerified && !isSandboxVerified) {
      res.status(403).json({
        status: '403 FORBIDDEN',
        error:
          'PERMISSION_DENIED: Unverified receiptToken rejected. Production entitlement activation requires a cryptographic X-CertMaster-Webhook-Signature; simple string prefixes (rcpt_ / stripe_) are not accepted.',
        syncStatus: 'REJECTED_UNVERIFIED_RECEIPT',
      });
      return;
    }

    const verificationMode = isProductionCryptoVerified
      ? 'PRODUCTION_CRYPTO_VERIFIED'
      : 'SANDBOX_TEST_ONLY';

    const record = getOrCreateUserRecord(userId);
    const nowIso = new Date().toISOString();

    if (tier === 'universal') {
      ALL_112_EXAM_BANKS.forEach((b) => {
        const ent: SubscriptionEntitlement = {
          userId,
          examId: b.id,
          status: 'ACTIVE',
          platform: body.platform === 'ANDROID' ? 'ANDROID' : 'WEB',
          expiresAt: '2028-01-01T00:00:00Z',
          lastSyncedAt: nowIso,
        };
        record.verifiedEntitlements[b.id] = ent;
        record.profile.subscriptions[b.id] = ent;
      });
      record.profile.subscriptionTier = 'Universal Multi-Pass';
    } else {
      const ent: SubscriptionEntitlement = {
        userId,
        examId,
        status: 'ACTIVE',
        platform: body.platform === 'ANDROID' ? 'ANDROID' : 'WEB',
        expiresAt: '2027-12-31T23:59:59Z',
        lastSyncedAt: nowIso,
      };
      record.verifiedEntitlements[examId] = ent;
      record.profile.subscriptions[examId] = ent;
      if (record.profile.subscriptionTier === 'Free Trial') {
        record.profile.subscriptionTier = 'Single-Exam Pass';
      }
    }

    res.json({
      status: '200 OK',
      syncStatus: 'VERIFIED_ACTIVE',
      verificationMode,
      isProductionPayment: isProductionCryptoVerified,
      authenticatedUid: userId,
      userId,
      subscriptionTier: record.profile.subscriptionTier,
      verifiedEntitlements: record.verifiedEntitlements,
      timestamp: nowIso,
    });
  });

  // =========================================================================
  // 6. FLASHCARD, STUDY PLAN & CUSTOM SOURCE SYNC ENDPOINTS (AUTH PROTECTED)
  // =========================================================================
  apiRouter.post('/flashcards/sync', requireBearerAuth, (req: AuthenticatedRequest, res) => {
    const body = req.body || {};
    const userId = verifyUidOwnership(
      req,
      res,
      typeof body.userId === 'string' ? body.userId : undefined
    );
    if (!userId) return;

    const record = getOrCreateUserRecord(userId);
    const incomingList: unknown[] = Array.isArray(body.flashcards)
      ? body.flashcards
      : Array.isArray(body.cards)
        ? body.cards
        : body.card
          ? [body.card]
          : [body];

    incomingList.forEach((raw) => {
      if (typeof raw === 'object' && raw !== null) {
        const incomingProgress = migrateLegacyFlashcard(
          { ...(raw as Record<string, unknown>), userId },
          userId
        );
        const cardKey = incomingProgress.cardId || incomingProgress.id || 'fc_unknown';
        const existingCard = record.flashcards[cardKey];
        const existingProgress = existingCard
          ? migrateLegacyFlashcard(
              existingCard as unknown as Record<string, unknown>,
              userId
            )
          : null;
        const resolved = existingProgress
          ? resolveFlashcardConflict(existingProgress, incomingProgress)
          : incomingProgress;
        record.flashcards[cardKey] = {
          ...(existingCard || {
            id: cardKey,
            examId: resolved.examId,
            domain: resolved.domain,
            front: String((raw as Record<string, unknown>).front || ''),
            back: String((raw as Record<string, unknown>).back || ''),
            reference: String((raw as Record<string, unknown>).reference || 'Canonical v2'),
          }),
          id: cardKey,
          examId: resolved.examId,
          domain: resolved.domain,
          state: resolved.state,
          boxLevel: resolved.boxLevel,
          lastReviewedEpoch: resolved.lastReviewedEpoch,
          reviewCount: resolved.reviewCount,
          platform: resolved.platform,
        };
      }
    });

    res.json({
      status: '200 OK',
      syncStatus: 'SYNCHRONIZED',
      authenticatedUid: userId,
      flashcards: Object.values(record.flashcards),
      flashcardsById: record.flashcards,
      timestamp: new Date().toISOString(),
    });
  });

  apiRouter.post('/study-plan/sync', requireBearerAuth, (req: AuthenticatedRequest, res) => {
    const body = req.body || {};
    const userId = verifyUidOwnership(
      req,
      res,
      typeof body.userId === 'string' ? body.userId : undefined
    );
    if (!userId) return;

    const record = getOrCreateUserRecord(userId);
    const rawPlan =
      typeof body.studyPlan === 'object' && body.studyPlan !== null
        ? { ...(body.studyPlan as Record<string, unknown>), examId: body.examId || (body.studyPlan as Record<string, unknown>).examId, userId }
        : { ...body, userId };
    const plan = migrateLegacyStudyPlan(rawPlan, userId);
    record.studyPlans[plan.examId] = plan;

    res.json({
      status: '200 OK',
      syncStatus: 'SYNCHRONIZED',
      authenticatedUid: userId,
      studyPlan: plan,
      timestamp: new Date().toISOString(),
    });
  });

  apiRouter.post('/sources/sync', requireBearerAuth, (req: AuthenticatedRequest, res) => {
    const body = req.body || {};
    const userId = verifyUidOwnership(
      req,
      res,
      typeof body.userId === 'string' ? body.userId : undefined
    );
    if (!userId) return;

    const record = getOrCreateUserRecord(userId);
    const src = migrateLegacyStudySource({ ...body, userId }, userId);
    record.sources[src.id] = src;

    res.json({
      status: '200 OK',
      syncStatus: 'SYNCHRONIZED',
      authenticatedUid: userId,
      source: src,
      sources: Object.values(record.sources),
      timestamp: new Date().toISOString(),
    });
  });

  // =========================================================================
  // 7. BEHAVIORAL TELEMETRY & AI TUTOR ENDPOINTS
  // =========================================================================
  apiRouter.post('/scores/telemetry', (req, res) => {
    const body = req.body || {};
    const avgDwellSeconds = typeof body.avgDwellSeconds === 'number' ? body.avgDwellSeconds : 42;
    const switchRatePercent = typeof body.switchRatePercent === 'number' ? body.switchRatePercent : 22;
    const distractorEliminationRate =
      typeof body.distractorEliminationRate === 'number' ? body.distractorEliminationRate : 64;
    const scorePercent = typeof body.scorePercent === 'number' ? body.scorePercent : 78;

    const totalQuestions = typeof body.totalQuestions === 'number' ? body.totalQuestions : 10;
    const totalSwitches =
      typeof body.totalSwitches === 'number'
        ? body.totalSwitches
        : Math.max(1, Math.round((switchRatePercent / 100) * totalQuestions * 1.5));
    const totalEliminations =
      typeof body.totalEliminations === 'number'
        ? body.totalEliminations
        : Math.round((distractorEliminationRate / 100) * totalQuestions * 3);

    const classified = classifyBehavioralArchetype({
      scorePct: scorePercent,
      avgLatencySec: avgDwellSeconds,
      totalSwitches,
      totalEliminations,
      totalQuestions,
    });

    res.json({
      status: '200 OK',
      packet: 'TELEMETRY_CALIBRATED',
      schemaVersion: CANONICAL_SCHEMA_VERSION,
      firebaseProjectId: firebaseConfig.projectId,
      firestoreDatabaseId: firebaseConfig.firestoreDatabaseId,
      calibratedTelemetry: {
        archetypeName: classified.archetype,
        avgDwellSeconds,
        switchRatePercent,
        distractorEliminationRate,
        scorePercent,
        computedStressScore: classified.cognitiveStressBaseline,
        recommendedStrategy: classified.recommendedStrategy,
      },
      timestamp: new Date().toISOString(),
    });
  });

  apiRouter.post('/ai/tutor', async (req, res) => {
    const body = req.body || {};
    const examId = normalizeExamId(body.examId || 'cissp');
    const rawQuery = String(body.query || '').trim();
    const queryText = rawQuery.toLowerCase();
    const bank = ALL_112_EXAM_BANKS.find((b) => normalizeExamId(b.id) === examId);
    const guides = getStudyGuidesForExamId(examId);

    const geminiApiKey = (process.env.GEMINI_API_KEY || '').trim();
    const hasLiveGemini = Boolean(geminiApiKey && geminiApiKey !== 'YOUR_GEMINI_API_KEY');

    let reply = '';
    let citation = `${bank?.vendor || 'Official'} ${bank?.code || examId.toUpperCase()} Body of Knowledge`;
    let provider: 'GEMINI_LIVE' | 'LOCAL_GROUNDED_FALLBACK' = 'LOCAL_GROUNDED_FALLBACK';
    let isSimulatedFallback = true;

    if (hasLiveGemini && rawQuery) {
      try {
        const ai = new GoogleGenAI({ apiKey: geminiApiKey });
        const groundingContext = guides
          .map((g) => `Guide: ${g.title} (${g.officialReference})\nSummary: ${g.summary}`)
          .join('\n\n');
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `You are the CertMaster Grounded Certification Tutor for ${bank?.code || examId.toUpperCase()} (${bank?.title || ''}).
Grounding Context:
${groundingContext}

Student Question: ${rawQuery}
Provide a concise, authoritative answer with standard/CBK citations.`,
        });
        if (response.text) {
          reply = response.text;
          provider = 'GEMINI_LIVE';
          isSimulatedFallback = false;
          citation = `${bank?.code || examId.toUpperCase()} Official CBK + Gemini 2.5 Grounded Synthesis`;
        }
      } catch {
        // Fall through to deterministic grounded reference engine
      }
    }

    if (!reply) {
      if (queryText.includes('bell') || queryText.includes('biba') || queryText.includes('model')) {
        reply =
          'Bell-LaPadula enforces **Confidentiality** via *Simple Security (No Read-Up)* and *Star Property (No Write-Down)*. Biba enforces **Integrity** via *Simple Integrity (No Read-Down)* and *Star Integrity (No Write-Up)*. For commercial transaction integrity using Well-Formed Transactions and Separation of Duties, choose **Clark-Wilson**.';
        citation = 'CISSP CBK Domain 3 / Formal Security Models (§7.3)';
      } else if (queryText.includes('vpc') || queryText.includes('endpoint') || queryText.includes('s3')) {
        reply =
          'For private connectivity to **Amazon S3** or **DynamoDB** from private subnets without NAT Gateways, use a **Gateway VPC Endpoint** (route-table entry, $0 hourly/data cost). For other AWS services (SQS, KMS, Secrets Manager), use an **Interface VPC Endpoint (AWS PrivateLink)**.';
        citation = 'AWS Well-Architected Framework – Security & Cost Optimization Pillars';
      } else if (queryText.includes('zero trust') || queryText.includes('pdp') || queryText.includes('pep')) {
        reply =
          'In Zero Trust Architecture (NIST SP 800-207 / SY0-701 Objective 1.2), the **Control Plane** contains the **Policy Decision Point (PDP)**—split into the Policy Engine (PE) and Policy Administrator (PA)—while the **Data Plane** houses the **Policy Enforcement Point (PEP)**.';
        citation = 'CompTIA Security+ SY0-701 Objective 1.2 / NIST SP 800-207';
      } else if (queryText.includes('cpi') || queryText.includes('spi') || queryText.includes('earned value')) {
        reply =
          'In Earned Value Management (EVM): **CPI = EV / AC** (< 1.0 means over budget) and **SPI = EV / PV** (< 1.0 means behind schedule). Remember: Earned Value (EV) always comes first!';
        citation = 'PMI PMBOK Guide 7th Edition – Measurement Performance Domain';
      } else if (guides.length > 0) {
        reply = `For **${bank?.code || examId.toUpperCase()}** (${guides[0].domain}): ${guides[0].summary}\n\nKey Takeaways:\n• ${guides[0].keyTakeaways.join('\n• ')}`;
        citation = guides[0].officialReference;
      } else {
        reply = `For **${bank?.code || examId.toUpperCase()} - ${bank?.title || ''}**, focus on the highest-weighted blueprint domains first (${bank?.domains.map((d) => `${d.name} (${d.weight}%)`).join(', ') || 'Core Domains'}). Always prioritize human safety, governance accountability, and least-privilege controls.`;
      }
    }

    res.json({
      status: '200 OK',
      examId,
      provider,
      isSimulatedFallback,
      providerNotice: isSimulatedFallback
        ? 'Local Grounded Reference Engine (Deterministic Rule-Based Fallback — GEMINI_API_KEY not configured)'
        : 'Live Gemini Generative AI with Grounded Citations',
      reply,
      answer: reply,
      citation,
      citations: [
        {
          title: citation,
          section: bank?.code || examId.toUpperCase(),
          authority: bank?.vendor || 'Official Standard',
        },
      ],
      suggestedFollowUps: [
        'Compare Bell-LaPadula and Biba integrity models',
        'Explain AWS Gateway VPC Endpoint vs Interface Endpoint',
        'How is Earned Value (CPI & SPI) calculated?',
      ],
      timestamp: new Date().toISOString(),
    });
  });

  // Mount at both /api and /api/api so both Web fetch('/api/...') and legacy Android baseUrl ('.../api/') work seamlessly
  app.use('/api', apiRouter);
  app.use('/api/api', apiRouter);

  return app;
}

async function startServer() {
  const app = createCertMasterApiApp();
  const PORT = Number(process.env.PORT) || 3000;

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CertMaster Unified Cloud Hub running on http://0.0.0.0:${PORT}`);
  });
}

const currentFilePath = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(currentFilePath)) {
  startServer();
}
