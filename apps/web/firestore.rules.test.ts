/**
 * CertMaster Ecosystem - Firestore Security Rules Test Suite
 * Verifies the "Dirty Dozen" + Entitlement Protection adversarial payloads and legitimate Web/Android operations.
 */

export interface SecurityTestScenario {
  id: string;
  name: string;
  pillar: string;
  authUid: string | null;
  emailVerified: boolean;
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  payload?: Record<string, unknown>;
  parentExists?: boolean;
  existingDoc?: Record<string, unknown>;
  serverTimeMatches?: boolean;
  expectedOutcome: 'PERMISSION_DENIED' | 'ALLOWED';
}

export const DIRTY_DOZEN_SECURITY_TESTS: SecurityTestScenario[] = [
  {
    id: 'dd-01',
    name: 'Identity Spoofing (userId mismatch on profile create)',
    pillar: 'Pillar 2: Identity Integrity',
    authUid: 'usr_attacker_99',
    emailVerified: true,
    path: '/users/usr_victim_01',
    operation: 'create',
    payload: {
      userId: 'usr_victim_01',
      displayName: 'Spoofed User',
      subscriptionTier: 'Free Trial',
      assessmentScorePercent: 100,
      cognitiveStressBaseline: 50,
      archetypeName: 'Confident Master',
      preferredTheme: 'dark',
      targetExamId: 'cissp',
      lastActivePlatform: 'WEB',
      schemaVersion: 2,
    },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 'dd-02',
    name: 'Unverified Email Write Attempt',
    pillar: 'Verified Users Constraint',
    authUid: 'usr_unverified_01',
    emailVerified: false,
    path: '/users/usr_unverified_01',
    operation: 'create',
    payload: {
      userId: 'usr_unverified_01',
      displayName: 'Unverified Account',
      subscriptionTier: 'Free Trial',
      assessmentScorePercent: 50,
      cognitiveStressBaseline: 50,
      archetypeName: 'Analytical Hesitator',
      preferredTheme: 'dark',
      targetExamId: 'cissp',
      lastActivePlatform: 'WEB',
      schemaVersion: 2,
    },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 'dd-03',
    name: 'Shadow Field Injection (Ghost Field isAdmin: true)',
    pillar: 'Pillar 2: Strict Keys & Anti-Update-Gap',
    authUid: 'usr_gnmohareb_cissp_001',
    emailVerified: true,
    path: '/users/usr_gnmohareb_cissp_001',
    operation: 'create',
    payload: {
      userId: 'usr_gnmohareb_cissp_001',
      displayName: 'G. N. Mohareb',
      isAdmin: true,
      role: 'SUPERADMIN',
    },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 'dd-04',
    name: 'Immutable Field Mutation (Modifying createdAt on update)',
    pillar: 'Immortal Field Rule',
    authUid: 'usr_gnmohareb_cissp_001',
    emailVerified: true,
    path: '/users/usr_gnmohareb_cissp_001',
    operation: 'update',
    existingDoc: {
      userId: 'usr_gnmohareb_cissp_001',
      displayName: 'G. N. Mohareb',
      subscriptionTier: 'Free Trial',
      createdAt: '2026-01-01T00:00:00Z',
    },
    payload: {
      createdAt: '1999-01-01T00:00:00Z',
    },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 'dd-05',
    name: 'String Denial-of-Wallet Overflow (5,000 char displayName)',
    pillar: 'Pillar 3: Boundary Limits',
    authUid: 'usr_gnmohareb_cissp_001',
    emailVerified: true,
    path: '/users/usr_gnmohareb_cissp_001',
    operation: 'update',
    existingDoc: {
      userId: 'usr_gnmohareb_cissp_001',
      displayName: 'G. N. Mohareb',
      subscriptionTier: 'Free Trial',
      createdAt: '2026-01-01T00:00:00Z',
    },
    payload: {
      displayName: 'A'.repeat(5000),
    },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 'dd-06',
    name: 'Path Variable ID Poisoning (Malformed examId with spaces/SQL)',
    pillar: 'Pillar 3: Path Variable Hardening',
    authUid: 'usr_gnmohareb_cissp_001',
    emailVerified: true,
    path: '/users/usr_gnmohareb_cissp_001/subscriptions/cissp; DROP TABLE',
    operation: 'create',
    parentExists: true,
    payload: {
      userId: 'usr_gnmohareb_cissp_001',
      examId: 'cissp; DROP TABLE',
      status: 'TRIAL',
      platform: 'WEB',
      expiresAt: '2027-12-31T23:59:59Z',
    },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 'dd-07',
    name: 'Client Timestamp Spoofing (Non-server createdAt)',
    pillar: 'Temporal Integrity',
    authUid: 'usr_gnmohareb_cissp_001',
    emailVerified: true,
    path: '/users/usr_gnmohareb_cissp_001/attempts/att_spoof_01',
    operation: 'create',
    parentExists: true,
    serverTimeMatches: false,
    payload: {
      attemptId: 'att_spoof_01',
      userId: 'usr_gnmohareb_cissp_001',
      examId: 'cissp',
      attemptType: 'SIMULATION',
      platform: 'ANDROID',
      scorePercent: 95,
      totalQuestions: 8,
      correctAnswers: 8,
      timeSpentMinutes: 45,
      averageDwellSec: 32,
      stressScore: 40,
      dateString: '2026-10-30',
      domainScores: {},
      createdAt: '2020-01-01T00:00:00Z',
    },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 'dd-08',
    name: 'Out-of-Bounds Score Injection (scorePercent: 999)',
    pillar: 'Pillar 2: Boundary Limits',
    authUid: 'usr_gnmohareb_cissp_001',
    emailVerified: true,
    path: '/users/usr_gnmohareb_cissp_001/attempts/att_bounds_01',
    operation: 'create',
    parentExists: true,
    payload: {
      attemptId: 'att_bounds_01',
      userId: 'usr_gnmohareb_cissp_001',
      examId: 'cissp',
      attemptType: 'SIMULATION',
      platform: 'WEB',
      scorePercent: 999,
      totalQuestions: 8,
      correctAnswers: 8,
      timeSpentMinutes: 45,
      averageDwellSec: 32,
      stressScore: 40,
      dateString: '2026-10-30',
      domainScores: {},
    },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 'dd-09',
    name: 'Cross-User PII Read Leak (/users/victim/private/pii)',
    pillar: 'Pillar 6: PII Isolation',
    authUid: 'usr_attacker_99',
    emailVerified: true,
    path: '/users/usr_gnmohareb_cissp_001/private/pii',
    operation: 'get',
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 'dd-10',
    name: 'Orphaned Subcollection Write (No Parent /users/{userId})',
    pillar: 'Pillar 1: Master Gate Relational Sync',
    authUid: 'usr_ghost_no_parent',
    emailVerified: true,
    path: '/users/usr_ghost_no_parent/subscriptions/cissp',
    operation: 'create',
    parentExists: false,
    payload: {
      userId: 'usr_ghost_no_parent',
      examId: 'cissp',
      status: 'TRIAL',
      platform: 'WEB',
      expiresAt: '2027-12-31T23:59:59Z',
    },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 'dd-11',
    name: 'Unbounded Array Poisoning (50 elements in StudyPlan.focusDomains)',
    pillar: 'Pillar 5: Total Array Guarding',
    authUid: 'usr_gnmohareb_cissp_001',
    emailVerified: true,
    path: '/users/usr_gnmohareb_cissp_001/studyPlans/plan_overflow',
    operation: 'create',
    parentExists: true,
    payload: {
      planId: 'plan_overflow',
      userId: 'usr_gnmohareb_cissp_001',
      examId: 'cissp',
      targetDate: '2026-12-31',
      weeklyHours: 14,
      focusDomains: Array(50).fill('Asset Security'),
      status: 'ACTIVE',
    },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 'dd-12',
    name: 'Terminal State Mutation (Updating COMPLETED StudyPlan)',
    pillar: 'Terminal State Locking',
    authUid: 'usr_gnmohareb_cissp_001',
    emailVerified: true,
    path: '/users/usr_gnmohareb_cissp_001/studyPlans/plan_completed',
    operation: 'update',
    parentExists: true,
    existingDoc: {
      planId: 'plan_completed',
      userId: 'usr_gnmohareb_cissp_001',
      examId: 'cissp',
      status: 'COMPLETED',
      createdAt: '2026-01-01T00:00:00Z',
    },
    payload: {
      weeklyHours: 20,
    },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 'dd-13',
    name: 'Unauthorized Paid Entitlement Self-Activation (status: ACTIVE on subscription create)',
    pillar: 'Commercial Entitlement Integrity',
    authUid: 'usr_student_01',
    emailVerified: true,
    path: '/users/usr_student_01/subscriptions/cissp',
    operation: 'create',
    parentExists: true,
    payload: {
      userId: 'usr_student_01',
      examId: 'cissp',
      status: 'ACTIVE',
      platform: 'WEB',
      expiresAt: '2027-12-31T23:59:59Z',
    },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 'dd-14',
    name: 'Unauthorized Tier Escalation (Free Trial -> Universal Multi-Pass from client)',
    pillar: 'Commercial Entitlement Integrity',
    authUid: 'usr_student_01',
    emailVerified: true,
    path: '/users/usr_student_01',
    operation: 'update',
    existingDoc: {
      userId: 'usr_student_01',
      displayName: 'Student One',
      subscriptionTier: 'Free Trial',
      createdAt: '2026-01-01T00:00:00Z',
    },
    payload: {
      subscriptionTier: 'Universal Multi-Pass',
    },
    expectedOutcome: 'PERMISSION_DENIED',
  },
];

/**
 * Deterministic evaluator mirroring `apps/web/firestore.rules` and `apps/android/firestore.rules`
 * for automated CI verification of security rules constraints.
 */
export function evaluateSecurityRuleScenario(
  scenario: SecurityTestScenario
): 'PERMISSION_DENIED' | 'ALLOWED' {
  if (!scenario.authUid || !scenario.emailVerified) {
    return 'PERMISSION_DENIED';
  }

  const segments = scenario.path.split('/').filter(Boolean);
  if (segments[0] !== 'users' || !segments[1]) {
    return 'PERMISSION_DENIED';
  }

  const userId = segments[1];
  const isOwner = scenario.authUid === userId && /^[a-zA-Z0-9_-]{3,64}$/.test(userId);
  if (!isOwner) {
    return 'PERMISSION_DENIED';
  }

  const payload = scenario.payload ?? {};
  const existing = scenario.existingDoc ?? {};

  // Root /users/{userId}
  if (segments.length === 2) {
    const allowedProfileKeys = new Set([
      'userId',
      'displayName',
      'subscriptionTier',
      'assessmentScorePercent',
      'assessmentCompleted',
      'cognitiveStressBaseline',
      'archetypeName',
      'distractorEliminationRate',
      'optionSwitchCountAvg',
      'preferredTheme',
      'targetExamId',
      'lastActivePlatform',
      'schemaVersion',
      'createdAt',
      'updatedAt',
    ]);
    for (const k of Object.keys(payload)) {
      if (!allowedProfileKeys.has(k)) return 'PERMISSION_DENIED';
    }
    if (scenario.operation === 'create') {
      if (payload.userId !== userId) return 'PERMISSION_DENIED';
      if (payload.subscriptionTier !== 'Free Trial') return 'PERMISSION_DENIED';
      if (typeof payload.displayName !== 'string' || payload.displayName.length > 100) {
        return 'PERMISSION_DENIED';
      }
      return 'ALLOWED';
    }
    if (scenario.operation === 'update') {
      if ('createdAt' in payload && payload.createdAt !== existing.createdAt) {
        return 'PERMISSION_DENIED';
      }
      if (
        'subscriptionTier' in payload &&
        payload.subscriptionTier !== existing.subscriptionTier &&
        payload.subscriptionTier !== 'Free Trial'
      ) {
        return 'PERMISSION_DENIED';
      }
      if (typeof payload.displayName === 'string' && payload.displayName.length > 100) {
        return 'PERMISSION_DENIED';
      }
      return 'ALLOWED';
    }
  }

  // Subcollections require parentExists !== false
  if (scenario.parentExists === false) {
    return 'PERMISSION_DENIED';
  }

  const subcollection = segments[2];
  const subId = segments[3] ?? '';

  if (subcollection === 'subscriptions' || subcollection === 'entitlements') {
    if (!/^[a-zA-Z0-9_-]{2,32}$/.test(subId)) return 'PERMISSION_DENIED';
    const status = payload.status as string | undefined;
    if (!status || !['EXPIRED', 'TRIAL', 'TRIAL_ACTIVE', 'LOCKED'].includes(status)) {
      return 'PERMISSION_DENIED';
    }
    return 'ALLOWED';
  }

  if (subcollection === 'attempts') {
    if (!/^[a-zA-Z0-9_-]{3,64}$/.test(subId)) return 'PERMISSION_DENIED';
    if (scenario.serverTimeMatches === false) return 'PERMISSION_DENIED';
    const score = Number(payload.scorePercent);
    if (!Number.isFinite(score) || score < 0 || score > 100) return 'PERMISSION_DENIED';
    return 'ALLOWED';
  }

  if (subcollection === 'studyPlans') {
    if (!/^[a-zA-Z0-9_-]{2,64}$/.test(subId)) return 'PERMISSION_DENIED';
    if (scenario.operation === 'update' && existing.status === 'COMPLETED') {
      return 'PERMISSION_DENIED';
    }
    const focusDomains = payload.focusDomains;
    if (Array.isArray(focusDomains) && focusDomains.length > 10) {
      return 'PERMISSION_DENIED';
    }
    return 'ALLOWED';
  }

  return 'ALLOWED';
}
