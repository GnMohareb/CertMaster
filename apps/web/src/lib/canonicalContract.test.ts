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
import { createCertMasterApiApp } from '../../server';

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

  // Content availability truthfulness
  assert.equal(getExamContentStatus('cissp'), 'FULL_PREP');
  assert.equal(getExamContentStatus('aws_csa'), 'FULL_PREP');
  assert.equal(getExamContentStatus('sec_plus'), 'FULL_PREP');
  assert.equal(getExamContentStatus('gcp-pca'), 'CATALOG_PREVIEW');
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

test('9. Certification Content Integrity Across All 112 Exam Banks', () => {
  assert.equal(ALL_112_EXAM_BANKS.length, 112);

  const fullPrepBanks = ALL_112_EXAM_BANKS.filter((b) => b.contentStatus === 'FULL_PREP');
  const previewBanks = ALL_112_EXAM_BANKS.filter((b) => b.contentStatus === 'CATALOG_PREVIEW');
  assert.equal(fullPrepBanks.length, 6);
  assert.equal(previewBanks.length, 106);

  // Verify each FULL_PREP certification returns its own genuine questions, flashcards, and study guides
  for (const bank of fullPrepBanks) {
    const questions = getQuestionsForExamId(bank.id);
    assert.ok(questions.length > 0, `Expected non-empty question bank for ${bank.id}`);
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

  // Verify CATALOG_PREVIEW exams never return CISSP questions
  for (const bank of previewBanks) {
    const questions = getQuestionsForExamId(bank.id);
    assert.equal(
      questions.length,
      0,
      `Catalog preview exam ${bank.id} must not return fake CISSP questions`
    );
  }
});

test('10. Cross-Platform Backend API Sync, Idempotency & Entitlement Security', async () => {
  const app = createCertMasterApiApp();
  const server = app.listen(0);
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 3099;
  const baseUrl = `http://127.0.0.1:${port}/api`;

  try {
    // 1. Health & Catalog Manifest
    const healthRes = await fetch(`${baseUrl}/health`).then((r) => r.json());
    assert.equal(healthRes.schemaVersion, 2);
    assert.equal(healthRes.firebaseProjectId, FIREBASE_PROJECT_ID);
    assert.equal(healthRes.firestoreDatabaseId, FIRESTORE_DATABASE_ID);

    // 2. Reject unverified client attempt to self-grant ACTIVE subscription via /subscriptions/verify
    const forgedSubRes = await fetch(`${baseUrl}/subscriptions/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'usr_cross_test_01',
        examId: 'aws-saa',
        receiptToken: 'forged_client_token',
      }),
    });
    assert.equal(forgedSubRes.status, 403);

    // 3. Reject unverified client attempt to self-escalate subscriptionTier via /profile/sync
    const unverifiedProfileSync = await fetch(`${baseUrl}/profile/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'usr_cross_test_01',
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

    // 4. Server-verified receipt grants ACTIVE entitlement and persists across Android & Web
    const validSubRes = await fetch(`${baseUrl}/subscriptions/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'usr_cross_test_01',
        examId: 'aws_csa',
        tier: 'single',
        receiptToken: 'rcpt_verified_stripe_001',
        platform: 'WEB',
      }),
    });
    assert.equal(validSubRes.status, 200);
    const validSubJson = await validSubRes.json();
    assert.equal(validSubJson.verifiedEntitlements['aws-saa'].status, 'ACTIVE');
    assert.equal(validSubJson.subscriptionTier, 'Single-Exam Pass');

    // 5. Android submits an exam session & duplicate submission is idempotent
    const sessionPayload = {
      userId: 'usr_cross_test_01',
      attemptId: 'att_android_sync_01',
      examId: 'aws_csa',
      scorePercent: 86,
      totalQuestions: 20,
      correctAnswers: 17,
      timeSpentSeconds: 1500,
      platform: 'ANDROID',
    };

    const s1 = await fetch(`${baseUrl}/exams/aws_csa/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sessionPayload),
    }).then((r) => r.json());
    assert.equal(s1.deduplicated, false);
    assert.equal(s1.totalAttemptsForUser, 1);

    const s2 = await fetch(`${baseUrl}/exams/aws-saa/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sessionPayload),
    }).then((r) => r.json());
    assert.equal(s2.deduplicated, true);
    assert.equal(s2.totalAttemptsForUser, 1);

    // 6. Web retrieves profile and sees Android's exam attempt + verified AWS SAA entitlement
    const webPull = await fetch(`${baseUrl}/profile/usr_cross_test_01`).then((r) => r.json());
    assert.equal(webPull.attempts.length, 1);
    assert.equal(webPull.attempts[0].examId, 'aws-saa');
    assert.equal(webPull.attempts[0].scorePercent, 86);
    assert.equal(webPull.profile.subscriptions['aws-saa'].status, 'ACTIVE');

    // 7. Custom Study Note & Grounded AI Tutor Cross-Platform Parity
    const noteSync = await fetch(`${baseUrl}/sources/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'usr_cross_test_01',
        examId: 'aws_csa',
        domainId: 'd1',
        domainName: 'Design Secure Architectures',
        title: 'S3 Gateway VPC Endpoint Notes',
        authorOrStandard: 'Learner Note',
        type: 'CHEAT_SHEET',
        summary: 'Use Gateway VPC Endpoints for S3 and DynamoDB',
        fullContent: 'Gateway VPC endpoints add a prefix list route in VPC route tables with zero hourly charge.',
      }),
    }).then((r) => r.json());
    assert.equal(noteSync.syncStatus, 'SYNCHRONIZED');
    assert.equal(noteSync.sources.length, 1);
    assert.equal(noteSync.sources[0].examId, 'aws-saa');

    const tutorRes = await fetch(`${baseUrl}/ai/tutor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        examId: 'aws_csa',
        query: 'How does a Gateway VPC Endpoint work for Amazon S3?',
      }),
    }).then((r) => r.json());
    assert.equal(tutorRes.examId, 'aws-saa');
    assert.ok(tutorRes.answer.includes('Gateway VPC Endpoint'));
    assert.ok(Array.isArray(tutorRes.citations) && tutorRes.citations.length > 0);
  } finally {
    server.close();
  }
});
