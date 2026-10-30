/**
 * CertMaster Unified Ecosystem - Shared Domain & Data Model Types
 * Authoritative Data Contract v2.0 (Shared between CertMaster Web Platform & CertMaster Android App)
 *
 * Firebase Project ID: gen-lang-client-0788513176
 * Firestore Database ID: ai-studio-certmasterwebpla-ad2ba0f9-3a61-45af-b60a-14f5eb4f6001
 */

export const CERTMASTER_SCHEMA_VERSION = 2;

export type VendorType =
  | 'ISC2'
  | 'AWS'
  | 'CompTIA'
  | 'ISACA'
  | 'PMI'
  | 'EC-Council'
  | 'Google Cloud'
  | 'Cisco'
  | 'Microsoft'
  | 'Kubernetes'
  | 'HashiCorp'
  | 'Linux & Cloud Native';

export type SubscriptionStatus = 'ACTIVE' | 'EXPIRED' | 'TRIAL' | 'LOCKED';
export type PlatformOrigin = 'WEB' | 'ANDROID';
export type SubscriptionTierType = 'Universal Multi-Pass' | 'Single-Exam Pass' | 'Free Trial';

// ============================================================================
// 1. CERTIFICATION PROVIDERS & PROGRAMS
// ============================================================================
export interface CertificationProvider {
  providerId: VendorType;
  displayName: string;
  officialUrl: string;
  totalPrograms: number;
  activeBanksCount: number;
}

export interface CertificationProgram {
  programId: string;
  providerId: VendorType;
  title: string;
  level: 'Associate' | 'Professional' | 'Expert' | 'Specialty';
  renewalCycleYears: number;
  cpeRequired: number;
}

// ============================================================================
// 2. DOMAINS, LEARNING OBJECTIVES & EXAM CATALOG
// ============================================================================
export interface LearningObjective {
  objectiveId: string;
  code: string;
  title: string;
  bloomTaxonomyLevel: 'Remember' | 'Understand' | 'Apply' | 'Analyze' | 'Evaluate';
}

export interface ExamDomain {
  id: string;
  name: string;
  weight: number;
  objectives?: LearningObjective[];
}

export interface ExamBank {
  id: string;
  code: string;
  title: string;
  vendor: VendorType;
  questionsCount: number;
  passRatePercent: number;
  durationMinutes: number;
  price: number;
  difficulty: 'Associate' | 'Professional' | 'Expert' | 'Specialty';
  domains: ExamDomain[];
  description: string;
  isPopular?: boolean;
}

// ============================================================================
// 3. QUESTION BANKS, CITATIONS & DIAGNOSTIC / PRACTICE EXAMS
// ============================================================================
export interface QuestionOption {
  id: string;
  text: string;
  letter: string;
}

export interface NotebookLMCitation {
  authority: string; // e.g. "NIST SP 800-53 Rev 5"
  section: string; // e.g. "AC-3: Access Enforcement"
  note: string; // Synthesized authoritative context
  sourceDocument: string;
}

export interface ExamQuestion {
  id: string;
  examId: string;
  domain: string;
  domainNumber: number;
  difficulty: 'Foundational' | 'Intermediate' | 'Advanced' | 'CBK-Scenario';
  scenario?: string;
  prompt: string;
  options: QuestionOption[];
  correctOptionId: string;
  explanation: string;
  citation: NotebookLMCitation;
}

export interface DiagnosticAssessment {
  assessmentId: string;
  examId: string;
  title: string;
  questionCount: number;
  durationMinutes: number;
  measuresBehavioralArchetype: boolean;
}

export interface PracticeExamConfig {
  practiceExamId: string;
  examId: string;
  mode: 'SIMULATION' | 'DIAGNOSTIC' | 'PRACTICE';
  durationMinutes: number;
  questionIds: string[];
  strictTimer: boolean;
}

// ============================================================================
// 4. SUBSCRIPTIONS & ENTITLEMENTS (/users/{userId}/subscriptions/{examId})
// ============================================================================
export interface SubscriptionEntitlement {
  examId: string;
  status: SubscriptionStatus;
  platform: PlatformOrigin;
  expiresAt: string | null;
  lastSyncedAt: string;
}

export interface FirestoreSubscriptionDoc {
  userId: string;
  examId: string;
  status: SubscriptionStatus;
  platform: PlatformOrigin;
  expiresAt: string;
  createdAt: unknown;
  updatedAt: unknown;
}

// ============================================================================
// 5. USERS, PROFILES & BEHAVIORAL ARCHETYPES (/users/{userId})
// ============================================================================
export interface BehavioralArchetype {
  name: string;
  description: string;
  avgDwellSeconds: number;
  switchRatePercent: number;
  distractorEliminationRate: number;
  accuracyRate: number;
  confidenceIndex: number; // 0 - 100
  recommendedStrategy: string;
}

export interface UserCentralProfile {
  userId: string;
  email: string;
  displayName: string;
  avatarUrl: string;
  subscriptionTier: SubscriptionTierType;
  subscriptions: Record<string, SubscriptionEntitlement>;
  assessmentScorePercent: number;
  cognitiveStressBaseline: number;
  behavioralArchetype: BehavioralArchetype;
  lastSyncTimestamp: string;
  androidDeviceId?: string;
  preferredTheme?: 'dark' | 'light';
  targetExamId?: string;
  dailyStudyGoalMinutes?: number;
  lastActivePlatform?: PlatformOrigin;
  schemaVersion?: number;
}

export interface FirestoreUserProfileDoc {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  subscriptionTier: SubscriptionTierType;
  assessmentScorePercent: number;
  cognitiveStressBaseline: number;
  archetypeName: string;
  archetypeDescription?: string;
  avgDwellSeconds?: number;
  switchRatePercent?: number;
  distractorEliminationRate?: number;
  confidenceIndex?: number;
  recommendedStrategy?: string;
  preferredTheme: 'dark' | 'light';
  targetExamId: string;
  dailyStudyGoalMinutes?: number;
  androidDeviceId?: string;
  lastActivePlatform: PlatformOrigin;
  schemaVersion: number;
  createdAt: unknown;
  updatedAt: unknown;
}

export interface FirestoreUserPrivatePIIDoc {
  userId: string;
  email: string;
  createdAt: unknown;
  updatedAt: unknown;
}

// ============================================================================
// 6. EXAMINATION ATTEMPTS, TELEMETRY & ANALYTICS (/users/{userId}/attempts/{attemptId})
// ============================================================================
export interface TelemetryRecord {
  questionId: string;
  dwellDurationMs: number;
  optionSwitches: number;
  selectedOption: string | null;
  eliminatedOptions: string[];
  isFlagged: boolean;
  isCorrect: boolean;
  timestamp: number;
}

export interface HistoricalExamAttempt {
  id: string;
  date: string;
  examId: string;
  scorePercent: number;
  timeSpentMinutes: number;
  domainScores: Record<string, number>;
  averageDwellSec: number;
  stressScore: number;
  platform?: PlatformOrigin;
  attemptType?: 'SIMULATION' | 'DIAGNOSTIC' | 'PRACTICE';
  totalQuestions?: number;
  correctAnswers?: number;
}

export interface FirestoreExamAttemptDoc {
  attemptId: string;
  userId: string;
  examId: string;
  attemptType: 'SIMULATION' | 'DIAGNOSTIC' | 'PRACTICE';
  platform: PlatformOrigin;
  scorePercent: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpentMinutes: number;
  averageDwellSec: number;
  stressScore: number;
  dateString: string;
  domainScores: Record<string, number>;
  createdAt: unknown;
}

// ============================================================================
// 7. STUDY PLANS, READINESS, FLASHCARDS & AI STUDY MATERIALS
// ============================================================================
export interface StudyPlanDoc {
  planId: string;
  userId: string;
  examId: string;
  targetDate: string;
  weeklyHours: number;
  focusDomains: string[];
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface ExamReadinessDoc {
  userId: string;
  examId: string;
  readinessScore: number;
  passProbability: number;
  simulationsCompleted: number;
  weakestDomain: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface LearningProgressDoc {
  userId: string;
  examId: string;
  completedGuideIds: string[];
  completedAudioIds: string[];
  masteredFlashcardCount: number;
  totalStudyMinutes: number;
}

export interface PerformanceAnalyticsSummary {
  userId: string;
  examId: string;
  meanAccuracyPercent: number;
  meanDwellSeconds: number;
  stressIndex: number;
  domainMasteryMap: Record<string, number>;
  platformBreakdown: {
    webAttempts: number;
    androidAttempts: number;
  };
}

export interface Flashcard {
  id: string;
  domain: string;
  front: string;
  back: string;
  reference: string;
  state: 'unstudied' | 'known' | 'needs_review';
  reviewCount?: number;
  platform?: PlatformOrigin;
}

export interface FirestoreFlashcardProgressDoc {
  userId: string;
  cardId: string;
  examId: string;
  domain: string;
  state: 'unstudied' | 'known' | 'needs_review';
  reviewCount: number;
  platform: PlatformOrigin;
  createdAt: unknown;
  updatedAt: unknown;
}

export interface AudioDialogueTurn {
  speaker: 'Maya' | 'Liam';
  text: string;
  timestampSec: number;
}

export interface AudioBriefing {
  id: string;
  title: string;
  domain: string;
  durationFormatted: string;
  durationSeconds: number;
  dialogue: AudioDialogueTurn[];
}

export interface StudyGuide {
  id: string;
  domain: string;
  domainNumber?: number;
  title: string;
  readTimeMin: number;
  summary: string;
  content: string[];
  officialReference: string;
  keyTakeaways: string[];
}

// ============================================================================
// 8. SYNC AUDIT LOGS & VERIFICATION TESTS (/users/{userId}/syncEvents/{eventId})
// ============================================================================
export interface SyncAuditLog {
  id: string;
  timestamp: string;
  direction: 'WEB_TO_ANDROID' | 'ANDROID_TO_WEB';
  action: string;
  status: 'SUCCESS' | 'SYNCING' | 'PENDING';
  payloadSummary: string;
}

export interface FirestoreSyncEventDoc {
  eventId: string;
  userId: string;
  direction: 'WEB_TO_ANDROID' | 'ANDROID_TO_WEB';
  action: string;
  status: 'SUCCESS' | 'SYNCING' | 'PENDING';
  payloadSummary: string;
  createdAt: unknown;
}

export interface IntegrationTestResult {
  id: string;
  name: string;
  category: 'Authentication' | 'Catalog & Schema' | 'Progress Sync' | 'Analytics Parity' | 'Security Rules';
  status: 'IDLE' | 'RUNNING' | 'PASSED' | 'FAILED';
  durationMs?: number;
  details: string;
}
