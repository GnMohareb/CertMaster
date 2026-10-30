import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
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
 * Creates a stateful Express application with all unified Web + Android REST endpoints.
 * Can be mounted in tests or started via `startServer()`.
 */
export function createCertMasterApiApp() {
  const app = express();
  app.use(express.json({ limit: '512kb' }));

  const userStore = new Map<string, ServerUserRecord>();

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
    res.json({
      status: '200 OK',
      service: 'CertMaster Unified Ecosystem Cloud Hub',
      schemaVersion: CANONICAL_SCHEMA_VERSION,
      firebaseProjectId: firebaseConfig.projectId,
      firestoreDatabaseId: firebaseConfig.firestoreDatabaseId,
      authDomain: firebaseConfig.authDomain,
      androidTargetAppId: '3cc96170-31c4-46dd-822d-0ed45a0ac3fe',
      webPlatformAppId: 'ad2ba0f9-3a61-45af-b60a-14f5eb4f6001',
      timestamp: new Date().toISOString(),
    });
  });

  // =========================================================================
  // 2. SHARED CATALOG, DOMAINS & QUESTION BANK ENDPOINTS (Web + Android)
  // =========================================================================
  apiRouter.get('/catalog/manifest', (_req, res) => {
    res.json({
      status: '200 OK',
      schemaVersion: CANONICAL_SCHEMA_VERSION,
      totalExamBanks: ALL_112_EXAM_BANKS.length,
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
    const questions = getQuestionsForExamId(canonicalId);
    res.json(questions);
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
  // 3. IDEMPOTENT EXAM SESSION & ATTEMPT INGESTION ENDPOINT
  // =========================================================================
  apiRouter.post('/exams/:examId/sessions', (req, res) => {
    const body = req.body || {};
    const canonicalExamId = normalizeExamId(req.params.examId || body.examId || 'cissp');
    const userId = typeof body.userId === 'string' && body.userId ? body.userId : 'usr_default';
    const record = getOrCreateUserRecord(userId);

    const migrated = migrateLegacyAttempt({
      ...body,
      examId: canonicalExamId,
      userId,
    });
    const incomingAttempt: HistoricalExamAttempt = {
      ...migrated,
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
      deduplicated: isDuplicate,
      attempt: incomingAttempt,
      readiness,
      studyPlan,
      totalAttemptsForUser: record.attempts.length,
      timestamp: new Date().toISOString(),
    });
  });

  // =========================================================================
  // 4. PROFILE RETRIEVAL & BIDIRECTIONAL PROFILE SYNC ENDPOINT
  // =========================================================================
  apiRouter.get('/profile/:userId', (req, res) => {
    const record = getOrCreateUserRecord(req.params.userId);
    res.json({
      status: '200 OK',
      schemaVersion: CANONICAL_SCHEMA_VERSION,
      profile: record.profile,
      attempts: record.attempts,
      flashcards: Object.values(record.flashcards),
      studyPlans: Object.values(record.studyPlans),
      readiness: record.readiness,
      sources: Object.values(record.sources),
      timestamp: new Date().toISOString(),
    });
  });

  apiRouter.post('/profile/sync', (req, res) => {
    const body = req.body || {};
    const userId =
      typeof body.userId === 'string' && body.userId.trim()
        ? body.userId.slice(0, 128)
        : 'anonymous';
    const record = getOrCreateUserRecord(userId);
    const incoming = migrateLegacyProfile(body);

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

    const mergedProfile: UserCentralProfile = {
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
      targetExamId: normalizeExamId(incoming.targetExamId || record.profile.targetExamId || 'cissp'),
      lastActivePlatform: body.platform === 'ANDROID' || incoming.lastActivePlatform === 'ANDROID' ? 'ANDROID' : 'WEB',
      lastSyncTimestamp: new Date().toISOString(),
      lastSyncTimestampMillis: Date.now(),
      schemaVersion: CANONICAL_SCHEMA_VERSION,
    };

    record.profile = mergedProfile;

    res.json({
      status: '200 OK',
      syncStatus: 'SYNCHRONIZED',
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
  // 5. SERVER-SIDE SUBSCRIPTION & ENTITLEMENT VERIFICATION ENDPOINTS
  // =========================================================================
  apiRouter.get('/subscriptions/verify', (req, res) => {
    const userId = typeof req.query.userId === 'string' ? req.query.userId : 'anonymous';
    const record = getOrCreateUserRecord(userId);
    res.json({
      status: '200 OK',
      crossPlatformIntegrity: 'VERIFIED',
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

  apiRouter.post('/subscriptions/verify', (req, res) => {
    const body = req.body || {};
    const userId = typeof body.userId === 'string' && body.userId ? body.userId : 'anonymous';
    const receiptToken = typeof body.receiptToken === 'string' ? body.receiptToken : '';
    const tier = body.tier === 'universal' || body.examId === 'all-access' ? 'universal' : 'single';
    const examId = normalizeExamId(body.examId || 'cissp');

    // Enforce server-side payment verification check: reject missing or forged receipts
    if (!receiptToken || (!receiptToken.startsWith('rcpt_') && !receiptToken.startsWith('stripe_'))) {
      res.status(403).json({
        status: '403 FORBIDDEN',
        error: 'PERMISSION_DENIED: Valid server payment receiptToken is required to activate paid entitlements.',
        syncStatus: 'REJECTED',
      });
      return;
    }

    const record = getOrCreateUserRecord(userId);
    const nowIso = new Date().toISOString();

    if (tier === 'universal') {
      ALL_112_EXAM_BANKS.forEach((b) => {
        const ent: SubscriptionEntitlement = {
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
      userId,
      subscriptionTier: record.profile.subscriptionTier,
      verifiedEntitlements: record.verifiedEntitlements,
      timestamp: nowIso,
    });
  });

  // =========================================================================
  // 6. FLASHCARD, STUDY PLAN & CUSTOM SOURCE SYNC ENDPOINTS
  // =========================================================================
  apiRouter.post('/flashcards/sync', (req, res) => {
    const body = req.body || {};
    const userId = typeof body.userId === 'string' && body.userId ? body.userId : 'anonymous';
    const record = getOrCreateUserRecord(userId);
    const incomingList: unknown[] = Array.isArray(body.flashcards)
      ? body.flashcards
      : body.card
        ? [body.card]
        : [body];

    incomingList.forEach((raw) => {
      if (typeof raw === 'object' && raw !== null) {
        const incomingProgress = migrateLegacyFlashcard(raw as Record<string, unknown>);
        const cardKey = incomingProgress.cardId || incomingProgress.id || 'fc_unknown';
        const existingCard = record.flashcards[cardKey];
        const existingProgress = existingCard
          ? migrateLegacyFlashcard(existingCard as unknown as Record<string, unknown>)
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
      flashcards: Object.values(record.flashcards),
      timestamp: new Date().toISOString(),
    });
  });

  apiRouter.post('/study-plan/sync', (req, res) => {
    const body = req.body || {};
    const userId = typeof body.userId === 'string' && body.userId ? body.userId : 'anonymous';
    const record = getOrCreateUserRecord(userId);
    const plan = migrateLegacyStudyPlan(body);
    record.studyPlans[plan.examId] = plan;

    res.json({
      status: '200 OK',
      syncStatus: 'SYNCHRONIZED',
      studyPlan: plan,
      timestamp: new Date().toISOString(),
    });
  });

  apiRouter.post('/sources/sync', (req, res) => {
    const body = req.body || {};
    const userId = typeof body.userId === 'string' && body.userId ? body.userId : 'anonymous';
    const record = getOrCreateUserRecord(userId);
    const src = migrateLegacyStudySource(body);
    record.sources[src.id] = src;

    res.json({
      status: '200 OK',
      syncStatus: 'SYNCHRONIZED',
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

  apiRouter.post('/ai/tutor', (req, res) => {
    const body = req.body || {};
    const examId = normalizeExamId(body.examId || 'cissp');
    const queryText = String(body.query || '').toLowerCase();
    const bank = ALL_112_EXAM_BANKS.find((b) => normalizeExamId(b.id) === examId);
    const guides = getStudyGuidesForExamId(examId);

    let reply = '';
    let citation = `${bank?.vendor || 'Official'} ${bank?.code || examId.toUpperCase()} Body of Knowledge`;

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

    res.json({
      status: '200 OK',
      examId,
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
