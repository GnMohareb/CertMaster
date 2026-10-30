import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User,
  ShieldCheck,
  Smartphone,
  Globe,
  RefreshCw,
  KeyRound,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
  Server,
  Zap,
  Activity,
  CreditCard
} from 'lucide-react';

interface ProfileScreenProps {
  onOpenCheckout: (examId?: string, isAllAccess?: boolean) => void;
  onNavigate?: (tab: string) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onOpenCheckout, onNavigate }) => {
  const {
    userProfile,
    isSyncing,
    syncWithAndroid,
    loginWithGoogle,
    loginWithEmail,
    updateProfile,
    setShowSyncModal
  } = useAuth();

  const [inputEmail, setInputEmail] = useState('');
  const [activeTab, setActiveTab] = useState<'ENTITLEMENTS' | 'BEHAVIOR' | 'API_SYNC'>('ENTITLEMENTS');

  const subscriptionList = Object.values(userProfile.subscriptions);
  const activeSubs = subscriptionList.filter(s => s.status === 'ACTIVE');

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Central Profile Header Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center space-x-4">
            <img
              src={userProfile.avatarUrl}
              alt={userProfile.displayName}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-blue-500 shadow-lg shadow-blue-500/20"
            />
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                  {userProfile.displayName}
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  SSO VERIFIED
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono mt-0.5">{userProfile.email}</p>
              <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] text-slate-400">
                <span>User ID: <strong className="text-slate-200 font-mono">{userProfile.userId}</strong></span>
                <span>•</span>
                <span>Tier: <strong className="text-blue-400">{userProfile.subscriptionTier}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => syncWithAndroid()}
              disabled={isSyncing}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Force Android Sync'}</span>
            </button>
            <button
              onClick={() => onOpenCheckout(undefined, true)}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Universal Multi-Pass ($99)</span>
            </button>
          </div>
        </div>

        {/* Device Sync Status strip */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2 text-slate-300">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>
              Connected Devices: <strong>2 active</strong> (Web Platform + CertMaster Android App on Pixel 8 Pro)
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Last Synced: {new Date(userProfile.lastSyncTimestampMillis).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('ENTITLEMENTS')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'ENTITLEMENTS'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          Universal Entitlements ({activeSubs.length} Active)
        </button>
        <button
          onClick={() => setActiveTab('BEHAVIOR')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'BEHAVIOR'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          Behavioral Profile & Telemetry
        </button>
        <button
          onClick={() => setActiveTab('API_SYNC')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'API_SYNC'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          Cloud Endpoints & SSO Switcher
        </button>
      </div>

      {/* TAB 1: ENTITLEMENTS */}
      {activeTab === 'ENTITLEMENTS' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
            <div>
              <h3 className="font-bold text-white text-sm">Cross-Platform Entitlement Vault</h3>
              <p className="text-slate-400 text-xs">
                CertMaster subscriptions grant unrestricted simultaneous access to question banks, mock simulations, and study tools across all browsers and Android installations.
              </p>
            </div>
            <button
              onClick={() => onOpenCheckout(undefined, true)}
              className="px-3 py-1.5 rounded-lg bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 font-bold hover:bg-indigo-600/40 transition-colors shrink-0"
            >
              All-Access Pass ($99)
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {subscriptionList.map(sub => {
              const isActive = sub.status === 'ACTIVE';
              return (
                <div
                  key={sub.examId}
                  className={`p-4 rounded-xl border text-xs flex flex-col justify-between ${
                    isActive
                      ? 'border-emerald-500/30 bg-slate-900'
                      : 'border-slate-800 bg-slate-950/60 opacity-80'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-white text-sm">{sub.shortCode}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isActive
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {sub.status}
                      </span>
                    </div>
                    <p className="text-slate-300 font-medium mb-2">{sub.examTitle}</p>
                    <div className="text-[11px] text-slate-400 space-y-0.5 font-mono">
                      <p>Platform Origin: {sub.subscribedPlatform}</p>
                      <p>Valid Through: {sub.validUntilDate}</p>
                      <p>Universal Access: Web + Android Synced</p>
                    </div>
                  </div>

                  {!isActive && (
                    <button
                      onClick={() => onOpenCheckout(sub.examId, false)}
                      className="mt-3 w-full py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors"
                    >
                      Subscribe ({sub.priceFormatted})
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: BEHAVIORAL PROFILE */}
      {activeTab === 'BEHAVIOR' && (
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Cognitive Profile & Dwell-Time Telemetry
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block mb-1">Behavioral Archetype</span>
                <strong className="text-lg font-bold text-blue-400">
                  {userProfile.behavioralArchetype}
                </strong>
                <p className="text-[10px] text-slate-400 mt-1">Calibrated from simulation dwell logs</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block mb-1">Cognitive Stress Index</span>
                <strong className="text-lg font-bold text-amber-400">
                  {userProfile.cognitiveStressBaseline} / 100
                </strong>
                <p className="text-[10px] text-slate-400 mt-1">
                  Threshold: &gt;65 indicates option oscillation
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block mb-1">Avg Question Dwell</span>
                <strong className="text-lg font-bold text-emerald-400">
                  {userProfile.averageDwellTimeSec} seconds
                </strong>
                <p className="text-[10px] text-slate-400 mt-1">
                  Elimination Rate: {Math.round(userProfile.distractorEliminationRate * 100)}%
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
              <h4 className="font-bold text-slate-200">Behavioral Diagnostic Notes:</h4>
              <p className="text-slate-300 leading-relaxed italic">
                "{userProfile.hesitationNotes}"
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: API SYNC & SSO DEMO */}
      {activeTab === 'API_SYNC' && (
        <div className="space-y-4">
          {/* REST Endpoints Card */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Server className="w-4 h-4 text-blue-400" />
              REST Synchronization Endpoints
            </h3>

            <div className="space-y-2 font-mono text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-blue-400">POST /api/profile/sync</span>
                  <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                    Bidirectional sync between Web localStorage and Android Room SQLite database.
                  </p>
                </div>
                <button
                  onClick={() => syncWithAndroid()}
                  className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                >
                  Test Post
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-blue-400">POST /api/subscriptions/verify</span>
                  <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                    Verifies Stripe web tokens & Google Play In-App purchase receipt signatures.
                  </p>
                </div>
                <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded text-[11px]">
                  Verified
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-blue-400">POST /api/scores/telemetry</span>
                  <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                    Transfers dwell times, option hesitation, and score breakdowns into central analytics.
                  </p>
                </div>
                <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded text-[11px]">
                  Active Stream
                </span>
              </div>
            </div>
          </div>

          {/* SSO Identity Switcher */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-emerald-400" />
                SSO Authentication Manager
              </h3>
              {onNavigate && (
                <button
                  onClick={() => onNavigate('login')}
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Open Dedicated SSO Portal & Claims Inspector →</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-200">Google Workspace SSO</h4>
                <p className="text-slate-400 text-[11px]">
                  Sign in instantly with your verified Google Account to link your CertMaster Android credentials.
                </p>
                <button
                  onClick={() => loginWithGoogle()}
                  className="w-full py-2.5 rounded-lg bg-white hover:bg-slate-100 text-slate-900 font-bold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Use Default gnmohareb@gmail.com</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-200">Email Magic Link</h4>
                <p className="text-slate-400 text-[11px]">
                  Sign in with an alternative enterprise email address.
                </p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="student@enterprise.com"
                    value={inputEmail}
                    onChange={e => setInputEmail(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg bg-slate-850 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={() => {
                      if (inputEmail) loginWithEmail(inputEmail);
                    }}
                    className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700"
                  >
                    Set
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
