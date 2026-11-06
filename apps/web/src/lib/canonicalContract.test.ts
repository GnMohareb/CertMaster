import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  CANONICAL_SCHEMA_VERSION,
  FIREBASE_PROJECT_ID,
  FIRESTORE_DATABASE_ID,
  normalizeExamId,
  matchesExamId,
  getExamContentStatus,
  getExamBundledContentAudit,
  classifyExamContentAvailability,
  classifyBehavioralArchetype,
  calculateSimulationBehavioralStress,
  calculateDomainStressScore,
  calculateReadinessAndStudyPlan,
  flashcardBoxToState,
  flashcardStateToBox,
  resolveFlashcardConflict,
  resolveSubscriptionStatusConflict,
  migrateLegacyProfile,
  migrateLegacyAttempt,
  migrateLegacyFlashcard,
  migrateLegacyStudyPlan,
  migrateLegacyStudySource,
} from './canonicalContract';
import { ALL_112_EXAM_BANKS } from '../data/examBanks';
import {
  DIRTY_DOZEN_SECURITY_TESTS,
  evaluateSecurityRuleScenario,
} from '../../firestore.rules.test';
import {
  getQuestionsForExamId,
  getFlashcardsForExamId,
  getStudyGuidesForExamId,
  MULTI_EXAM_FLASHCARDS,
} from '../data/multiExamQuestions';
import {
  createCertMasterApiApp,
  createSignedBearerToken,
  revokeBearerToken,
  createPaymentWebhookSignature,
  verifyBearerToken,
  setFirebaseJwksForTesting,
} from '../../server';
import { generateKeyPair, SignJWT, exportJWK, createLocalJWKSet } from 'jose';

// Test-only secrets, generated per run. Production secrets come only from the deployment environment.
process.env.CERTMASTER_AUTH_SIGNING_SECRET = 'test-' + crypto.randomUUID() + crypto.randomUUID();
process.env.CERTMASTER_PAYMENT_WEBHOOK_SECRET = 'test-' + crypto.randomUUID() + crypto.randomUUID();
process.env.CERTMASTER_ALLOW_SANDBOX_PAYMENTS = 'true';

test('1. Canonical Schema Version & Shared Firebase Identifiers', () => {
  assert.equal(CANONICAL_SCHEMA_VERSION, 2);
  assert.equal(FIREBASE_PROJECT_ID, 'gen-lang-client-0788513176');
  assert.equal(
    FIRESTORE_DATABASE_ID,
    'ai-studio-certmasterwebpla-ad2ba0f9-3a61-45af-b60a-14f5eb4f6001'
  );
});

test('2. Cross-Platform Exam Identifier Normalization & Alias Matching', () => {
  // AWS Solutions Architect Associate aliases
  assert.equal(normalizeExamId('aws_csa'), 'aws-saa');
  assert.equal(normalizeExamId('aws-saa'), 'aws-saa');
  assert.equal(normalizeExamId('SAA-C03'), 'aws-saa');
  assert.equal(matchesExamId('aws_csa', 'aws-saa'), true);

  // CompTIA Security+ aliases (resolves internal Web sy0-701 vs sec-plus & Android sec_plus)
  assert.equal(normalizeExamId('sec_plus'), 'sec-plus');
  assert.equal(normalizeExamId('sy0-701'), 'sec-plus');
  assert.equal(normalizeExamId('sec-plus'), 'sec-plus');
  assert.equal(normalizeExamId('security_plus'), 'sec-plus');
  assert.equal(matchesExamId('sec_plus', 'sy0-701'), true);
  assert.equal(matchesExamId('sec_plus', 'sec-plus'), true);

  // Additional CompTIA & Red Hat aliases
  assert.equal(normalizeExamId('n10-008'), 'net-plus');
  assert.equal(normalizeExamId('cysa-003'), 'cysa-plus');
  assert.equal(normalizeExamId('cy0-003'), 'cysa-plus');
  assert.equal(normalizeExamId('pt0-002'), 'pentest-plus');
  assert.equal(normalizeExamId('cas-004'), 'casp-plus');
  assert.equal(normalizeExamId('rhcsa-ex200'), 'rhcsa');
  assert.equal(normalizeExamId('rhce-ex294'), 'rhce');

  // Verify ALL_112_EXAM_BANKS has Security+ standardized to 'sec-plus'
  const secPlusBank = ALL_112_EXAM_BANKS.find((b) => b.code === 'SY0-701');
  assert.ok(secPlusBank, 'CompTIA Security+ bank must exist in ALL_112_EXAM_BANKS');
  assert.equal(secPlusBank.id, 'sec-plus');

  // Evidence-based content availability truthfulness (no sample-content exam labeled FULL_PREPARATION_AVAILABLE)
  assert.equal(getExamContentStatus('cissp'), 'SAMPLE_CONTENT_AVAILABLE');
  assert.equal(getExamContentStatus('aws_csa'), 'SAMPLE_CONTENT_AVAILABLE');
  assert.equal(getExamContentStatus('sec_plus'), 'SAMPLE_CONTENT_AVAILABLE');
  assert.equal(getExamContentStatus('gcp-pca'), 'CATALOG_PREVIEW');
  assert.equal(
    classifyExamContentAvailability({
      questionCount: 120,
      studyGuideCount: 4,
      flashcardCount: 30,
      audioBriefingCount: 2,
      domainCount: 8,
    }),
    'FULL_PREPARATION_AVAILABLE'
  );
  assert.equal(
    classifyExamContentAvailability({
      questionCount: 40,
      studyGuideCount: 2,
      flashcardCount: 10,
      audioBriefingCount: 1,
      domainCount: 6,
    }),
    'LIMITED_PREPARATION'
  );
  assert.equal(
    classifyExamContentAvailability({
      questionCount: 8,
      studyGuideCount: 4,
      flashcardCount: 8,
      audioBriefingCount: 3,
      domainCount: 8,
    }),
    'SAMPLE_CONTENT_AVAILABLE'
  );
  assert.equal(
    classifyExamContentAvailability({
      questionCount: 0,
      studyGuideCount: 0,
      flashcardCount: 0,
      audioBriefingCount: 0,
      domainCount: 5,
    }),
    'CATALOG_PREVIEW'
  );
  assert.equal(
    classifyExamContentAvailability({
      questionCount: 0,
      studyGuideCount: 0,
      flashcardCount: 0,
      audioBriefingCount: 0,
      domainCount: 0,
    }),
    'CONTENT_COMING_SOON'
  );
});

test('3. Behavioral Archetype & Stress Classification Parity with Android AuthoritativeMetricsEngine', () => {
  // 1. Confident Master: score >= 85, avgLatency < 40, totalSwitches <= 2 -> stress 35
  const master = classifyBehavioralArchetype(90, 32, 1, 5, 10);
  assert.equal(master.archetype, 'Confident Master');
  assert.equal(master.cognitiveStressBaseline, 35);
  assert.equal(master.distractorEliminationRate, 0.17);
  assert.equal(master.optionSwitchCountAvg, 0.1);

  // 2. Deliberate Strategist: totalEliminations >= 6, score >= 70 -> stress 54
  const strategist = classifyBehavioralArchetype(80, 42, 2, 12, 10);
  assert.equal(strategist.archetype, 'Deliberate Strategist');
  assert.equal(strategist.cognitiveStressBaseline, 54);
  assert.equal(strategist.distractorEliminationRate, 0.4);

  // 3. Fast Guesser: avgLatency < 22, score < 70 -> stress 72
  const guesser = classifyBehavioralArchetype(50, 15, 1, 2, 10);
  assert.equal(guesser.archetype, 'Fast Guesser');
  assert.equal(guesser.cognitiveStressBaseline, 72);

  // 4. Analytical Hesitator: avgLatency >= 45 || totalSwitches >= 4 -> stress 68
  const hesitator = classifyBehavioralArchetype(74, 54, 5, 4, 10);
  assert.equal(hesitator.archetype, 'Analytical Hesitator');
  assert.equal(hesitator.cognitiveStressBaseline, 68);
  assert.equal(hesitator.optionSwitchCountAvg, 0.5);

  // 5. Methodical Verifier: balanced fallback -> stress 50
  const verifier = classifyBehavioralArchetype(75, 35, 2, 3, 10);
  assert.equal(verifier.archetype, 'Methodical Verifier');
  assert.equal(verifier.cognitiveStressBaseline, 50);
});

test('4. Simulation Stress & Domain Stress Formula Parity with Android', () => {
  // Simulation stress: min(100, max(30, 50 + totalSwitches * 5 - (passed ? 15 : 0)))
  assert.equal(calculateSimulationBehavioralStress(0, true), 35);
  assert.equal(calculateSimulationBehavioralStress(2, true), 45);
  assert.equal(calculateSimulationBehavioralStress(4, false), 70);
  assert.equal(calculateSimulationBehavioralStress(15, false), 100);

  // Domain stress: (100 - accuracy) * 0.55 + flagRate * 0.25 + max(0, avgSec - 45)/60 * 20
  const highAttention = calculateDomainStressScore(45, 65, 94);
  assert.equal(highAttention.stressScore, 62);
  assert.equal(highAttention.stressLevel, 'HIGH_ATTENTION');

  const severeCritical = calculateDomainStressScore(30, 80, 105);
  assert.equal(severeCritical.stressLevel, 'CRITICAL_STRESS');
  assert.ok(severeCritical.stressScore >= 70);

  const mastered = calculateDomainStressScore(96, 0, 35);
  assert.equal(mastered.stressLevel, 'MASTERED');
});

test('5. Authoritative Readiness (60/25/15) & 5-Stage Mastery Plan Calculation', () => {
  const report = calculateReadinessAndStudyPlan({
    userId: 'usr_test_01',
    examId: 'aws_csa',
    passingScorePercent: 72,
    assessmentCompleted: true,
    assessmentScorePercent: 76,
    cognitiveStressBaseline: 54,
    simulationScoresPercent: [70, 78, 84],
    knownFlashcardsCount: 8,
    totalFlashcardsCount: 10,
    weakestDomainId: 'd2',
    weakestDomainName: 'Design Resilient Architectures',
    weakestDomainScore: 74,
  });

  // Normalized examId
  assert.equal(report.examId, 'aws-saa');
  // avgSim = round((70+78+84)/3) = 77; readiness = round(77*0.6 + 76*0.25 + 80*0.15) = round(46.2 + 19 + 12) = 77
  assert.equal(report.readinessPercent, 77);
  assert.equal(report.passGuaranteeQualified, true);
  assert.equal(report.currentJourneyStage, 5);
  assert.equal(report.milestones.length, 5);
  assert.equal(report.milestones[0].status, 'COMPLETED');
  assert.equal(report.milestones[3].status, 'COMPLETED');
});

test('6. Flashcard Leitner Box Mapping & Conflict Resolution', () => {
  assert.equal(flashcardBoxToState(1), 'unstudied');
  assert.equal(flashcardBoxToState(2), 'needs_review');
  assert.equal(flashcardBoxToState(3), 'known');
  assert.equal(flashcardBoxToState(5), 'known');

  assert.equal(flashcardStateToBox('unstudied'), 1);
  assert.equal(flashcardStateToBox('needs_review'), 2);
  assert.equal(flashcardStateToBox('known'), 3);
  assert.equal(flashcardStateToBox('known', 5), 5);

  const olderCard = migrateLegacyFlashcard({
    id: 'fc-1',
    examId: 'cissp',
    boxLevel: 4,
    lastReviewedEpoch: 1000,
  });
  const newerCard = migrateLegacyFlashcard({
    id: 'fc-1',
    examId: 'cissp',
    boxLevel: 2,
    lastReviewedEpoch: 2000,
  });
  const resolved = resolveFlashcardConflict(olderCard, newerCard);
  assert.equal(resolved.boxLevel, 2);
  assert.equal(resolved.state, 'needs_review');
});

test('7. Non-Destructive Legacy v1 -> v2 Data Migrations (Android & Web Payloads)', () => {
  // Migrate Android-style profile with array subscriptions and legacy IDs ('aws_csa', 'sec_plus', 'TRIAL_ACTIVE')
  const migratedProfile = migrateLegacyProfile({
    userId: 'usr_legacy_01',
    email: 'student@example.com',
    displayName: 'Legacy Learner',
    targetExamId: 'sy0-701',
    behavioralArchetype: 'Deliberate Strategist',
    subscriptions: [
      { examId: 'aws_csa', status: 'ACTIVE', subscribedPlatform: 'ANDROID' },
      { examId: 'sec_plus', status: 'TRIAL_ACTIVE', subscribedPlatform: 'WEB' },
      { examId: 'sy0-701', status: 'ACTIVE', subscribedPlatform: 'WEB' },
    ],
  });

  assert.equal(migratedProfile.schemaVersion, 2);
  assert.equal(migratedProfile.targetExamId, 'sec-plus');
  assert.equal(migratedProfile.behavioralArchetype.name, 'Deliberate Strategist');
  assert.equal(migratedProfile.subscriptions['aws-saa']?.status, 'ACTIVE');
  // Conflict between sec_plus (TRIAL_ACTIVE) and sy0-701 (ACTIVE) resolves to ACTIVE under canonical key 'sec-plus'
  assert.equal(migratedProfile.subscriptions['sec-plus']?.status, 'ACTIVE');
  assert.equal(resolveSubscriptionStatusConflict('TRIAL_ACTIVE', 'LOCKED'), 'TRIAL');

  // Migrate Android-style attempt with domainScoresJson array
  const migratedAttempt = migrateLegacyAttempt({
    sessionId: 'sim_99',
    examId: 'aws_csa',
    overallScorePercent: 82,
    isPassed: true,
    timeSpentSeconds: 2400,
    totalQuestions: 20,
    domainScoresJson: JSON.stringify([
      { domainId: 'd1', domainName: 'Secure Architectures', scorePercent: 85, correctCount: 17, totalCount: 20 },
    ]),
  });

  assert.equal(migratedAttempt.schemaVersion, 2);
  assert.equal(migratedAttempt.attemptId, 'sim_99');
  assert.equal(migratedAttempt.examId, 'aws-saa');
  assert.equal(migratedAttempt.scorePercent, 82);
  assert.equal(migratedAttempt.timeSpentMinutes, 40);
  assert.equal(migratedAttempt.domainScores['Secure Architectures'], 85);

  // Migrate legacy study plan & source
  const plan = migrateLegacyStudyPlan({
    examId: 'sy0-701',
    milestonesJson: JSON.stringify([{ stage: 1, stageName: 'Diagnostic', status: 'COMPLETED', description: 'Done' }]),
  });
  assert.equal(plan.schemaVersion, 2);
  assert.equal(plan.examId, 'sec-plus');
  assert.equal(plan.milestones?.length, 1);

  const source = migrateLegacyStudySource({
    id: 'src-1',
    examId: 'aws_csa',
    title: 'VPC Endpoint Notes',
  });
  assert.equal(source.schemaVersion, 2);
  assert.equal(source.examId, 'aws-saa');
});

test('8. Firestore Security Rules Parity & Adversarial Entitlement Protection', () => {
  const webRulesPath = path.resolve(process.cwd(), 'firestore.rules');
  const androidRulesPath = path.resolve(process.cwd(), '../android/firestore.rules');
  const webRules = fs.readFileSync(webRulesPath, 'utf-8');
  const androidRules = fs.readFileSync(androidRulesPath, 'utf-8');

  // Verify Web and Android rules are identical
  assert.equal(webRules, androidRules, 'apps/web/firestore.rules and apps/android/firestore.rules must be identical');

  // Verify client cannot self-activate paid subscriptions or escalate subscriptionTier
  assert.ok(
    webRules.includes("incoming().subscriptionTier == 'Free Trial'"),
    'Profile creation must enforce Free Trial tier'
  );
  assert.ok(
    webRules.includes("data.status in ['EXPIRED', 'TRIAL', 'TRIAL_ACTIVE', 'LOCKED']"),
    'Client subscription/entitlement writes must disallow paid ACTIVE status'
  );

  // Execute all 14 Dirty Dozen + Entitlement Protection security scenarios
  assert.equal(DIRTY_DOZEN_SECURITY_TESTS.length, 14);
  for (const scenario of DIRTY_DOZEN_SECURITY_TESTS) {
    const outcome = evaluateSecurityRuleScenario(scenario);
    assert.equal(
      outcome,
      scenario.expectedOutcome,
      `Security rule scenario ${scenario.id} (${scenario.name}) failed`
    );
  }
});

test('9. Evidence-Based Certification Content Integrity Across All 112 Exam Banks', () => {
  assert.equal(ALL_112_EXAM_BANKS.length, 112);

  const sampleBanks = ALL_112_EXAM_BANKS.filter(
    (b) => b.contentStatus === 'SAMPLE_CONTENT_AVAILABLE'
  );
  const fullPrepBanks = ALL_112_EXAM_BANKS.filter(
    (b) => b.contentStatus === 'FULL_PREPARATION_AVAILABLE' || b.contentStatus === 'FULL_PREP'
  );
  const previewBanks = ALL_112_EXAM_BANKS.filter((b) => b.contentStatus === 'CATALOG_PREVIEW');

  // Verify no sample-content certification is falsely labeled FULL_PREPARATION_AVAILABLE
  assert.equal(fullPrepBanks.length, 0);
  assert.equal(sampleBanks.length, 6);
  assert.equal(previewBanks.length, 106);

  const expectedCounts: Record<string, number> = {
    cissp: 8,
    'aws-saa': 5,
    'sec-plus': 5,
    pmp: 3,
    cism: 3,
    ceh: 3,
  };

  // Verify each SAMPLE_CONTENT_AVAILABLE certification returns its exact verified question count, flashcards, and study guides
  for (const bank of sampleBanks) {
    const questions = getQuestionsForExamId(bank.id);
    const audit = getExamBundledContentAudit(bank.id);
    assert.equal(
      questions.length,
      expectedCounts[bank.id],
      `Expected ${expectedCounts[bank.id]} verified questions for ${bank.id}`
    );
    assert.equal(
      bank.questionsCount,
      questions.length,
      `Catalog questionsCount (${bank.questionsCount}) must match actual bundled questions (${questions.length}) for ${bank.id}`
    );
    assert.equal(audit.questionCount, questions.length);
    for (const q of questions) {
      assert.equal(
        normalizeExamId(q.examId),
        bank.id,
        `Question ${q.id} in bank ${bank.id} has mismatched examId ${q.examId}`
      );
    }
    const cards = getFlashcardsForExamId(MULTI_EXAM_FLASHCARDS, bank.id);
    assert.ok(cards.length > 0, `Expected flashcards for ${bank.id}`);
    const guides = getStudyGuidesForExamId(bank.id);
    assert.ok(guides.length > 0, `Expected study guides for ${bank.id}`);
  }

  // Verify CATALOG_PREVIEW exams report 0 bundled questions and never return CISSP questions
  for (const bank of previewBanks) {
    assert.equal(bank.questionsCount, 0);
    const questions = getQuestionsForExamId(bank.id);
    assert.equal(
      questions.length,
      0,
      `Catalog preview exam ${bank.id} must not return fake CISSP questions`
    );
  }
});

test('10. Backend Security Verification: Bearer Auth, UID Ownership, Cryptographic Webhook & Sandbox Payment Gate', async () => {
  const app = createCertMasterApiApp();
  const server = app.listen(0);
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 3099;
  const baseUrl = `http://127.0.0.1:${port}/api`;

  const studentUid = 'usr_security_test_01';
  const otherUid = 'usr_attacker_99';
  const validToken = createSignedBearerToken(studentUid);
  const expiredToken = createSignedBearerToken(studentUid, -60_000);
  const revokedToken = createSignedBearerToken(studentUid, 60_000);
  revokeBearerToken(revokedToken);
  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${validToken}`,
  };

  try {
    // 1. Health & Catalog Manifest (public discovery)
    const healthRes = await fetch(`${baseUrl}/health`).then((r) => r.json());
    assert.equal(healthRes.schemaVersion, 2);
    assert.equal(healthRes.firebaseProjectId, FIREBASE_PROJECT_ID);
    assert.equal(healthRes.firestoreDatabaseId, FIRESTORE_DATABASE_ID);

    // 2. Reject unauthenticated request (missing Bearer token -> 401)
    const unauthProfile = await fetch(`${baseUrl}/profile/${studentUid}`);
    assert.equal(unauthProfile.status, 401);

    // 3. Reject expired token (401) and revoked token (401)
    const expiredRes = await fetch(`${baseUrl}/profile/${studentUid}`, {
      headers: { Authorization: `Bearer ${expiredToken}` },
    });
    assert.equal(expiredRes.status, 401);

    const revokedRes = await fetch(`${baseUrl}/profile/${studentUid}`, {
      headers: { Authorization: `Bearer ${revokedToken}` },
    });
    assert.equal(revokedRes.status, 401);

    // 4. Reject cross-user profile read & write (authenticated as studentUid, targeting otherUid -> 403)
    const crossReadRes = await fetch(`${baseUrl}/profile/${otherUid}`, {
      headers: authHeaders,
    });
    assert.equal(crossReadRes.status, 403);

    const crossWriteRes = await fetch(`${baseUrl}/profile/sync`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        userId: otherUid,
        displayName: 'Cross Account Tamper',
      }),
    });
    assert.equal(crossWriteRes.status, 403);

    // 5. Reject forged client receipt with prefix 'rcpt_...' when no cryptographic signature is present (403)
    const forgedRcptRes = await fetch(`${baseUrl}/subscriptions/verify`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        userId: studentUid,
        examId: 'aws-saa',
        receiptToken: 'rcpt_forged_prefix_bypass_attempt',
      }),
    });
    assert.equal(forgedRcptRes.status, 403);

    // 6. Reject unverified client attempt to self-escalate subscriptionTier via /profile/sync
    const unverifiedProfileSync = await fetch(`${baseUrl}/profile/sync`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        userId: studentUid,
        displayName: 'Cross Platform Student',
        subscriptionTier: 'Universal Multi-Pass',
        subscriptions: {
          'aws-saa': { examId: 'aws-saa', status: 'ACTIVE', platform: 'ANDROID' },
        },
        platform: 'ANDROID',
      }),
    }).then((r) => r.json());

    assert.equal(unverifiedProfileSync.validatedProfile.subscriptionTier, 'Free Trial');
    assert.equal(unverifiedProfileSync.validatedProfile.subscriptions['aws-saa'].status, 'TRIAL');

    // 7. Cryptographically signed production webhook (X-CertMaster-Webhook-Signature) grants ACTIVE entitlement
    const prodSignature = createPaymentWebhookSignature(
      studentUid,
      'aws_csa',
      'single',
      'stripe_pi_live_verified_991'
    );
    const prodSubRes = await fetch(`${baseUrl}/subscriptions/verify`, {
      method: 'POST',
      headers: {
        ...authHeaders,
        'X-CertMaster-Webhook-Signature': prodSignature,
      },
      body: JSON.stringify({
        userId: studentUid,
        examId: 'aws_csa',
        tier: 'single',
        receiptToken: 'stripe_pi_live_verified_991',
        platform: 'WEB',
      }),
    });
    assert.equal(prodSubRes.status, 200);
    const prodSubJson = await prodSubRes.json();
    assert.equal(prodSubJson.verificationMode, 'PRODUCTION_CRYPTO_VERIFIED');
    assert.equal(prodSubJson.verifiedEntitlements['aws-saa'].status, 'ACTIVE');
    assert.equal(prodSubJson.subscriptionTier, 'Single-Exam Pass');

    // 8. Explicitly labeled Sandbox Mode verification works ONLY when X-CertMaster-Sandbox-Mode: true is passed
    const sandboxSubRes = await fetch(`${baseUrl}/subscriptions/verify`, {
      method: 'POST',
      headers: {
        ...authHeaders,
        'X-CertMaster-Sandbox-Mode': 'true',
      },
      body: JSON.stringify({
        userId: studentUid,
        examId: 'sec_plus',
        tier: 'single',
        receiptToken: 'sandbox_rcpt_verified_dev_001',
        platform: 'ANDROID',
      }),
    });
    assert.equal(sandboxSubRes.status, 200);
    const sandboxSubJson = await sandboxSubRes.json();
    assert.equal(sandboxSubJson.verificationMode, 'SANDBOX_TEST_ONLY');
    assert.equal(sandboxSubJson.verifiedEntitlements['sec-plus'].status, 'ACTIVE');

    // 9. Grounded AI Tutor explicitly reports provider metadata (LOCAL_GROUNDED_FALLBACK when GEMINI_API_KEY absent)
    const tutorRes = await fetch(`${baseUrl}/ai/tutor`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        examId: 'aws_csa',
        query: 'How does a Gateway VPC Endpoint work for Amazon S3?',
      }),
    }).then((r) => r.json());
    assert.equal(tutorRes.examId, 'aws-saa');
    assert.ok(tutorRes.answer.includes('Gateway VPC Endpoint'));
    assert.ok(
      tutorRes.provider === 'LOCAL_GROUNDED_FALLBACK' || tutorRes.provider === 'GEMINI_LIVE'
    );
    assert.equal(typeof tutorRes.isSimulatedFallback, 'boolean');
    assert.ok(Array.isArray(tutorRes.citations) && tutorRes.citations.length > 0);

    // 10. Continuous QIS Ingestion: Securely ingests dynamic questions and serves them dynamically
    const qisIngestPayload = {
      examId: 'aws_csa',
      questions: [
        {
          id: 'qis-aws-dyn-001',
          prompt: 'What is the most cost-effective storage class for rarely accessed objects that require millisecond retrieval?',
          options: [
            { id: 'opt_a', letter: 'A', text: 'S3 Standard' },
            { id: 'opt_b', letter: 'B', text: 'S3 Standard-IA' },
            { id: 'opt_c', letter: 'C', text: 'S3 Glacier Flexible' },
            { id: 'opt_d', letter: 'D', text: 'S3 Glacier Deep Archive' }
          ],
          correctOptionId: 'opt_b',
          domain: 'Design Cost-Optimized Architectures',
          domainNumber: 3,
          difficulty: 'Intermediate',
          explanation: 'S3 Standard-IA is designed for data that is accessed less frequently, but requires rapid access when needed.',
          source_evidence: 'AWS Storage Whitepaper'
        }
      ]
    };

    const ingestRes = await fetch(`${baseUrl}/qis/ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(qisIngestPayload)
    });
    assert.equal(ingestRes.status, 200);
    const ingestJson = await ingestRes.json();
    assert.equal(ingestJson.status, '200 OK');
    assert.equal(ingestJson.examId, 'aws-saa');
    assert.equal(ingestJson.ingestedCount, 1);

    // Verify dynamic questions appear in GET /api/exams/:examId/questions
    const dynamicQuestions = await fetch(`${baseUrl}/exams/aws-saa/questions`).then(r => r.json());
    assert.ok(dynamicQuestions.some((q: any) => q.id === 'qis-aws-dyn-001'));

  } finally {
    server.close();
  }
});

test('11. End-to-End Cross-Platform Synchronization Suite (Scenarios A, B, C, and D)', async () => {
  const app = createCertMasterApiApp();
  const server = app.listen(0);
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 3099;
  const baseUrl = `http://127.0.0.1:${port}/api`;

  const sharedUid = 'usr_e2e_unified_student_01';
  const token = createSignedBearerToken(sharedUid);
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  try {
    // =========================================================================
    // SCENARIO A: ANDROID-TO-WEB SYNCHRONIZATION
    // 1. Authenticate on Android -> 2. Select AWS-SAA -> 3. Complete exam ->
    // 4. Review flashcards -> 5. Update study plan -> 6. Sync ->
    // 7. Open Web with same account -> 8. Verify identical data on Web
    // =========================================================================
    const androidExamAttempt = {
      userId: sharedUid,
      attemptId: 'att_scenario_a_android_01',
      examId: 'aws_csa', // Android legacy alias normalized to aws-saa
      mode: 'FULL_SIMULATION',
      scorePercent: 84,
      totalQuestions: 20,
      correctAnswers: 17,
      timeSpentSeconds: 1420,
      optionSwitchCount: 2,
      eliminatedDistractorsCount: 9,
      averageLatencySeconds: 34,
      domainScores: {
        d1: {
          domainId: 'd1',
          domainName: 'Design Secure Architectures',
          correct: 9,
          total: 10,
          percent: 90,
        },
        d2: {
          domainId: 'd2',
          domainName: 'Design Resilient Architectures',
          correct: 8,
          total: 10,
          percent: 80,
        },
      },
      platform: 'ANDROID',
    };

    const androidAttemptRes = await fetch(`${baseUrl}/exams/aws_csa/sessions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(androidExamAttempt),
    }).then((r) => r.json());
    assert.equal(androidAttemptRes.syncStatus, 'SYNCHRONIZED');
    assert.equal(androidAttemptRes.deduplicated, false);
    assert.equal(androidAttemptRes.session.examId, 'aws-saa');

    // Android reviews flashcards (Leitner Box 4 -> known, Box 2 -> needs_review)
    const androidFlashcardsRes = await fetch(`${baseUrl}/flashcards/sync`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        userId: sharedUid,
        platform: 'ANDROID',
        cards: [
          {
            cardId: 'fc-aws-1',
            examId: 'aws_csa',
            domainId: 'd1',
            boxLevel: 4,
            state: 'known',
            lastReviewedEpochMillis: 1730000100000,
          },
          {
            cardId: 'fc-aws-2',
            examId: 'aws_csa',
            domainId: 'd2',
            boxLevel: 2,
            state: 'needs_review',
            lastReviewedEpochMillis: 1730000100000,
          },
        ],
      }),
    }).then((r) => r.json());
    assert.equal(androidFlashcardsRes.syncStatus, 'SYNCHRONIZED');

    // Android updates Study Plan & Readiness
    const androidPlan = calculateReadinessAndStudyPlan({
      userId: sharedUid,
      examId: 'aws_csa',
      passingScorePercent: 72,
      assessmentCompleted: true,
      assessmentScorePercent: 80,
      cognitiveStressBaseline: 45,
      simulationScoresPercent: [84],
      knownFlashcardsCount: 1,
      totalFlashcardsCount: 2,
      weakestDomainId: 'd2',
      weakestDomainName: 'Design Resilient Architectures',
      weakestDomainScore: 80,
    });
    const androidPlanRes = await fetch(`${baseUrl}/study-plan/sync`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        userId: sharedUid,
        examId: 'aws_csa',
        studyPlan: androidPlan,
      }),
    }).then((r) => r.json());
    assert.equal(androidPlanRes.syncStatus, 'SYNCHRONIZED');

    // Android syncs profile with active AWS-SAA selection
    await fetch(`${baseUrl}/profile/sync`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        userId: sharedUid,
        email: 'e2e.student@certmaster.io',
        displayName: 'Unified E2E Student',
        activeExamId: 'aws_csa',
        assessmentCompleted: true,
        assessmentScorePercent: 80,
        cognitiveStressBaseline: 45,
        behavioralArchetype: 'Deliberate Strategist',
        completedSimulationsCount: 1,
        highestSimulationScore: 84,
        platform: 'ANDROID',
      }),
    });

    // Open Web Platform with same account & verify identical data
    const webPullAfterA = await fetch(`${baseUrl}/profile/${sharedUid}`, { headers }).then((r) =>
      r.json()
    );
    assert.equal(webPullAfterA.profile.activeExamId, 'aws-saa');
    assert.equal(webPullAfterA.profile.highestSimulationScore, 84);
    assert.equal(webPullAfterA.attempts.length, 1);
    assert.equal(webPullAfterA.attempts[0].attemptId, 'att_scenario_a_android_01');
    assert.equal(webPullAfterA.attempts[0].examId, 'aws-saa');
    assert.equal(webPullAfterA.attempts[0].scorePercent, 84);
    assert.equal(webPullAfterA.flashcardsById['fc-aws-1'].state, 'known');
    assert.equal(webPullAfterA.flashcardsById['fc-aws-1'].boxLevel, 4);
    assert.equal(
      webPullAfterA.studyPlansByExamId['aws-saa'].readinessPercent,
      androidPlan.readinessPercent
    );

    // =========================================================================
    // SCENARIO B: WEB-TO-ANDROID SYNCHRONIZATION
    // 1. Authenticate on Web -> 2. Switch active cert to CompTIA Security+ (sy0-701) ->
    // 3. Complete practice session -> 4. Add custom study note -> 5. Update flashcards ->
    // 6. Sync -> 7. Open Android with same account -> 8. Verify identical data
    // =========================================================================
    await fetch(`${baseUrl}/profile/sync`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        userId: sharedUid,
        activeExamId: 'sy0-701', // Web alias normalized to sec-plus
        completedSimulationsCount: 2,
        highestSimulationScore: 90,
        platform: 'WEB',
      }),
    });

    await fetch(`${baseUrl}/exams/sy0-701/sessions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        userId: sharedUid,
        attemptId: 'att_scenario_b_web_02',
        examId: 'sy0-701',
        mode: 'PRACTICE',
        scorePercent: 90,
        totalQuestions: 10,
        correctAnswers: 9,
        timeSpentSeconds: 600,
        platform: 'WEB',
      }),
    });

    await fetch(`${baseUrl}/sources/sync`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        userId: sharedUid,
        sourceId: 'src_web_secplus_zero_trust',
        examId: 'sy0-701',
        domainId: 'd2',
        domainName: 'Security Architecture',
        title: 'Zero Trust Policy Enforcement Points',
        type: 'CHEAT_SHEET',
        summary: 'PDP vs PEP in NIST SP 800-207',
        fullContent: 'Policy Decision Point evaluates continuous trust signals before PEP grants access.',
      }),
    });

    await fetch(`${baseUrl}/flashcards/sync`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        userId: sharedUid,
        platform: 'WEB',
        cards: [
          {
            cardId: 'fc-sec-1',
            examId: 'sy0-701',
            domainId: 'd1',
            boxLevel: 3,
            state: 'known',
            lastReviewedEpochMillis: 1730000200000,
          },
        ],
      }),
    });

    // Open Android and pull synchronized state
    const androidPullAfterB = await fetch(`${baseUrl}/profile/${sharedUid}`, { headers }).then(
      (r) => r.json()
    );
    assert.equal(androidPullAfterB.profile.activeExamId, 'sec-plus');
    assert.equal(androidPullAfterB.profile.highestSimulationScore, 90);
    assert.equal(androidPullAfterB.attempts.length, 2);
    assert.ok(
      androidPullAfterB.attempts.some(
        (a: { attemptId: string; examId: string }) =>
          a.attemptId === 'att_scenario_b_web_02' && a.examId === 'sec-plus'
      )
    );
    assert.equal(androidPullAfterB.sources.length, 1);
    assert.equal(androidPullAfterB.sources[0].examId, 'sec-plus');
    assert.equal(androidPullAfterB.sources[0].title, 'Zero Trust Policy Enforcement Points');
    assert.equal(androidPullAfterB.flashcardsById['fc-sec-1'].examId, 'sec-plus');
    assert.equal(androidPullAfterB.flashcardsById['fc-sec-1'].state, 'known');

    // =========================================================================
    // SCENARIO C: OFFLINE ANDROID USAGE, RETRY & IDEMPOTENT DEDUPLICATION
    // 1. Offline attempt & flashcard updates queued locally ->
    // 2. Network reconnects and flushes queue (including duplicate retry) ->
    // 3. Verify Web receives exact updates with zero duplicate exam records
    // =========================================================================
    const offlineAttemptPayload = {
      userId: sharedUid,
      attemptId: 'att_scenario_c_offline_03',
      examId: 'sec_plus',
      mode: 'FULL_SIMULATION',
      scorePercent: 92,
      totalQuestions: 25,
      correctAnswers: 23,
      timeSpentSeconds: 1650,
      platform: 'ANDROID',
    };

    // First delivery on reconnect
    const flush1 = await fetch(`${baseUrl}/exams/sec_plus/sessions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(offlineAttemptPayload),
    }).then((r) => r.json());
    assert.equal(flush1.deduplicated, false);
    assert.equal(flush1.totalAttemptsForUser, 3);

    // Simulated network timeout retry of the exact same queued offline attempt
    const flush2 = await fetch(`${baseUrl}/exams/sec-plus/sessions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(offlineAttemptPayload),
    }).then((r) => r.json());
    assert.equal(flush2.deduplicated, true);
    assert.equal(
      flush2.totalAttemptsForUser,
      3,
      'Idempotent retry must not create duplicate exam attempt records'
    );

    // =========================================================================
    // SCENARIO D: CONFLICTING UPDATES BETWEEN ANDROID AND WEB
    // 1. Android submits an older flashcard review (timestamp 1730000150000, Box 1 / unstudied)
    //    after Web already submitted a newer review (timestamp 1730000200000, Box 3 / known).
    // 2. Verify deterministic conflict resolution preserves the newer review (Box 3 / known).
    // 3. Same-timestamp tie-breaker: Box 4 vs Box 2 at timestamp 1730000300000 -> Box 4 wins.
    // =========================================================================
    await fetch(`${baseUrl}/flashcards/sync`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        userId: sharedUid,
        platform: 'ANDROID',
        cards: [
          {
            // Stale offline packet arriving late
            cardId: 'fc-sec-1',
            examId: 'sec_plus',
            domainId: 'd1',
            boxLevel: 1,
            state: 'unstudied',
            lastReviewedEpochMillis: 1730000150000,
          },
          {
            // Tie-breaker test card (initial at t=1730000300000, box 2)
            cardId: 'fc-sec-2',
            examId: 'sec_plus',
            domainId: 'd1',
            boxLevel: 2,
            state: 'needs_review',
            lastReviewedEpochMillis: 1730000300000,
          },
        ],
      }),
    });

    // Simultaneous update at identical timestamp t=1730000300000 with higher boxLevel=4
    const conflictRes = await fetch(`${baseUrl}/flashcards/sync`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        userId: sharedUid,
        platform: 'WEB',
        cards: [
          {
            cardId: 'fc-sec-2',
            examId: 'sy0-701',
            domainId: 'd1',
            boxLevel: 4,
            state: 'known',
            lastReviewedEpochMillis: 1730000300000,
          },
        ],
      }),
    }).then((r) => r.json());

    // Verify deterministic conflict resolution without data corruption
    assert.equal(conflictRes.flashcardsById['fc-sec-1'].boxLevel, 3);
    assert.equal(conflictRes.flashcardsById['fc-sec-1'].state, 'known');
    assert.equal(conflictRes.flashcardsById['fc-sec-2'].boxLevel, 4);
    assert.equal(conflictRes.flashcardsById['fc-sec-2'].state, 'known');
  } finally {
    server.close();
  }
});

test('12. Firebase ID token verification is cryptographic; no unauthenticated token issuer; secrets fail closed', async () => {
  const projectId = FIREBASE_PROJECT_ID;
  const good = await generateKeyPair('RS256');
  const attacker = await generateKeyPair('RS256');
  const jwk = { ...(await exportJWK(good.publicKey)), kid: 'k1', alg: 'RS256', use: 'sig' };
  setFirebaseJwksForTesting(createLocalJWKSet({ keys: [jwk] }));

  const mint = (key: CryptoKey, over: { aud?: string; iss?: string; exp?: string; sub?: string } = {}) =>
    new SignJWT({})
      .setProtectedHeader({ alg: 'RS256', kid: 'k1' })
      .setSubject(over.sub ?? 'firebaseUidAlice')
      .setAudience(over.aud ?? projectId)
      .setIssuer(over.iss ?? `https://securetoken.google.com/${projectId}`)
      .setIssuedAt()
      .setExpirationTime(over.exp ?? '10m')
      .sign(key);

  const ok = await verifyBearerToken(`Bearer ${await mint(good.privateKey)}`);
  assert.equal(ok?.uid, 'firebaseUidAlice');
  assert.equal(ok?.authMode, 'FIREBASE_ID_TOKEN');

  // Forged: valid-looking claims signed with an attacker key must be rejected.
  assert.equal(await verifyBearerToken(`Bearer ${await mint(attacker.privateKey)}`), null);
  // Unsigned/garbage "JWT" with arbitrary uid (the previous bypass) must be rejected.
  const fakePayload = Buffer.from(JSON.stringify({ sub: 'victim', aud: projectId, exp: 9999999999 })).toString('base64url');
  assert.equal(await verifyBearerToken(`Bearer eyJhbGciOiJub25lIn0.${fakePayload}.AAAAAAAAAAAA`), null);
  // Wrong audience / issuer / expired must be rejected.
  assert.equal(await verifyBearerToken(`Bearer ${await mint(good.privateKey, { aud: 'other-project' })}`), null);
  assert.equal(await verifyBearerToken(`Bearer ${await mint(good.privateKey, { iss: 'https://evil.example' })}`), null);
  assert.equal(await verifyBearerToken(`Bearer ${await mint(good.privateKey, { exp: '-1m' })}`), null);

  // The old unauthenticated session-token issuer must no longer exist.
  const app = createCertMasterApiApp();
  const server = app.listen(0);
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 0;
  try {
    const issuer = await fetch(`http://127.0.0.1:${port}/api/auth/session-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'victim' }),
    });
    assert.notEqual(issuer.status, 200);
    const noToken = await issuer.json().catch(() => ({}));
    assert.equal((noToken as Record<string, unknown>).bearerToken, undefined);

    // A real Firebase-style token works end to end on a protected route.
    const tok = await mint(good.privateKey);
    const prof = await fetch(`http://127.0.0.1:${port}/api/profile/firebaseUidAlice`, {
      headers: { Authorization: `Bearer ${tok}` },
    });
    assert.equal(prof.status, 200);
    const forged = await fetch(`http://127.0.0.1:${port}/api/profile/firebaseUidAlice`, {
      headers: { Authorization: `Bearer ${await mint(attacker.privateKey)}` },
    });
    assert.equal(forged.status, 401);
  } finally {
    server.close();
  }

  // Secrets fail closed: with no configured secret, signed tokens and webhook signatures cannot be produced/accepted.
  const savedAuth = process.env.CERTMASTER_AUTH_SIGNING_SECRET;
  const savedHook = process.env.CERTMASTER_PAYMENT_WEBHOOK_SECRET;
  const legacyDefault = 'cm_auth.victim.9999999999.' + 'a'.repeat(64);
  try {
    delete process.env.CERTMASTER_AUTH_SIGNING_SECRET;
    delete process.env.CERTMASTER_PAYMENT_WEBHOOK_SECRET;
    assert.throws(() => createSignedBearerToken('x'));
    assert.throws(() => createPaymentWebhookSignature('x', 'cissp', 'single', 'r'));
    assert.equal(await verifyBearerToken(`Bearer ${legacyDefault}`), null);
  } finally {
    process.env.CERTMASTER_AUTH_SIGNING_SECRET = savedAuth;
    process.env.CERTMASTER_PAYMENT_WEBHOOK_SECRET = savedHook;
  }
});
