import React, { useState, useEffect } from 'react';
import { useCertMaster } from '../../context/CertMasterContext';
import {
  FIREBASE_PROJECT_ID,
  FIRESTORE_DATABASE_ID,
  FIREBASE_AUTH_DOMAIN,
} from '../../lib/firebase';
import {
  X,
  Smartphone,
  Globe,
  Key,
  CheckCircle,
  RefreshCw,
  LogOut,
  Database,
  ShieldCheck,
} from 'lucide-react';

export const CentralSSOModal: React.FC = () => {
  const {
    profile,
    firebaseUser,
    signInWithGoogle,
    signOutUser,
    updateUserProfileInCloud,
    isSSOModalOpen,
    setIsSSOModalOpen,
    syncWithAndroid,
    isSyncing,
  } = useCertMaster();

  const [emailInput, setEmailInput] = useState(profile.email);
  const [nameInput, setNameInput] = useState(profile.displayName);
  const [deviceInput, setDeviceInput] = useState(profile.androidDeviceId || 'Pixel-8-Pro-G9H3K');
  const [goalMinutesInput, setGoalMinutesInput] = useState(profile.dailyStudyGoalMinutes || 45);
  const [targetExamInput, setTargetExamInput] = useState(profile.targetExamId || 'cissp');
  const [activeTab, setActiveTab] = useState<'profile' | 'entitlements' | 'endpoints'>('profile');

  useEffect(() => {
    setEmailInput(profile.email);
    setNameInput(profile.displayName);
    setDeviceInput(profile.androidDeviceId || 'Pixel-8-Pro-G9H3K');
    setGoalMinutesInput(profile.dailyStudyGoalMinutes || 45);
    setTargetExamInput(profile.targetExamId || 'cissp');
  }, [profile]);

  if (!isSSOModalOpen) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUserProfileInCloud({
      email: emailInput,
      displayName: nameInput,
      androidDeviceId: deviceInput,
      dailyStudyGoalMinutes: Number(goalMinutesInput) || 45,
      targetExamId: targetExamInput,
    });
  };

  const activeEntitlementsCount = Object.values(profile.subscriptions).filter(
    (s) => s.status === 'ACTIVE'
  ).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 transition-colors my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
              <Key className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                CertMaster Central Identity & Firebase SSO
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>Project: {FIREBASE_PROJECT_ID}</span>
                <span>·</span>
                <span className="font-mono text-blue-600 dark:text-blue-400">
                  {firebaseUser ? firebaseUser.uid : profile.userId}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsSSOModalOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 px-6 pt-3 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/40 text-xs font-medium">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'profile'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Central Profile & Preferences
          </button>
          <button
            onClick={() => setActiveTab('entitlements')}
            className={`pb-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'entitlements'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Cross-Platform Entitlements ({activeEntitlementsCount})
          </button>
          <button
            onClick={() => setActiveTab('endpoints')}
            className={`pb-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'endpoints'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Firebase & REST Coordinates
          </button>
        </div>

        {/* Tab 1: Profile & Single Sign-On */}
        {activeTab === 'profile' && (
          <div className="p-6 space-y-5">
            {/* Active User Card */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/50">
              <div className="flex items-center gap-3.5">
                <img
                  src={firebaseUser?.photoURL || profile.avatarUrl}
                  alt={profile.displayName}
                  referrerPolicy="no-referrer"
                  className="h-14 w-14 rounded-xl object-cover border border-slate-300 dark:border-slate-700"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {profile.displayName}
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                      {profile.subscriptionTier}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{profile.email}</div>
                  <div className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                    UID: {firebaseUser ? firebaseUser.uid : profile.userId} · Archetype:{' '}
                    {profile.behavioralArchetype.name}
                  </div>
                </div>
              </div>

              <button
                onClick={syncWithAndroid}
                disabled={isSyncing}
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors shrink-0"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Sync with Android App</span>
              </button>
            </div>

            {/* Live Firebase Google Sign-In Control */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-slate-200 dark:border-slate-700 shadow-sm shrink-0">
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
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
                </div>
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-white">
                    <span>Firebase Authentication (Google SSO)</span>
                    {firebaseUser && (
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                        ● LIVE SESSION
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {firebaseUser
                      ? `Signed in as ${firebaseUser.email} · Synchronizing live with Cloud Firestore`
                      : 'Sign in with Google to persist real-time Firestore documents across Web & Android'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={signInWithGoogle}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  {firebaseUser ? 'Switch Google Account' : 'Sign In with Google'}
                </button>
                {firebaseUser && (
                  <button
                    type="button"
                    onClick={signOutUser}
                    title="Sign Out"
                    className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Profile & Cross-Platform Learning Preferences Form */}
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Display Name (Max 120 chars)
                  </label>
                  <input
                    type="text"
                    maxLength={120}
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Isolated PII Email (/users/&#123;uid&#125;/private/pii)
                  </label>
                  <input
                    type="email"
                    maxLength={254}
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Primary Target Exam
                  </label>
                  <select
                    value={targetExamInput}
                    onChange={(e) => setTargetExamInput(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  >
                    <option value="cissp">CISSP (ISC2)</option>
                    <option value="cism">CISM (ISACA)</option>
                    <option value="aws-saa">AWS SAA-C03</option>
                    <option value="sy0-701">CompTIA Security+</option>
                    <option value="pmp">PMP (PMI)</option>
                    <option value="ceh">CEH v12 (EC-Council)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Daily Study Goal (Minutes)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={720}
                    value={goalMinutesInput}
                    onChange={(e) => setGoalMinutesInput(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Paired Android Device ID
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      maxLength={128}
                      value={deviceInput}
                      onChange={(e) => setDeviceInput(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Synced with Android via /users/&#123;userId&#125;
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsSSOModalOpen(false)}
                    className="rounded-lg px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    Save & Propagate to Cloud Firestore
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: Entitlements */}
        {activeTab === 'entitlements' && (
          <div className="p-6 space-y-4">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              All entitlements are persisted under{' '}
              <code className="font-mono text-blue-600 dark:text-blue-400">
                /users/&#123;userId&#125;/subscriptions/&#123;examId&#125;
              </code>{' '}
              and synchronized in real time across Web and Android.
            </div>

            <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
              {Object.entries(profile.subscriptions).map(([examId, sub]) => (
                <div
                  key={examId}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-950/40"
                >
                  <div>
                    <div className="font-bold uppercase tracking-wider text-slate-900 dark:text-white font-mono">
                      {examId}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                      <span>Origin:</span>
                      <span className="inline-flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                        {sub.platform === 'ANDROID' ? (
                          <Smartphone className="h-3 w-3 text-emerald-500" />
                        ) : (
                          <Globe className="h-3 w-3 text-blue-500" />
                        )}
                        {sub.platform}
                      </span>
                      <span>·</span>
                      <span>Synced: {new Date(sub.lastSyncedAt).toLocaleTimeString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider ${
                        sub.status === 'ACTIVE'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : sub.status === 'TRIAL'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {sub.status}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:inline">
                      Web & Android Active
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
              <span className="text-slate-500 dark:text-slate-400">
                Total 112 Exam Banks managed centrally in Firestore
              </span>
              <button
                onClick={syncWithAndroid}
                className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
              >
                Force Entitlement Refresh
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Firebase & REST Coordinates */}
        {activeTab === 'endpoints' && (
          <div className="p-6 space-y-4">
            <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-3.5 text-xs dark:border-blue-900/60 dark:bg-blue-950/30 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                <Database className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span>Provisioned Shared Firebase Infrastructure</span>
              </div>
              <div className="grid grid-cols-1 gap-1 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                <div>
                  <span className="text-slate-500">Project ID: </span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {FIREBASE_PROJECT_ID}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Firestore DB ID: </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {FIRESTORE_DATABASE_ID}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Auth Domain: </span>
                  <span>{FIREBASE_AUTH_DOMAIN}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/40">
                <div className="flex items-center justify-between text-xs font-mono mb-1">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    POST /api/profile/sync
                  </span>
                  <span className="text-[11px] text-slate-500">Firestore: /users/&#123;userId&#125;</span>
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400">
                  Synchronizes UserProfile, learning preferences, readiness score, and behavioral archetype.
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/40">
                <div className="flex items-center justify-between text-xs font-mono mb-1">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">
                    GET /api/subscriptions/verify
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Firestore: /users/&#123;userId&#125;/subscriptions/&#123;examId&#125;
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400">
                  Validates cross-platform subscriptions across 112 subject banks for Web & Android.
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/40">
                <div className="flex items-center justify-between text-xs font-mono mb-1">
                  <span className="text-amber-600 dark:text-amber-400 font-bold">
                    POST /api/scores/telemetry
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Firestore: /users/&#123;userId&#125;/attempts/&#123;attemptId&#125;
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400">
                  Calibrates behavioral archetypes from dwell duration, option switches, and distractor strikethroughs.
                </div>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setIsSSOModalOpen(false)}
                className="rounded-lg bg-slate-900 text-white px-4 py-2 text-xs font-semibold hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
              >
                Close Inspector
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
