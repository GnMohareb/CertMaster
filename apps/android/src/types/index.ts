export type SubStatus = 'ACTIVE' | 'EXPIRED' | 'TRIAL' | 'LOCKED';

export type PlatformOrigin = 'WEB' | 'ANDROID' | 'UNIVERSAL_SYNC';

export type SsoProviderType = 
  | 'Google Identity Services (OIDC)' 
  | 'Enterprise SAML 2.0' 
  | 'Microsoft Entra ID (Azure AD)' 
  | 'Okta Single Sign-On' 
  | 'Email Magic Link';

export interface SsoSessionInfo {
  isAuthenticated: boolean;
  provider: SsoProviderType;
  issuer: string;
  clientId: string;
  ssoSubjectId: string;
  email: string;
  displayName: string;
  emailVerified: boolean;
  grantedScopes: string[];
  sessionStartedAt: number;
  tokenExpiresAt: number;
  jwtTokenPreview: string;
  androidDeviceId: string;
  syncStatus: 'SYNCHRONIZED' | 'PENDING' | 'DISCONNECTED';
}

export interface ExamSubscription {
  examId: string;
  examTitle: string;
  shortCode: string;
  vendor: string;
  status: SubStatus;
  subscribedPlatform: PlatformOrigin;
  validUntilDate: string;
  priceFormatted: string;
  universalAccess: boolean;
  activeSessionsCount: number;
}

export interface JourneyMilestone {
  stage: number; // 1 to 5
  stageName: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'LOCKED' | 'READY';
  score?: number;
  lastUpdated?: string;
  description: string;
  actionLabel: string;
  actionRoute: string;
}

export interface UserCentralProfile {
  userId: string;
  email: string;
  displayName: string;
  avatarUrl: string;
  subscriptionTier: 'Universal Multi-Pass' | 'Single-Exam Pass' | 'Free Trial';
  subscriptions: Record<string, ExamSubscription>;
  assessmentCompleted: boolean;
  assessmentScorePercent: number;
  cognitiveStressBaseline: number; // 0 - 100
  behavioralArchetype: 'Analytical Hesitator' | 'Confident Master' | 'Fast Guesser' | 'Deliberate Strategist' | 'Methodical Verifier';
  hesitationNotes: string;
  averageDwellTimeSec: number;
  distractorEliminationRate: number;
  optionSwitchCountAvg: number;
  lastSyncTimestampMillis: number;
  deviceSyncedCount: number;
  currentJourneyStage?: number; // 1 to 5
  completedSimulationsCount?: number;
  highestSimulationScore?: number;
  examTargetDate?: string;
}

export type QuestionDifficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'SCENARIO_BASED';

export interface SourceCitation {
  title: string;
  sectionOrPage: string;
  standardOrFramework: string;
}

export interface Question {
  id: string;
  examId: string;
  domainId: string;
  domainName: string;
  questionText: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  optionAnalysis: Record<number, string>;
  citation: SourceCitation;
  difficulty: QuestionDifficulty;
}

export interface ExamDomain {
  id: string;
  orderNumber: number;
  name: string;
  weightPercent: number;
  summary: string;
  keyTopics: string[];
  iconName: string;
}

export interface ExamConfig {
  id: string;
  title: string;
  shortCode: string;
  vendor: string;
  category: string;
  description: string;
  passingScorePercent: number;
  defaultSimulationCount: number;
  totalBankQuestions: number;
  durationMinutes: number;
  primaryColorHex: string;
  domains: ExamDomain[];
  isPopular?: boolean;
}

export interface BehavioralTelemetryEvent {
  questionId: string;
  timestamp: number;
  eventType: 'VIEW' | 'STRIKE_DISTRACTOR' | 'SELECT_OPTION' | 'SWITCH_OPTION' | 'FLAG' | 'UNFLAG' | 'CONFIRM';
  optionIndex?: number;
  dwellTimeMs?: number;
}

export interface SimulationResult {
  sessionId: string;
  examId: string;
  examTitle: string;
  timestamp: number;
  totalQuestions: number;
  correctCount: number;
  scorePercent: number;
  passed: boolean;
  timeSpentSeconds: number;
  domainScores: Record<string, { total: number; correct: number; percent: number }>;
  behavioralStressScore: number;
  eliminatedDistractorsCount: number;
  averageLatencySeconds: number;
}

export interface DomainPerformancePoint {
  date: string;
  timestamp: number;
  domainId: string;
  domainName: string;
  scorePercent: number;
  avgResponseTimeSec: number;
  stressFactor: number; // 0 - 100
}

export interface DialogueTurn {
  speaker: string;
  text: string;
  timeSeconds: number;
}

export interface AudioOverview {
  id: string;
  examId: string;
  domainId: string;
  title: string;
  subtitle: string;
  durationSeconds: number;
  host1: string;
  host2: string;
  keyConceptsCovered: string[];
  turns: DialogueTurn[];
}

export interface SourceDoc {
  id: string;
  examId: string;
  domainId: string;
  domainName: string;
  title: string;
  authorOrStandard: string;
  type: string;
  summary: string;
  keyTakeaways: string[];
  fullContent: string;
}

export interface Flashcard {
  id: string;
  examId: string;
  domainId: string;
  domainName: string;
  frontPrompt: string;
  backAnswer: string;
  keyFormulaOrRule: string;
  sourceCitation: string;
  boxLevel: number; // 1, 2, 3
  status?: 'UNREVIEWED' | 'KNOWN' | 'NEEDS_REVIEW';
}

export interface SyncApiResponse {
  success: boolean;
  status: string;
  syncedTimestamp: number;
  changesApplied: number;
  entitlements: Record<string, string>;
  message: string;
}
