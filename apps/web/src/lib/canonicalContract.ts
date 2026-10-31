import {
  BehavioralArchetype,
  ExamBank,
  ExamReadiness,
  FlashcardProgress,
  FlashcardState,
  PlatformOrigin,
  SimulationAttempt,
  StudyPlan,
  StudyPlanMilestone,
  StudySource,
  SubscriptionStatus,
  SubscriptionTier,
  UserCentralProfile,
  ExamSubscription,
  DomainScoreBreakdown,
} from '../types/certmaster';

export const CANONICAL_SCHEMA_VERSION = 2;

export const FIREBASE_PROJECT_ID = 'gen-lang-client-0788513176';
export const FIRESTORE_DATABASE_ID = 'ai-studio-certmasterwebpla-ad2ba0f9-3a61-45af-b60a-14f5eb4f6001';
export const GOOGLE_WEB_OAUTH_CLIENT_ID =
  '814967786900-9idd4t0m0qikfs4g739to1s2fda2mefu.apps.googleusercontent.com';

/**
 * Authoritative alias table mapping legacy Android & Web exam IDs to the single canonical examId.
 */
export const EXAM_ID_ALIASES: Readonly<Record<string, string>> = {
  // (ISC)²
  cissp: 'cissp',
  'isc2-cissp': 'cissp',
  ccsp: 'ccsp',
  'isc2-ccsp': 'ccsp',
  // AWS
  'aws-saa': 'aws-saa',
  'aws-csa': 'aws-saa',
  'aws_csa': 'aws-saa',
  awssaa: 'aws-saa',
  'aws-saa-c03': 'aws-saa',
  'saa-c03': 'aws-saa',
  'aws-sap': 'aws-sap',
  'sap-c02': 'aws-sap',
  // CompTIA
  'sec-plus': 'sec-plus',
  'sec_plus': 'sec-plus',
  'sy0-701': 'sec-plus',
  'sy0_701': 'sec-plus',
  'security-plus': 'sec-plus',
  'security_plus': 'sec-plus',
  'n10-008': 'net-plus',
  'n10_008': 'net-plus',
  'n10-009': 'net-plus',
  'net-plus': 'net-plus',
  'net_plus': 'net-plus',
  'network-plus': 'net-plus',
  'cysa-003': 'cysa-plus',
  'cy0-003': 'cysa-plus',
  'cs0-003': 'cysa-plus',
  'cysa-plus': 'cysa-plus',
  'cysa_plus': 'cysa-plus',
  'pt0-002': 'pentest-plus',
  'pt0-003': 'pentest-plus',
  'pentest-plus': 'pentest-plus',
  'pentest_plus': 'pentest-plus',
  'cas-004': 'casp-plus',
  'cas-005': 'casp-plus',
  'casp-plus': 'casp-plus',
  'casp_plus': 'casp-plus',
  // ISACA
  cism: 'cism',
  'isaca-cism': 'cism',
  cisa: 'cisa',
  'isaca-cisa': 'cisa',
  // EC-Council
  ceh: 'ceh',
  'ceh-v12': 'ceh',
  // PMI
  pmp: 'pmp',
  'pmi-pmp': 'pmp',
  // Linux & Red Hat
  'rhcsa-ex200': 'rhcsa',
  rhcsa: 'rhcsa',
  ex200: 'rhcsa',
  'rhce-ex294': 'rhce',
  rhce: 'rhce',
  ex294: 'rhce',
};

/**
 * Normalizes any exam identifier from Web or Android to its canonical kebab-case examId.
 */
export function normalizeExamId(rawId: string | undefined | null): string {
  if (!rawId || typeof rawId !== 'string') return 'cissp';
  const trimmed = rawId.trim().toLowerCase();
  if (!trimmed) return 'cissp';
  if (EXAM_ID_ALIASES[trimmed]) return EXAM_ID_ALIASES[trimmed];
  const kebab = trimmed.replace(/_/g, '-');
  return EXAM_ID_ALIASES[kebab] || kebab;
}

/**
 * Checks whether two exam identifiers refer to the same canonical certification.
 */
export function matchesExamId(idA: string | undefined | null, idB: string | undefined | null): boolean {
  if (!idA || !idB) return false;
  return normalizeExamId(idA) === normalizeExamId(idB);
}

/**
 * Certifications with verified sample question banks, study guides, audio briefings, and flashcards bundled locally.
 * Note: Under Phase 7 objective content classification criteria, these 6 certifications have 5–8 questions each
 * and are classified as SAMPLE_CONTENT_AVAILABLE (not FULL_PREPARATION_AVAILABLE, which requires >= 100 questions).
 */
export const FULL_PREP_EXAM_IDS: ReadonlySet<string> = new Set([
  'cissp',
  'aws-saa',
  'sec-plus',
  'pmp',
  'cism',
  'ceh',
]);

export const SAMPLE_CONTENT_EXAM_IDS: ReadonlySet<string> = FULL_PREP_EXAM_IDS;

export interface ExamBundledContentAudit {
  examId: string;
  questionCount: number;
  studyGuideCount: number;
  flashcardCount: number;
  audioBriefingCount: number;
  domainCount: number;
  simulatorAvailable: boolean;
  androidParity: boolean;
}

export const ACTUAL_BUNDLED_CONTENT_COUNTS: Readonly<Record<string, ExamBundledContentAudit>> = {
  cissp: {
    examId: 'cissp',
    questionCount: 8,
    studyGuideCount: 4,
    flashcardCount: 8,
    audioBriefingCount: 3,
    domainCount: 8,
    simulatorAvailable: true,
    androidParity: true,
  },
  'aws-saa': {
    examId: 'aws-saa',
    questionCount: 5,
    studyGuideCount: 1,
    flashcardCount: 3,
    audioBriefingCount: 1,
    domainCount: 4,
    simulatorAvailable: true,
    androidParity: true,
  },
  'sec-plus': {
    examId: 'sec-plus',
    questionCount: 5,
    studyGuideCount: 1,
    flashcardCount: 2,
    audioBriefingCount: 1,
    domainCount: 5,
    simulatorAvailable: true,
    androidParity: true,
  },
  pmp: {
    examId: 'pmp',
    questionCount: 3,
    studyGuideCount: 1,
    flashcardCount: 1,
    audioBriefingCount: 1,
    domainCount: 3,
    simulatorAvailable: true,
    androidParity: true,
  },
  cism: {
    examId: 'cism',
    questionCount: 3,
    studyGuideCount: 1,
    flashcardCount: 1,
    audioBriefingCount: 1,
    domainCount: 4,
    simulatorAvailable: true,
    androidParity: true,
  },
  ceh: {
    examId: 'ceh',
    questionCount: 3,
    studyGuideCount: 1,
    flashcardCount: 1,
    audioBriefingCount: 1,
    domainCount: 4,
    simulatorAvailable: true,
    androidParity: true,
  },
};

export type EvidenceBasedContentStatus =
  | 'FULL_PREPARATION_AVAILABLE'
  | 'LIMITED_PREPARATION'
  | 'SAMPLE_CONTENT_AVAILABLE'
  | 'CATALOG_PREVIEW'
  | 'CONTENT_COMING_SOON';

/**
 * Objective, evidence-based content classification criteria (Phase 7 Section 8):
 * 1. FULL_PREPARATION_AVAILABLE: >= 100 practice questions, >= 4 study guides, >= 20 flashcards, >= 1 audio briefing
 * 2. LIMITED_PREPARATION: >= 25 practice questions, >= 2 study guides, >= 8 flashcards
 * 3. SAMPLE_CONTENT_AVAILABLE: >= 3 practice questions, >= 1 study guide, >= 1 flashcard
 * 4. CATALOG_PREVIEW: < 3 practice questions, > 0 domain blueprint definitions
 * 5. CONTENT_COMING_SOON: 0 practice questions and 0 domain blueprint definitions
 */
export function classifyExamContentAvailability(params: {
  questionCount: number;
  studyGuideCount: number;
  flashcardCount: number;
  audioBriefingCount: number;
  domainCount: number;
}): EvidenceBasedContentStatus {
  const { questionCount, studyGuideCount, flashcardCount, audioBriefingCount, domainCount } = params;
  if (
    questionCount >= 100 &&
    studyGuideCount >= 4 &&
    flashcardCount >= 20 &&
    audioBriefingCount >= 1
  ) {
    return 'FULL_PREPARATION_AVAILABLE';
  }
  if (questionCount >= 25 && studyGuideCount >= 2 && flashcardCount >= 8) {
    return 'LIMITED_PREPARATION';
  }
  if (questionCount >= 3 && studyGuideCount >= 1 && flashcardCount >= 1) {
    return 'SAMPLE_CONTENT_AVAILABLE';
  }
  if (domainCount > 0) {
    return 'CATALOG_PREVIEW';
  }
  return 'CONTENT_COMING_SOON';
}

export function getExamBundledContentAudit(
  examId: string,
  domainCountFallback: number = 4
): ExamBundledContentAudit {
  const canonical = normalizeExamId(examId);
  const existing = ACTUAL_BUNDLED_CONTENT_COUNTS[canonical];
  if (existing) return existing;
  return {
    examId: canonical,
    questionCount: 0,
    studyGuideCount: 0,
    flashcardCount: 0,
    audioBriefingCount: 0,
    domainCount: domainCountFallback,
    simulatorAvailable: false,
    androidParity: false,
  };
}

export function getExamContentStatus(examId: string): EvidenceBasedContentStatus {
  const audit = getExamBundledContentAudit(examId, 4);
  return classifyExamContentAvailability(audit);
}

export function hasBundledInteractiveContent(examId: string): boolean {
  const status = getExamContentStatus(examId);
  return (
    status === 'FULL_PREPARATION_AVAILABLE' ||
    status === 'LIMITED_PREPARATION' ||
    status === 'SAMPLE_CONTENT_AVAILABLE'
  );
}

export interface BehavioralClassificationResult {
  archetype: string;
  cognitiveStressBaseline: number;
  distractorEliminationRate: number;
  optionSwitchCountAvg: number;
  hesitationNotes: string;
  confidenceIndex: number;
  recommendedStrategy: string;
}

export interface BehavioralClassificationInput {
  scorePct: number;
  avgLatencySec: number;
  totalSwitches: number;
  totalEliminations: number;
  totalQuestions?: number;
}

/**
 * Authoritative Behavioral Archetype & Stress Classification.
 * Matches Android `AuthoritativeMetricsEngine.classifyBehavioralArchetype` bit-for-bit.
 * Accepts either an input object or positional parameters.
 */
export function classifyBehavioralArchetype(
  scorePctOrInput: number | BehavioralClassificationInput,
  avgLatencySecArg: number = 45,
  totalSwitchesArg: number = 2,
  totalEliminationsArg: number = 4,
  totalQuestionsArg: number = 10
): BehavioralClassificationResult {
  const scorePct =
    typeof scorePctOrInput === 'object' ? scorePctOrInput.scorePct : scorePctOrInput;
  const avgLatencySec =
    typeof scorePctOrInput === 'object' ? scorePctOrInput.avgLatencySec : avgLatencySecArg;
  const totalSwitches =
    typeof scorePctOrInput === 'object' ? scorePctOrInput.totalSwitches : totalSwitchesArg;
  const totalEliminations =
    typeof scorePctOrInput === 'object' ? scorePctOrInput.totalEliminations : totalEliminationsArg;
  const totalQuestions =
    typeof scorePctOrInput === 'object'
      ? scorePctOrInput.totalQuestions ?? 10
      : totalQuestionsArg;

  const safeTotal = Math.max(1, totalQuestions);

  let archetype: string;
  let stress: number;
  let confidenceIndex: number;
  let recommendedStrategy: string;

  if (scorePct >= 85 && avgLatencySec < 40 && totalSwitches <= 2) {
    archetype = 'Confident Master';
    stress = 35;
    confidenceIndex = 92;
    recommendedStrategy =
      'You are performing in the top 5th percentile. Proceed directly to full timed mock exams.';
  } else if (totalEliminations >= 6 && scorePct >= 70) {
    archetype = 'Deliberate Strategist';
    stress = 54;
    confidenceIndex = 84;
    recommendedStrategy =
      'Maintain your disciplined elimination strategy. Watch clock pacing on multi-paragraph scenario items.';
  } else if (avgLatencySec < 22 && scorePct < 70) {
    archetype = 'Fast Guesser';
    stress = 72;
    confidenceIndex = 62;
    recommendedStrategy =
      'Slow down on multi-sentence scenario questions and rule out at least two distractors before committing.';
  } else if (avgLatencySec >= 45 || totalSwitches >= 4) {
    archetype = 'Analytical Hesitator';
    stress = 68;
    confidenceIndex = 68;
    recommendedStrategy =
      'Lock in your first instinct; empirical data shows your initial choice is 78% more likely to be correct.';
  } else {
    archetype = 'Methodical Verifier';
    stress = 50;
    confidenceIndex = 78;
    recommendedStrategy =
      'Balanced verification cadence. Reinforce weak domains with spaced-repetition flashcards and audio briefings.';
  }

  const distractorEliminationRate = Math.min(
    1.0,
    Math.max(0.0, Math.round((totalEliminations / (safeTotal * 3.0)) * 100.0) / 100.0)
  );
  const optionSwitchCountAvg = Math.round((totalSwitches / safeTotal) * 10.0) / 10.0;
  const hesitationNotes = `Calibrated via 10-Question Diagnostic Engine. Average question dwell time: ${avgLatencySec}s. Option oscillation: ${totalSwitches} switches. Distractor strikes: ${totalEliminations}.`;

  return {
    archetype,
    cognitiveStressBaseline: stress,
    distractorEliminationRate,
    optionSwitchCountAvg,
    hesitationNotes,
    confidenceIndex,
    recommendedStrategy,
  };
}

/**
 * Authoritative Simulation Behavioral Stress Formula.
 * Matches Android `AuthoritativeMetricsEngine.calculateSimulationBehavioralStress` bit-for-bit:
 * min(100, max(30, 50 + totalSwitches * 5 - (passed ? 15 : 0)))
 */
export function calculateSimulationBehavioralStress(totalSwitches: number, passed: boolean): number {
  const raw = 50 + totalSwitches * 5 - (passed ? 15 : 0);
  return Math.min(100, Math.max(30, raw));
}

export type StressLevel =
  | 'CRITICAL_STRESS'
  | 'HIGH_ATTENTION'
  | 'MODERATE_PRACTICE'
  | 'ON_TRACK'
  | 'MASTERED';

export interface DomainStressResult {
  stressScore: number;
  stressLevel: StressLevel;
}

/**
 * Authoritative Domain Cognitive Stress Score & Level.
 * Matches Android `AuthoritativeMetricsEngine.calculateDomainStressScore` bit-for-bit.
 */
export function calculateDomainStressScore(
  accuracyPercent: number,
  flagRatePercent: number,
  avgResponseSeconds: number
): DomainStressResult {
  const accuracyDeficit = Math.min(100, Math.max(0, 100 - accuracyPercent));
  const rawStress =
    accuracyDeficit * 0.55 +
    flagRatePercent * 0.25 +
    (Math.max(0, avgResponseSeconds - 45) / 60.0) * 20.0;
  const stressScore = Math.min(98, Math.max(5, Math.trunc(rawStress)));

  let stressLevel: StressLevel;
  if (stressScore >= 70) {
    stressLevel = 'CRITICAL_STRESS';
  } else if (stressScore >= 50) {
    stressLevel = 'HIGH_ATTENTION';
  } else if (stressScore >= 35) {
    stressLevel = 'MODERATE_PRACTICE';
  } else if (stressScore >= 18) {
    stressLevel = 'ON_TRACK';
  } else {
    stressLevel = 'MASTERED';
  }

  return { stressScore, stressLevel };
}

/**
 * Maps Leitner Box (1..5) to canonical lowercase FlashcardState.
 */
export function flashcardBoxToState(boxLevel: number): FlashcardState {
  const safeBox = Math.min(5, Math.max(1, Math.round(boxLevel || 1)));
  if (safeBox >= 3) return 'known';
  if (safeBox === 2) return 'needs_review';
  return 'unstudied';
}

/**
 * Maps FlashcardState or uppercase status string to Leitner Box (1..5).
 */
export function flashcardStateToBox(
  stateOrStatus: string | undefined,
  existingBoxLevel?: number
): number {
  const normalized = (stateOrStatus || '').trim().toLowerCase();
  if (normalized === 'known') {
    return existingBoxLevel && existingBoxLevel >= 3 ? Math.min(5, existingBoxLevel) : 3;
  }
  if (normalized === 'needs_review') {
    return 2;
  }
  if (normalized === 'unstudied' || normalized === 'unreviewed') {
    return 1;
  }
  if (typeof existingBoxLevel === 'number') {
    return Math.min(5, Math.max(1, Math.round(existingBoxLevel)));
  }
  return 1;
}

export interface ReadinessAndPlanReport {
  examId: string;
  readinessPercent: number;
  passProbabilityPercent: number;
  passGuaranteeQualified: boolean;
  currentJourneyStage: number;
  weakestDomainId: string;
  weakestDomainName: string;
  weakestDomainScore: number;
  milestones: StudyPlanMilestone[];
  readiness: ExamReadiness;
  studyPlan: StudyPlan;
}

function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val));
}

/**
 * Authoritative Exam Readiness & 5-Stage Mastery Study Plan Calculator.
 * Matches Android `AuthoritativeMetricsEngine.calculateAuthoritativeReadiness` & `buildFiveStageStudyPlan` bit-for-bit.
 */
export function calculateReadinessAndStudyPlan(params: {
  userId?: string;
  examId?: string;
  passingScorePercent?: number;
  assessmentCompleted: boolean;
  assessmentScorePercent: number;
  cognitiveStressBaseline: number;
  behavioralArchetype?: string;
  averageDwellTimeSec?: number;
  simulationScoresPercent?: number[];
  knownFlashcardsCount?: number;
  totalFlashcardsCount?: number;
  weakestDomainId?: string;
  weakestDomainName?: string;
  weakestDomainScore?: number;
  targetDate?: string;
  weeklyHours?: number;
  exam?: Pick<ExamBank, 'id' | 'code' | 'passRatePercent' | 'domains'> & {
    passingScorePercent?: number;
  };
  simulationAttempts?: SimulationAttempt[];
  flashcards?: FlashcardProgress[];
  totalAvailableFlashcards?: number;
}): ReadinessAndPlanReport {
  const canonicalExamId = normalizeExamId(params.examId || params.exam?.id || 'cissp');
  const passThreshold =
    params.passingScorePercent ?? params.exam?.passingScorePercent ?? 70;
  const userId = params.userId || 'usr_gnmohareb_cissp_001';

  const simScores: number[] =
    params.simulationScoresPercent ??
    (params.simulationAttempts
      ? params.simulationAttempts
          .filter((a) => matchesExamId(a.examId, canonicalExamId))
          .map((a) => a.scorePercent)
      : []);

  const avgSimScore =
    simScores.length > 0
      ? Math.round(simScores.reduce((a, b) => a + b, 0) / simScores.length)
      : params.assessmentScorePercent;

  const highestSimScore =
    simScores.length > 0 ? Math.max(...simScores) : params.assessmentScorePercent;

  const totalCards =
    params.totalFlashcardsCount ??
    params.totalAvailableFlashcards ??
    params.flashcards?.length ??
    0;
  const knownCards =
    params.knownFlashcardsCount ??
    (params.flashcards
      ? params.flashcards.filter(
          (c) => c.state === 'known' || (c.boxLevel !== undefined && c.boxLevel >= 3)
        ).length
      : 0);

  const flashcardMasteryPct =
    totalCards > 0 ? Math.round((knownCards / totalCards) * 100) : 70;

  // Weighted readiness matching Android AuthoritativeMetricsEngine.kt (lines 161-166):
  // 60% simulation performance + 25% diagnostic baseline + 15% active recall mastery
  const readinessPercent = clamp(
    Math.round(
      avgSimScore * 0.6 +
        params.assessmentScorePercent * 0.25 +
        flashcardMasteryPct * 0.15
    ),
    10,
    100
  );

  let passProbabilityPercent: number;
  if (readinessPercent >= passThreshold + 10) {
    passProbabilityPercent = Math.min(98, readinessPercent + 6);
  } else if (readinessPercent >= passThreshold) {
    passProbabilityPercent = Math.min(92, readinessPercent + 3);
  } else {
    passProbabilityPercent = Math.max(15, readinessPercent - 5);
  }

  const weakestDomainId = params.weakestDomainId || params.exam?.domains?.[0]?.id || 'd1';
  const weakestDomainName =
    params.weakestDomainName ||
    params.exam?.domains?.[0]?.name ||
    'Security Architecture & Engineering';
  const weakestDomainScore = params.weakestDomainScore ?? avgSimScore;

  const passedSimsCount = simScores.filter((s) => s >= passThreshold).length;
  const passGuaranteeQualified =
    readinessPercent >= passThreshold && passedSimsCount >= 2;

  let currentJourneyStage: number;
  if (!params.assessmentCompleted) {
    currentJourneyStage = 1;
  } else if (weakestDomainScore < 65) {
    currentJourneyStage = 2;
  } else if (simScores.length < 3) {
    currentJourneyStage = 3;
  } else if (!passGuaranteeQualified) {
    currentJourneyStage = 4;
  } else {
    currentJourneyStage = 5;
  }

  const stage1Done = params.assessmentCompleted;
  const stage2Done = weakestDomainScore >= 65;
  const stage3Done = simScores.length >= 3 && highestSimScore >= passThreshold;
  const stage4Done = passGuaranteeQualified;

  const milestones: StudyPlanMilestone[] = [
    {
      stage: 1,
      stageName: 'Baseline Diagnostic & Behavioral Telemetry',
      status: stage1Done ? 'COMPLETED' : 'IN_PROGRESS',
      score: params.assessmentScorePercent,
      description: `Calibrates question dwell times and hesitation option switches. Archetype: ${params.behavioralArchetype || 'Analytical Hesitator'} (${params.averageDwellTimeSec ?? 48}s avg dwell).`,
      actionLabel: 'Recalibrate (10 Questions)',
      actionRoute: 'INITIAL_BEHAVIORAL_ASSESSMENT',
    },
    {
      stage: 2,
      stageName: 'Targeted Weak Domain Mastery & Grounded Citations',
      status: !stage1Done ? 'LOCKED' : stage2Done ? 'COMPLETED' : 'IN_PROGRESS',
      score: weakestDomainScore,
      description: `Priority remediation for ${weakestDomainName} (${weakestDomainScore}%) using NotebookLM study guides, flashcards, and audio briefings.`,
      actionLabel: 'Open Study Sources',
      actionRoute: 'NOTEBOOK_SOURCES',
    },
    {
      stage: 3,
      stageName: 'High-Stress Timed Simulation & Distractor Elimination',
      status: stage3Done ? 'COMPLETED' : stage1Done ? 'IN_PROGRESS' : 'LOCKED',
      score: highestSimScore,
      description: `Train under exact ${canonicalExamId.toUpperCase()} certification timing with distractor strikethrough and question flagging.`,
      actionLabel: 'Launch Exam Simulator',
      actionRoute: 'EXAM_HUB',
    },
    {
      stage: 4,
      stageName: 'Domain Heatmap & Pass Guarantee Verification',
      status: stage4Done ? 'COMPLETED' : stage3Done ? 'READY' : 'IN_PROGRESS',
      score: passProbabilityPercent,
      description: passGuaranteeQualified
        ? `Qualified for the CertMaster Pass Guarantee (${readinessPercent}% readiness).`
        : `Reach ${passThreshold}%+ across simulations to unlock the CertMaster Pass Guarantee.`,
      actionLabel: 'View Analytics',
      actionRoute: 'DASHBOARD',
    },
    {
      stage: 5,
      stageName: 'Cross-Device Sync & Testing Center Preparation',
      status: stage4Done ? 'READY' : 'IN_PROGRESS',
      score: readinessPercent,
      description:
        'Web Companion and Android app offline banks, flashcards, and simulation scores are synchronized for test day.',
      actionLabel: 'Verify Cloud Sync',
      actionRoute: 'CENTRAL_PROFILE',
    },
  ];

  const readiness: ExamReadiness = {
    schemaVersion: CANONICAL_SCHEMA_VERSION,
    userId,
    examId: canonicalExamId,
    readinessScore: readinessPercent,
    readinessPercent,
    passProbability: passProbabilityPercent,
    passProbabilityPercent,
    passGuaranteeQualified,
    currentJourneyStage,
    simulationsCompleted: simScores.length,
    weakestDomainId,
    weakestDomain: weakestDomainName,
    weakestDomainScore,
    updatedAt: new Date().toISOString(),
  };

  const studyPlan: StudyPlan = {
    schemaVersion: CANONICAL_SCHEMA_VERSION,
    planId: `plan_${canonicalExamId}_primary`,
    userId,
    examId: canonicalExamId,
    targetDate: params.targetDate || '2026-12-15',
    weeklyHours: params.weeklyHours ?? 12,
    focusDomains: [weakestDomainName],
    status: 'ACTIVE',
    currentStage: currentJourneyStage,
    readinessPercent,
    passProbabilityPercent,
    passGuaranteeQualified,
    milestones,
    milestonesJson: JSON.stringify(milestones),
    updatedAtMillis: Date.now(),
  };

  return {
    examId: canonicalExamId,
    readinessPercent,
    passProbabilityPercent,
    passGuaranteeQualified,
    currentJourneyStage,
    weakestDomainId,
    weakestDomainName,
    weakestDomainScore,
    milestones,
    readiness,
    studyPlan,
  };
}

/**
 * Deterministic conflict resolution for flashcard progress across Web and Android.
 * Most recent review timestamp wins; on timestamp tie, higher Leitner box wins.
 */
export function resolveFlashcardConflict(
  local: FlashcardProgress,
  remote: FlashcardProgress
): FlashcardProgress {
  const localEpoch = local.lastReviewedEpoch ?? new Date(local.updatedAt || 0).getTime();
  const remoteEpoch = remote.lastReviewedEpoch ?? new Date(remote.updatedAt || 0).getTime();

  if (remoteEpoch > localEpoch) {
    return remote;
  }
  if (localEpoch > remoteEpoch) {
    return local;
  }
  const localBox = local.boxLevel ?? flashcardStateToBox(local.state);
  const remoteBox = remote.boxLevel ?? flashcardStateToBox(remote.state);
  return remoteBox >= localBox ? remote : local;
}

/**
 * Deterministic conflict resolution for subscription status across Web and Android.
 */
export function normalizeSubscriptionStatus(rawStatus: string | undefined): SubscriptionStatus {
  const upper = (rawStatus || '').trim().toUpperCase();
  if (upper === 'ACTIVE') return 'ACTIVE';
  if (upper === 'TRIAL' || upper === 'TRIAL_ACTIVE') return 'TRIAL';
  if (upper === 'EXPIRED') return 'EXPIRED';
  return 'LOCKED';
}

export function resolveSubscriptionStatusConflict(
  localStatus: string | undefined,
  remoteStatus: string | undefined
): SubscriptionStatus {
  const normA = normalizeSubscriptionStatus(localStatus);
  const normB = normalizeSubscriptionStatus(remoteStatus);
  if (normA === 'ACTIVE' || normB === 'ACTIVE') return 'ACTIVE';
  if (normA === 'TRIAL' || normB === 'TRIAL') return 'TRIAL';
  if (normA === 'EXPIRED' || normB === 'EXPIRED') return 'EXPIRED';
  return 'LOCKED';
}

/**
 * Non-destructive migration of legacy Web/Android profile payloads to canonical schemaVersion 2.
 */
export function migrateLegacyProfile(
  raw: Record<string, any>,
  fallbackUserId: string = 'usr_gnmohareb_cissp_001'
): UserCentralProfile {
  const nowIso = new Date().toISOString();
  const nowMillis = Date.now();
  const userId = raw.userId || fallbackUserId;
  const archetypeName: string =
    typeof raw.behavioralArchetype === 'string'
      ? raw.behavioralArchetype
      : raw.behavioralArchetype?.name ||
        raw.archetypeName ||
        raw.archetype?.name ||
        'Analytical Hesitator';
  const stressIndex =
    typeof raw.cognitiveStressBaseline === 'number'
      ? raw.cognitiveStressBaseline
      : typeof raw.stressIndex === 'number'
      ? raw.stressIndex
      : 68;
  const archetypeDescription =
    (typeof raw.behavioralArchetype === 'object' && raw.behavioralArchetype?.description) ||
    raw.archetypeDescription ||
    raw.hesitationNotes ||
    'Exhibits deep deliberate analytical reading with high dwell time (>45s) and multiple option comparisons before locking in choices.';
  const averageDwellTimeSec =
    typeof raw.averageDwellTimeSec === 'number'
      ? raw.averageDwellTimeSec
      : typeof raw.behavioralArchetype === 'object' &&
        typeof raw.behavioralArchetype?.avgDwellSeconds === 'number'
      ? raw.behavioralArchetype.avgDwellSeconds
      : 48;
  const distractorEliminationRate =
    typeof raw.distractorEliminationRate === 'number'
      ? raw.distractorEliminationRate
      : typeof raw.behavioralArchetype === 'object' &&
        typeof raw.behavioralArchetype?.distractorEliminationRate === 'number'
      ? raw.behavioralArchetype.distractorEliminationRate
      : 0.64;
  const optionSwitchCountAvg =
    typeof raw.optionSwitchCountAvg === 'number'
      ? raw.optionSwitchCountAvg
      : 1.8;

  // Normalize subscriptions (supports both Web Record<string, Sub> and Android Array<Sub>)
  const normalizedSubs: Record<string, ExamSubscription> = {};
  const rawSubs = raw.subscriptions;
  const entries: Array<[string, Record<string, any>]> = [];
  if (Array.isArray(rawSubs)) {
    for (const item of rawSubs) {
      if (item && typeof item === 'object') {
        entries.push([String(item.examId || 'cissp'), item]);
      }
    }
  } else if (rawSubs && typeof rawSubs === 'object') {
    for (const [k, v] of Object.entries(rawSubs)) {
      if (v && typeof v === 'object') {
        entries.push([k, v as Record<string, any>]);
      }
    }
  }

  for (const [k, s] of entries) {
    const examId = normalizeExamId(s.examId || k);
    const status = normalizeSubscriptionStatus(s.status);
    const platform: PlatformOrigin =
      s.platform === 'ANDROID' || s.subscribedPlatform === 'ANDROID'
        ? 'ANDROID'
        : s.platform === 'UNIVERSAL_SYNC' || s.subscribedPlatform === 'UNIVERSAL_SYNC'
        ? 'UNIVERSAL_SYNC'
        : 'WEB';
    const expiresAt = s.expiresAt || s.validUntilDate || '2027-12-31T23:59:59Z';
    const existing = normalizedSubs[examId];
    normalizedSubs[examId] = {
      userId,
      examId,
      examTitle: s.examTitle || existing?.examTitle || examId.toUpperCase(),
      shortCode: s.shortCode || existing?.shortCode || examId.toUpperCase(),
      vendor: s.vendor || existing?.vendor || 'CertMaster',
      status: existing ? resolveSubscriptionStatusConflict(existing.status, status) : status,
      platform,
      subscribedPlatform: platform,
      expiresAt,
      validUntilDate: expiresAt,
      lastSyncedAt: s.lastSyncedAt || nowIso,
      priceFormatted: s.priceFormatted || '$29.00',
      universalAccess: s.universalAccess ?? true,
      activeSessionsCount: Math.max(s.activeSessionsCount ?? 1, existing?.activeSessionsCount ?? 0),
      schemaVersion: CANONICAL_SCHEMA_VERSION,
      createdAt: s.createdAt || nowIso,
      updatedAt: s.updatedAt || nowIso,
    };
  }

  const tier: SubscriptionTier =
    raw.subscriptionTier === 'Universal Multi-Pass' ||
    raw.subscriptionTier === 'Single-Exam Pass' ||
    raw.subscriptionTier === 'Free Trial'
      ? raw.subscriptionTier
      : 'Universal Multi-Pass';

  const lastSyncTimestampMillis =
    typeof raw.lastSyncTimestampMillis === 'number'
      ? raw.lastSyncTimestampMillis
      : raw.lastSyncTimestamp
      ? new Date(raw.lastSyncTimestamp).getTime() || nowMillis
      : nowMillis;

  return {
    schemaVersion: CANONICAL_SCHEMA_VERSION,
    userId,
    email: raw.email || 'gnmohareb@gmail.com',
    displayName: raw.displayName || 'G. N. Mohareb',
    avatarUrl:
      raw.avatarUrl ||
      raw.photoURL ||
      '/src/assets/images/avatar_gnmohareb_1793219947224.jpg',
    photoURL: raw.photoURL || raw.avatarUrl || '',
    subscriptionTier: tier,
    preferredTheme: raw.preferredTheme === 'light' ? 'light' : 'dark',
    targetExamId: normalizeExamId(raw.targetExamId || 'cissp'),
    dailyStudyGoalMinutes:
      typeof raw.dailyStudyGoalMinutes === 'number' ? raw.dailyStudyGoalMinutes : 45,
    androidDeviceId: raw.androidDeviceId || 'Pixel-8-Pro-G9H3K',
    lastActivePlatform: raw.lastActivePlatform === 'ANDROID' ? 'ANDROID' : 'WEB',
    assessmentCompleted: Boolean(raw.assessmentCompleted ?? true),
    assessmentScorePercent:
      typeof raw.assessmentScorePercent === 'number' ? raw.assessmentScorePercent : 74,
    cognitiveStressBaseline: stressIndex,
    behavioralArchetype: {
      name: archetypeName,
      description: archetypeDescription,
      avgDwellSeconds: averageDwellTimeSec,
      switchRatePercent:
        typeof raw.behavioralArchetype === 'object' &&
        typeof raw.behavioralArchetype?.switchRatePercent === 'number'
          ? raw.behavioralArchetype.switchRatePercent
          : Math.round(optionSwitchCountAvg * 15),
      distractorEliminationRate:
        distractorEliminationRate <= 1
          ? Math.round(distractorEliminationRate * 100)
          : Math.round(distractorEliminationRate),
      accuracyRate:
        typeof raw.assessmentScorePercent === 'number' ? raw.assessmentScorePercent : 74,
      confidenceIndex:
        typeof raw.behavioralArchetype === 'object' &&
        typeof raw.behavioralArchetype?.confidenceIndex === 'number'
          ? raw.behavioralArchetype.confidenceIndex
          : 72,
      recommendedStrategy:
        (typeof raw.behavioralArchetype === 'object' &&
          raw.behavioralArchetype?.recommendedStrategy) ||
        'Trust initial intuition on scenario questions; practice pacing to reserve at least 30 seconds per item for review.',
    },
    hesitationNotes: archetypeDescription,
    averageDwellTimeSec,
    distractorEliminationRate:
      distractorEliminationRate > 1
        ? Math.round(distractorEliminationRate) / 100
        : distractorEliminationRate,
    optionSwitchCountAvg,
    currentJourneyStage:
      typeof raw.currentJourneyStage === 'number' ? clamp(raw.currentJourneyStage, 1, 5) : 2,
    completedSimulationsCount:
      typeof raw.completedSimulationsCount === 'number' ? raw.completedSimulationsCount : 4,
    highestSimulationScore:
      typeof raw.highestSimulationScore === 'number' ? raw.highestSimulationScore : 78,
    examTargetDate: raw.examTargetDate || '2026-12-15',
    deviceSyncedCount: typeof raw.deviceSyncedCount === 'number' ? raw.deviceSyncedCount : 2,
    subscriptions: normalizedSubs,
    lastSyncTimestamp: new Date(lastSyncTimestampMillis).toISOString(),
    lastSyncTimestampMillis,
    createdAt: raw.createdAt || nowIso,
    updatedAt: raw.updatedAt || nowIso,
  };
}

/**
 * Non-destructive migration of legacy Web/Android simulation attempt payloads to canonical schemaVersion 2.
 */
export function migrateLegacyAttempt(
  raw: Record<string, any>,
  fallbackUserId: string = 'usr_gnmohareb_cissp_001'
): SimulationAttempt {
  const nowMillis = Date.now();
  const attemptId = raw.attemptId || raw.sessionId || raw.id || `att_${nowMillis}`;
  const examId = normalizeExamId(raw.examId || 'cissp');
  const scorePercent =
    typeof raw.scorePercent === 'number'
      ? raw.scorePercent
      : typeof raw.overallScorePercent === 'number'
      ? raw.overallScorePercent
      : 0;
  const totalQuestions = typeof raw.totalQuestions === 'number' ? raw.totalQuestions : 10;
  const correctAnswers =
    typeof raw.correctAnswers === 'number'
      ? raw.correctAnswers
      : typeof raw.correctCount === 'number'
      ? raw.correctCount
      : Math.round((scorePercent / 100) * totalQuestions);
  const timeSpentSeconds =
    typeof raw.timeSpentSeconds === 'number'
      ? raw.timeSpentSeconds
      : typeof raw.timeSpentMinutes === 'number'
      ? raw.timeSpentMinutes * 60
      : 600;
  const timeSpentMinutes = Math.max(1, Math.round(timeSpentSeconds / 60));
  const passed =
    typeof raw.passed === 'boolean'
      ? raw.passed
      : typeof raw.isPassed === 'boolean'
      ? raw.isPassed
      : scorePercent >= 70;
  const timestampMillis =
    typeof raw.timestampMillis === 'number'
      ? raw.timestampMillis
      : typeof raw.timestamp === 'number'
      ? raw.timestamp
      : raw.createdAt && typeof raw.createdAt === 'string'
      ? new Date(raw.createdAt).getTime() || nowMillis
      : nowMillis;
  const dateString =
    raw.dateString || raw.date || new Date(timestampMillis).toISOString().split('T')[0];

  const domainScores: Record<string, number> = {};
  const domainBreakdown: Record<string, DomainScoreBreakdown> = {};

  if (typeof raw.domainScoresJson === 'string' && raw.domainScoresJson.trim().startsWith('[')) {
    try {
      const parsed = JSON.parse(raw.domainScoresJson);
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          const dName = item.domainName || item.domainId || 'General';
          const dId = item.domainId || dName;
          const pct = item.scorePercent ?? item.percentage ?? scorePercent;
          domainScores[dName] = pct;
          domainBreakdown[dId] = {
            domainId: dId,
            domainName: dName,
            correctCount: item.correctCount ?? 0,
            totalCount: item.totalCount ?? 0,
            scorePercent: pct,
          };
        }
      }
    } catch {
      // ignore malformed JSON
    }
  } else if (raw.domainScores && typeof raw.domainScores === 'object') {
    for (const [key, val] of Object.entries(raw.domainScores)) {
      if (typeof val === 'number') {
        domainScores[key] = val;
        domainBreakdown[key] = {
          domainId: key,
          domainName: key,
          correctCount: 0,
          totalCount: 0,
          scorePercent: val,
        };
      } else if (val && typeof val === 'object') {
        const v = val as Record<string, any>;
        const pct = v.percent ?? v.scorePercent ?? v.percentage ?? scorePercent;
        const dName = v.domainName || key;
        domainScores[dName] = pct;
        domainBreakdown[key] = {
          domainId: v.domainId || key,
          domainName: dName,
          correctCount: v.correct ?? v.correctCount ?? 0,
          totalCount: v.total ?? v.totalCount ?? 0,
          scorePercent: pct,
        };
      }
    }
  }

  const averageDwellSec =
    typeof raw.averageDwellSec === 'number'
      ? raw.averageDwellSec
      : typeof raw.averageLatencySeconds === 'number'
      ? raw.averageLatencySeconds
      : Math.max(10, Math.round(timeSpentSeconds / Math.max(1, totalQuestions)));

  const stressScore =
    typeof raw.stressScore === 'number'
      ? raw.stressScore
      : typeof raw.behavioralStressScore === 'number'
      ? raw.behavioralStressScore
      : calculateSimulationBehavioralStress(0, passed);

  return {
    attemptId,
    sessionId: attemptId,
    userId: raw.userId || fallbackUserId,
    examId,
    examTitle: raw.examTitle || examId.toUpperCase(),
    attemptType:
      raw.attemptType === 'DOMAIN_PRACTICE' || raw.attemptType === 'DIAGNOSTIC'
        ? raw.attemptType
        : 'FULL_SIMULATION',
    platform: raw.platform === 'ANDROID' ? 'ANDROID' : 'WEB',
    scorePercent,
    passed,
    totalQuestions,
    correctAnswers,
    correctCount: correctAnswers,
    timeSpentSeconds,
    timeSpentMinutes,
    averageDwellSec,
    stressScore,
    eliminatedDistractorsCount:
      typeof raw.eliminatedDistractorsCount === 'number' ? raw.eliminatedDistractorsCount : 0,
    dateString,
    timestampMillis,
    domainScores,
    domainBreakdown,
    schemaVersion: CANONICAL_SCHEMA_VERSION,
    createdAt:
      typeof raw.createdAt === 'string'
        ? raw.createdAt
        : new Date(timestampMillis).toISOString(),
  };
}

/**
 * Non-destructive migration of legacy Web/Android flashcard payloads to canonical schemaVersion 2.
 */
export function migrateLegacyFlashcard(
  raw: Record<string, any>,
  fallbackUserId: string = 'usr_gnmohareb_cissp_001'
): FlashcardProgress {
  const nowMillis = Date.now();
  const nowIso = new Date(nowMillis).toISOString();
  const cardId = raw.cardId || raw.id || `fc_${nowMillis}`;
  const examId = normalizeExamId(raw.examId || 'cissp');
  const domainId = raw.domainId || raw.domain || 'd1';
  const domain = raw.domain || raw.domainId || 'Security & Risk Management';

  const boxLevel =
    typeof raw.boxLevel === 'number'
      ? Math.min(5, Math.max(1, Math.round(raw.boxLevel)))
      : flashcardStateToBox(raw.state || raw.status);
  const state = flashcardBoxToState(boxLevel);
  const status = boxLevel >= 3 ? 'KNOWN' : boxLevel === 2 ? 'NEEDS_REVIEW' : 'UNREVIEWED';

  const lastReviewedEpoch =
    typeof raw.lastReviewedEpoch === 'number'
      ? raw.lastReviewedEpoch
      : typeof raw.lastReviewedEpochMillis === 'number'
      ? raw.lastReviewedEpochMillis
      : raw.updatedAt && typeof raw.updatedAt === 'string'
      ? new Date(raw.updatedAt).getTime() || nowMillis
      : nowMillis;

  return {
    userId: raw.userId || fallbackUserId,
    cardId,
    id: cardId,
    examId,
    domainId,
    domain,
    boxLevel,
    state,
    status,
    reviewCount: typeof raw.reviewCount === 'number' ? raw.reviewCount : 1,
    lastReviewedEpoch,
    platform: raw.platform === 'ANDROID' ? 'ANDROID' : 'WEB',
    schemaVersion: CANONICAL_SCHEMA_VERSION,
    createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : nowIso,
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : new Date(lastReviewedEpoch).toISOString(),
  };
}

/**
 * Non-destructive migration of legacy Web/Android study plan payloads to canonical schemaVersion 2.
 */
export function migrateLegacyStudyPlan(
  raw: Record<string, any>,
  fallbackUserId: string = 'usr_gnmohareb_cissp_001'
): StudyPlan {
  const nowMillis = Date.now();
  const nowIso = new Date(nowMillis).toISOString();
  const examId = normalizeExamId(raw.examId || 'cissp');
  const planId = raw.planId || `plan_${examId}`;

  let milestones: StudyPlanMilestone[] = [];
  if (Array.isArray(raw.milestones)) {
    milestones = raw.milestones;
  } else if (typeof raw.milestonesJson === 'string' && raw.milestonesJson.trim().startsWith('[')) {
    try {
      milestones = JSON.parse(raw.milestonesJson);
    } catch {
      milestones = [];
    }
  }

  return {
    planId,
    userId: raw.userId || fallbackUserId,
    examId,
    targetDate: raw.targetDate || '2026-12-15',
    weeklyHours: typeof raw.weeklyHours === 'number' ? raw.weeklyHours : 12,
    focusDomains: Array.isArray(raw.focusDomains)
      ? raw.focusDomains
      : ['Security Architecture & Engineering', 'Security Assessment & Testing'],
    status:
      raw.status === 'COMPLETED' || raw.status === 'PAUSED' ? raw.status : 'ACTIVE',
    currentStage: typeof raw.currentStage === 'number' ? clamp(raw.currentStage, 1, 5) : 1,
    readinessPercent:
      typeof raw.readinessPercent === 'number' ? clamp(raw.readinessPercent, 0, 100) : 70,
    passProbabilityPercent:
      typeof raw.passProbabilityPercent === 'number'
        ? clamp(raw.passProbabilityPercent, 0, 100)
        : 74,
    passGuaranteeQualified: Boolean(raw.passGuaranteeQualified),
    milestones,
    milestonesJson: JSON.stringify(milestones),
    updatedAtMillis:
      typeof raw.updatedAtMillis === 'number' ? raw.updatedAtMillis : nowMillis,
    schemaVersion: CANONICAL_SCHEMA_VERSION,
    createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : nowIso,
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : nowIso,
  };
}

/**
 * Non-destructive migration of custom study source documents to canonical schemaVersion 2.
 */
export function migrateLegacyStudySource(
  raw: Record<string, any>,
  fallbackUserId: string = 'usr_gnmohareb_cissp_001'
): StudySource {
  const nowMillis = Date.now();
  const nowIso = new Date(nowMillis).toISOString();
  const id = raw.id || raw.sourceId || `src_${nowMillis}`;
  return {
    id,
    sourceId: id,
    userId: raw.userId || fallbackUserId,
    examId: normalizeExamId(raw.examId || 'cissp'),
    domainId: raw.domainId || 'd1',
    domainName: raw.domainName || 'Security & Risk Management',
    title: raw.title || 'Custom Study Note',
    authorOrStandard: raw.authorOrStandard || 'Custom Verified Source',
    type: raw.type || 'OFFICIAL_GUIDE',
    summary: raw.summary || '',
    keyTakeaways: Array.isArray(raw.keyTakeaways) ? raw.keyTakeaways : [],
    fullContent: raw.fullContent || raw.summary || '',
    platform: raw.platform === 'ANDROID' ? 'ANDROID' : 'WEB',
    cachedAtMillis: typeof raw.cachedAtMillis === 'number' ? raw.cachedAtMillis : nowMillis,
    updatedAtMillis:
      typeof raw.updatedAtMillis === 'number' ? raw.updatedAtMillis : nowMillis,
    schemaVersion: CANONICAL_SCHEMA_VERSION,
    createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : nowIso,
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : nowIso,
  };
}
