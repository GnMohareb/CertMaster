import { UserCentralProfile, ExamSubscription, SyncApiResponse, SimulationResult } from '../types';
import { CATALOG_112_EXAMS } from '../data/catalog112';

const STORAGE_KEY_PROFILE = 'certmaster_central_user_profile';
const STORAGE_KEY_RESULTS = 'certmaster_simulation_history';
const STORAGE_KEY_LOGS = 'certmaster_cloud_sync_logs';

export const DEFAULT_USER_PROFILE: UserCentralProfile = {
  userId: 'usr_gnmohareb_cissp_001',
  email: 'gnmohareb@gmail.com',
  displayName: 'GN Mohareb',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
  subscriptionTier: 'Universal Multi-Pass',
  subscriptions: {
    'cissp': {
      examId: 'cissp',
      examTitle: 'Certified Information Systems Security Professional',
      shortCode: 'CISSP',
      vendor: '(ISC)²',
      status: 'ACTIVE',
      subscribedPlatform: 'WEB',
      validUntilDate: 'Dec 31, 2027',
      priceFormatted: '$29.00',
      universalAccess: true,
      activeSessionsCount: 14
    },
    'aws-saa': {
      examId: 'aws-saa',
      examTitle: 'AWS Certified Solutions Architect – Associate',
      shortCode: 'AWS SAA-C03',
      vendor: 'Amazon Web Services',
      status: 'ACTIVE',
      subscribedPlatform: 'ANDROID',
      validUntilDate: 'Nov 15, 2027',
      priceFormatted: '$29.00',
      universalAccess: true,
      activeSessionsCount: 8
    },
    'sec-plus': {
      examId: 'sec-plus',
      examTitle: 'CompTIA Security+ SY0-701',
      shortCode: 'Sec+ SY0-701',
      vendor: 'CompTIA',
      status: 'ACTIVE',
      subscribedPlatform: 'UNIVERSAL_SYNC',
      validUntilDate: 'Oct 30, 2027',
      priceFormatted: '$29.00',
      universalAccess: true,
      activeSessionsCount: 5
    },
    'cism': {
      examId: 'cism',
      examTitle: 'Certified Information Security Manager',
      shortCode: 'CISM',
      vendor: 'ISACA',
      status: 'TRIAL',
      subscribedPlatform: 'WEB',
      validUntilDate: 'Expires in 6 days',
      priceFormatted: '$29.00',
      universalAccess: true,
      activeSessionsCount: 2
    },
    'ceh': {
      examId: 'ceh',
      examTitle: 'Certified Ethical Hacker v12',
      shortCode: 'CEH v12',
      vendor: 'EC-Council',
      status: 'LOCKED',
      subscribedPlatform: 'WEB',
      validUntilDate: 'Not Subscribed',
      priceFormatted: '$29.00',
      universalAccess: true,
      activeSessionsCount: 0
    },
    'pmp': {
      examId: 'pmp',
      examTitle: 'Project Management Professional',
      shortCode: 'PMP®',
      vendor: 'Project Management Institute',
      status: 'ACTIVE',
      subscribedPlatform: 'UNIVERSAL_SYNC',
      validUntilDate: 'Jan 20, 2028',
      priceFormatted: '$29.00',
      universalAccess: true,
      activeSessionsCount: 9
    }
  },
  assessmentCompleted: true,
  assessmentScorePercent: 74,
  cognitiveStressBaseline: 68,
  behavioralArchetype: 'Analytical Hesitator',
  hesitationNotes: 'Extended deliberation on Security Architecture and PKI scenarios (average latency 78s); fast execution on Asset Security and Risk Management.',
  averageDwellTimeSec: 54,
  distractorEliminationRate: 0.68,
  optionSwitchCountAvg: 1.8,
  lastSyncTimestampMillis: Date.now() - 360000,
  deviceSyncedCount: 2 // Web Companion + Android App
};

export interface SyncLogEntry {
  id: string;
  timestamp: number;
  source: 'WEB' | 'ANDROID';
  direction: 'UPSTREAM_PUSH' | 'DOWNSTREAM_PULL';
  status: 'SUCCESS' | 'CONFLICT_RESOLVED' | 'PENDING';
  message: string;
  payloadSummary: string;
}

export class ApiSyncService {
  private static broadcastChannel: BroadcastChannel | null = null;

  static initBroadcast() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.broadcastChannel = new BroadcastChannel('certmaster_crossplatform_sync');
    }
  }

  static getProfile(): UserCentralProfile {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PROFILE);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse stored profile, using default', e);
    }
    this.saveProfile(DEFAULT_USER_PROFILE);
    return DEFAULT_USER_PROFILE;
  }

  static saveProfile(profile: UserCentralProfile) {
    try {
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
      if (this.broadcastChannel) {
        this.broadcastChannel.postMessage({ type: 'PROFILE_UPDATED', profile });
      }
    } catch (e) {
      console.error('Failed to save profile', e);
    }
  }

  static getSyncLogs(): SyncLogEntry[] {
    try {
      const logs = localStorage.getItem(STORAGE_KEY_LOGS);
      if (logs) return JSON.parse(logs);
    } catch (e) {
      console.warn('Failed to read sync logs', e);
    }
    return [
      {
        id: 'log_init_01',
        timestamp: Date.now() - 1800000,
        source: 'ANDROID',
        direction: 'UPSTREAM_PUSH',
        status: 'SUCCESS',
        message: 'Sync completed from CertMaster Android v2.4 (Pixel 8 Pro)',
        payloadSummary: 'Score telemetry synced (78% CISSP), 6 flashcards marked known'
      },
      {
        id: 'log_init_02',
        timestamp: Date.now() - 720000,
        source: 'WEB',
        direction: 'UPSTREAM_PUSH',
        status: 'SUCCESS',
        message: 'Subscribed to AWS Solutions Architect on Web Platform (Stripe)',
        payloadSummary: 'Universal entitlement granted: Web & Android synchronized'
      }
    ];
  }

  static addSyncLog(entry: Omit<SyncLogEntry, 'id'>) {
    const logs = this.getSyncLogs();
    const newEntry: SyncLogEntry = {
      ...entry,
      id: 'log_' + Math.random().toString(36).substring(2, 9)
    };
    logs.unshift(newEntry);
    if (logs.length > 50) logs.pop();
    try {
      localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
    } catch (e) {
      console.warn('Failed to save sync log', e);
    }
  }

  // Cloud Endpoint: POST /api/profile/sync
  static async syncWithAndroidApp(currentProfile: UserCentralProfile): Promise<SyncApiResponse> {
    await new Promise(res => setTimeout(res, 850)); // Network delay simulation

    const now = Date.now();
    const updatedProfile: UserCentralProfile = {
      ...currentProfile,
      lastSyncTimestampMillis: now,
      deviceSyncedCount: Math.max(currentProfile.deviceSyncedCount, 2)
    };

    this.saveProfile(updatedProfile);

    this.addSyncLog({
      timestamp: now,
      source: 'ANDROID',
      direction: 'DOWNSTREAM_PULL',
      status: 'SUCCESS',
      message: 'Bidirectional sync verified with CertMaster Android Client',
      payloadSummary: `Synced ${Object.keys(updatedProfile.subscriptions).length} entitlements, profile ID: ${updatedProfile.userId}`
    });

    return {
      success: true,
      status: 'SYNCED',
      syncedTimestamp: now,
      changesApplied: 4,
      entitlements: Object.fromEntries(
        Object.entries(updatedProfile.subscriptions).map(([k, v]) => [k, v.status])
      ),
      message: 'Successfully synchronized with CertMaster Android client via cloud hub.'
    };
  }

  // Cloud Endpoint: POST /api/subscriptions/verify
  static async verifyOrSubscribeExam(examId: string, isAllAccess: boolean = false): Promise<UserCentralProfile> {
    await new Promise(res => setTimeout(res, 600));

    const profile = this.getProfile();
    const now = Date.now();
    const exam = CATALOG_112_EXAMS.find(e => e.id === examId);

    if (isAllAccess) {
      // Unlock all 112 exams
      const newSubs: Record<string, ExamSubscription> = { ...profile.subscriptions };
      CATALOG_112_EXAMS.forEach(e => {
        newSubs[e.id] = {
          examId: e.id,
          examTitle: e.title,
          shortCode: e.shortCode,
          vendor: e.vendor,
          status: 'ACTIVE',
          subscribedPlatform: 'WEB',
          validUntilDate: 'Dec 31, 2028',
          priceFormatted: '$99.00 (All-Access Pass)',
          universalAccess: true,
          activeSessionsCount: newSubs[e.id]?.activeSessionsCount || 0
        };
      });

      profile.subscriptionTier = 'Universal Multi-Pass';
      profile.subscriptions = newSubs;
      profile.lastSyncTimestampMillis = now;
      this.saveProfile(profile);

      this.addSyncLog({
        timestamp: now,
        source: 'WEB',
        direction: 'UPSTREAM_PUSH',
        status: 'SUCCESS',
        message: 'Purchased Universal All-Access Pass ($99.00)',
        payloadSummary: 'All 112 Exam Banks unlocked with instant Android parity.'
      });

      return profile;
    }

    if (exam) {
      const existing = profile.subscriptions[examId];
      profile.subscriptions[examId] = {
        examId: exam.id,
        examTitle: exam.title,
        shortCode: exam.shortCode,
        vendor: exam.vendor,
        status: 'ACTIVE',
        subscribedPlatform: 'WEB',
        validUntilDate: 'Dec 31, 2027',
        priceFormatted: '$29.00',
        universalAccess: true,
        activeSessionsCount: existing?.activeSessionsCount || 0
      };
      profile.lastSyncTimestampMillis = now;
      this.saveProfile(profile);

      this.addSyncLog({
        timestamp: now,
        source: 'WEB',
        direction: 'UPSTREAM_PUSH',
        status: 'SUCCESS',
        message: `Purchased Single-Exam Pass: ${exam.shortCode} ($29.00)`,
        payloadSummary: 'Cross-platform entitlement pushed to Android sync bus.'
      });
    }

    return profile;
  }

  // Cloud Endpoint: POST /api/scores/telemetry
  static async recordSimulationTelemetry(result: SimulationResult): Promise<void> {
    try {
      const current = localStorage.getItem(STORAGE_KEY_RESULTS);
      const list: SimulationResult[] = current ? JSON.parse(current) : [];
      list.unshift(result);
      if (list.length > 30) list.pop();
      localStorage.setItem(STORAGE_KEY_RESULTS, JSON.stringify(list));

      this.addSyncLog({
        timestamp: Date.now(),
        source: 'WEB',
        direction: 'UPSTREAM_PUSH',
        status: 'SUCCESS',
        message: `Simulation submitted: ${result.examTitle} (${result.scorePercent}%)`,
        payloadSummary: `Accuracy: ${result.correctCount}/${result.totalQuestions}, Stress Score: ${result.behavioralStressScore}/100`
      });
    } catch (e) {
      console.warn('Failed to record telemetry', e);
    }
  }

  static getSimulationHistory(): SimulationResult[] {
    try {
      const current = localStorage.getItem(STORAGE_KEY_RESULTS);
      if (current) return JSON.parse(current);
    } catch (e) {
      console.warn('Failed to read results', e);
    }
    return [];
  }
}
