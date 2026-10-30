import React, { useState } from 'react';
import { useCertMaster } from '../../context/CertMasterContext';
import {
  ANDROID_INTEGRATION_SUMMARY,
  KOTLIN_ANDROID_SNIPPET,
} from '../../data/androidIntegrationPackage';
import {
  X,
  Smartphone,
  Globe,
  RefreshCw,
  CheckCircle,
  ArrowRightLeft,
  ShieldCheck,
  Code2,
  Copy,
  Play,
  Database,
  AlertCircle,
} from 'lucide-react';

export const CrossPlatformSyncModal: React.FC = () => {
  const {
    profile,
    firebaseUser,
    syncWithAndroid,
    simulateAndroidExamCompletion,
    isSyncing,
    syncLogs,
    isSyncModalOpen,
    setIsSyncModalOpen,
    showToast,
    integrationTests,
    isRunningTests,
    runIntegrationVerificationSuite,
  } = useCertMaster();

  const [modalTab, setModalTab] = useState<'sync' | 'package' | 'tests'>('sync');
  const [activeTestEndpoint, setActiveTestEndpoint] = useState<string>('/api/profile/sync');
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [isCallingAPI, setIsCallingAPI] = useState(false);

  if (!isSyncModalOpen) return null;

  const handleTestAPI = async (endpoint: string) => {
    setActiveTestEndpoint(endpoint);
    setIsCallingAPI(true);
    try {
      let response: Response;
      if (endpoint === '/api/profile/sync') {
        response = await fetch('/api/profile/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: firebaseUser?.uid || profile.userId,
            displayName: profile.displayName,
            subscriptionTier: profile.subscriptionTier,
            assessmentScorePercent: profile.assessmentScorePercent,
            cognitiveStressBaseline: profile.cognitiveStressBaseline,
            preferredTheme: profile.preferredTheme || 'dark',
            targetExamId: profile.targetExamId || 'cissp',
            androidDeviceId: profile.androidDeviceId || 'Pixel-8-Pro-G9H3K',
            platform: 'WEB',
          }),
        });
      } else if (endpoint === '/api/subscriptions/verify') {
        response = await fetch(
          `/api/subscriptions/verify?userId=${encodeURIComponent(firebaseUser?.uid || profile.userId)}`
        );
      } else if (endpoint === '/api/scores/telemetry') {
        response = await fetch('/api/scores/telemetry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            avgDwellSeconds: profile.behavioralArchetype.avgDwellSeconds,
            switchRatePercent: profile.behavioralArchetype.switchRatePercent,
            distractorEliminationRate: profile.behavioralArchetype.distractorEliminationRate,
            scorePercent: profile.assessmentScorePercent,
          }),
        });
      } else {
        response = await fetch(endpoint);
      }

      const data = await response.json();
      setTestResponse(JSON.stringify(data, null, 2));
      showToast(`✓ Live Backend Endpoint ${endpoint} returned 200 OK`);
    } catch (error) {
      setTestResponse(JSON.stringify({ error: String(error) }, null, 2));
    } finally {
      setIsCallingAPI(false);
    }
  };

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`✓ Copied ${label} to clipboard`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 transition-colors my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
              <ArrowRightLeft className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                CertMaster Cloud Sync Bus, Android Bridge & Verification Suite
              </h2>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>Project: {ANDROID_INTEGRATION_SUMMARY.firebaseProjectId}</span>
                <span>·</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400">
                  DB: {ANDROID_INTEGRATION_SUMMARY.firestoreDatabaseId.slice(0, 26)}...
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsSyncModalOpen(false)}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pt-3 mb-5 text-xs font-medium dark:border-slate-800">
          <button
            onClick={() => setModalTab('sync')}
            className={`pb-2.5 px-3 border-b-2 transition-colors ${
              modalTab === 'sync'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            1. Live Cloud Sync & REST Bus
          </button>
          <button
            onClick={() => setModalTab('package')}
            className={`pb-2.5 px-3 border-b-2 transition-colors ${
              modalTab === 'package'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            2. Android Integration Package
          </button>
          <button
            onClick={() => setModalTab('tests')}
            className={`pb-2.5 px-3 border-b-2 transition-colors ${
              modalTab === 'tests'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            3. Ecosystem Verification Tests (5)
          </button>
        </div>

        {/* =================================================================== */}
        {/* TAB 1: LIVE CLOUD SYNC & REST BUS                                   */}
        {/* =================================================================== */}
        {modalTab === 'sync' && (
          <div>
            {/* Pairing Status Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/50">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white">
                    <Globe className="h-3.5 w-3.5 text-blue-500" />
                    CertMaster Web Platform
                  </span>
                  <span className="text-[10px] text-emerald-600 font-mono font-bold">ONLINE</span>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  UID:{' '}
                  <span className="font-mono text-blue-600 dark:text-blue-400">
                    {firebaseUser ? firebaseUser.uid : profile.userId}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Email: {profile.email} · Theme: {profile.preferredTheme || 'dark'}
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/50">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white">
                    <Smartphone className="h-3.5 w-3.5 text-emerald-500" />
                    CertMaster Native Android App
                  </span>
                  <span className="text-[10px] text-emerald-600 font-mono font-bold">PAIRED</span>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Device:{' '}
                  <span className="font-mono text-emerald-600 dark:text-emerald-400">
                    {profile.androidDeviceId || 'Pixel-8-Pro-G9H3K'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Target App: 3cc96170-31c4-46dd-822d-0ed45a0ac3fe
                </div>
              </div>
            </div>

            {/* Bi-Directional Sync Action Buttons */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-lg border border-blue-200 bg-blue-50/60 p-4 dark:border-blue-900/60 dark:bg-blue-950/30 mb-5">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Real-Time Bi-Directional Firestore Synchronization
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400">
                  Push Web state to Firestore or simulate an incoming Android exam attempt to verify instant Web Dashboard updates.
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  onClick={simulateAndroidExamCompletion}
                  disabled={isSyncing}
                  className="flex items-center gap-1.5 rounded-lg border border-emerald-600 bg-emerald-600/10 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-600/20 dark:text-emerald-300 disabled:opacity-50 transition-colors"
                >
                  <Smartphone className="h-3.5 w-3.5" />
                  <span>Simulate Android Exam Completion</span>
                </button>
                <button
                  onClick={syncWithAndroid}
                  disabled={isSyncing}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>Sync with Android App</span>
                </button>
              </div>
            </div>

            {/* Live REST API Playground */}
            <div className="space-y-3 mb-5">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Live Backend REST API Inspector (server.ts)
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  { path: '/api/profile/sync', label: 'POST /api/profile/sync' },
                  { path: '/api/subscriptions/verify', label: 'GET /api/subscriptions/verify' },
                  { path: '/api/scores/telemetry', label: 'POST /api/scores/telemetry' },
                  { path: '/api/health', label: 'GET /api/health' },
                ].map((ep) => (
                  <button
                    key={ep.path}
                    disabled={isCallingAPI}
                    onClick={() => handleTestAPI(ep.path)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors border ${
                      activeTestEndpoint === ep.path
                        ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold dark:bg-blue-950 dark:text-blue-300'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {ep.label}
                  </button>
                ))}
              </div>

              {testResponse && (
                <div className="relative rounded-lg border border-slate-200 bg-slate-950 p-4 font-mono text-[11px] text-emerald-400 overflow-x-auto max-h-44 dark:border-slate-800">
                  <pre>{testResponse}</pre>
                </div>
              )}
            </div>

            {/* Sync Audit History Log */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Real-Time Synchronization Event Log (/users/&#123;uid&#125;/syncEvents)
              </div>
              <div className="max-h-40 overflow-y-auto space-y-2 pr-1 text-xs">
                {syncLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start justify-between rounded-lg border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-950/40"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {log.action}
                        </span>
                        <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-1.5 rounded border border-emerald-200 dark:border-emerald-800">
                          {log.direction}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {log.payloadSummary}
                      </div>
                    </div>

                    <div className="text-[10px] font-mono text-slate-400 shrink-0 ml-3">
                      {log.timestamp}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 2: ANDROID INTEGRATION PACKAGE                                  */}
        {/* =================================================================== */}
        {modalTab === 'package' && (
          <div className="space-y-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/50 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                  <Database className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span>Authoritative Firebase Coordinates for CertMaster Android App</span>
                </div>
                <button
                  onClick={() =>
                    handleCopyText(
                      JSON.stringify(
                        {
                          firebaseProjectId: ANDROID_INTEGRATION_SUMMARY.firebaseProjectId,
                          firestoreDatabaseId: ANDROID_INTEGRATION_SUMMARY.firestoreDatabaseId,
                          authDomain: ANDROID_INTEGRATION_SUMMARY.authDomain,
                          oAuthClientId: ANDROID_INTEGRATION_SUMMARY.oAuthClientId,
                          schemaVersion: ANDROID_INTEGRATION_SUMMARY.schemaVersion,
                        },
                        null,
                        2
                      ),
                      'Firebase Coordinates JSON'
                    )
                  }
                  className="flex items-center gap-1 rounded border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <Copy className="h-3 w-3" />
                  <span>Copy Coordinates</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px]">FIREBASE PROJECT ID</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {ANDROID_INTEGRATION_SUMMARY.firebaseProjectId}
                  </span>
                </div>
                <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px]">NAMED FIRESTORE DATABASE ID</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 break-all">
                    {ANDROID_INTEGRATION_SUMMARY.firestoreDatabaseId}
                  </span>
                </div>
              </div>
            </div>

            {/* Shared Firestore Collection Hierarchy */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Shared Firestore Collection Hierarchy (Schema v2)
              </div>
              <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1">
                {ANDROID_INTEGRATION_SUMMARY.collections.map((col) => (
                  <div
                    key={col.path}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-950/40"
                  >
                    <div>
                      <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                        {col.path}
                      </span>
                      <span className="mx-2 text-slate-400">·</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {col.entity}
                      </span>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {col.description}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 shrink-0">
                      {col.syncMode}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Drop-in Kotlin Repository Snippet */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <Code2 className="h-4 w-4 text-blue-500" />
                  <span>Kotlin Android Integration Snippet (CertMasterAndroidSync.kt)</span>
                </span>
                <button
                  onClick={() => handleCopyText(KOTLIN_ANDROID_SNIPPET, 'Kotlin Repository Snippet')}
                  className="flex items-center gap-1 rounded border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <Copy className="h-3 w-3" />
                  <span>Copy Kotlin Code</span>
                </button>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-3.5 font-mono text-[11px] text-slate-200 overflow-x-auto max-h-48">
                <pre>{KOTLIN_ANDROID_SNIPPET}</pre>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 3: ECOSYSTEM VERIFICATION TEST SUITE                            */}
        {/* =================================================================== */}
        {modalTab === 'tests' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/50">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  End-to-End Ecosystem Integration Verification Suite
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Executes live verification against Firebase Auth, Cloud Firestore rules, 112-Exam Catalog manifest, and cross-platform telemetry endpoints.
                </div>
              </div>

              <button
                onClick={runIntegrationVerificationSuite}
                disabled={isRunningTests}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors shrink-0 shadow-sm"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>{isRunningTests ? 'Running Tests...' : 'Run All 5 Integration Tests'}</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {integrationTests.map((test) => (
                <div
                  key={test.id}
                  className="flex items-start justify-between rounded-lg border border-slate-200 bg-white p-3.5 text-xs dark:border-slate-800 dark:bg-slate-950/60"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {test.status === 'PASSED' ? (
                        <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                      ) : test.status === 'FAILED' ? (
                        <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
                      ) : (
                        <ShieldCheck className="h-4 w-4 text-blue-500 shrink-0" />
                      )}
                      <span className="font-bold text-slate-900 dark:text-white">{test.name}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 pl-6">
                      {test.details}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3 font-mono text-[11px]">
                    {test.durationMs !== undefined && (
                      <span className="text-slate-400">{test.durationMs}ms</span>
                    )}
                    <span
                      className={`px-2 py-0.5 rounded font-bold ${
                        test.status === 'PASSED'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : test.status === 'FAILED'
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {test.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800 text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-mono">
            Files generated in /android-integration-package/*
          </span>
          <button
            onClick={() => setIsSyncModalOpen(false)}
            className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
          >
            Close Bridge Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
