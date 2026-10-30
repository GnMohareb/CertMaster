/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CertMasterProvider, useCertMaster } from './context/CertMasterContext';
import { Header } from './components/layout/Header';
import { PerformanceDashboard } from './components/dashboard/PerformanceDashboard';
import { SubjectCatalog } from './components/catalog/SubjectCatalog';
import { BehavioralAssessment } from './components/assessment/BehavioralAssessment';
import { ExamSimulator } from './components/simulator/ExamSimulator';
import { StudyNotebookHub } from './components/study/StudyNotebookHub';
import { CentralSSOModal } from './components/auth/CentralSSOModal';
import { CheckoutModal } from './components/catalog/CheckoutModal';
import { CrossPlatformSyncModal } from './components/sync/CrossPlatformSyncModal';
import { ALL_112_EXAM_BANKS } from './data/examBanks';
import {
  CheckCircle2,
  Shield,
  Smartphone,
  ChevronRight,
  User,
  RefreshCw,
  CreditCard,
  Settings,
} from 'lucide-react';

const AccountAndSyncPage: React.FC = () => {
  const {
    profile,
    firebaseUser,
    isDemoMode,
    syncState,
    syncLogs,
    syncWithAndroid,
    isSyncing,
    setIsSSOModalOpen,
    setIsSyncModalOpen,
    setCheckoutExamId,
    integrationTests,
    runIntegrationVerificationSuite,
    isRunningTests,
  } = useCertMaster();

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-lg">
              <User className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  {profile.displayName}
                </h1>
                <span
                  className={`rounded px-2 py-0.5 font-mono text-[10px] font-bold ${
                    isDemoMode
                      ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                      : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                  }`}
                >
                  {isDemoMode ? 'LOCAL DEMO ACCOUNT' : 'GOOGLE SSO VERIFIED'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                UID: {firebaseUser?.uid || profile.userId} · Email: {profile.email}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsSSOModalOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <Settings className="h-3.5 w-3.5" />
              <span>Edit Profile & Google SSO</span>
            </button>

            <button
              onClick={() => setIsSyncModalOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-700"
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span>Open Sync & Verification Suite</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subscription & Entitlements Summary */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400">
              <CreditCard className="h-4 w-4" />
              <span>Subscriptions & Server-Verified Entitlements</span>
            </div>
            <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
              Tier: {profile.subscriptionTier}
            </span>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {Object.values(profile.subscriptions).map((sub) => (
              <div
                key={sub.examId}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs dark:border-slate-800 dark:bg-slate-950/50"
              >
                <div>
                  <span className="font-bold uppercase text-slate-900 dark:text-white">
                    {sub.examId}
                  </span>
                  <span className="ml-2 text-slate-500">Origin: {sub.platform}</span>
                </div>
                <span
                  className={`rounded px-2 py-0.5 font-mono text-[10px] font-bold ${
                    sub.status === 'ACTIVE'
                      ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                      : 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                  }`}
                >
                  {sub.status}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={() => setCheckoutExamId('all-access')}
            className="w-full rounded-lg border border-blue-500/40 bg-blue-500/10 py-2 text-xs font-bold text-blue-700 hover:bg-blue-500/20 dark:text-blue-300"
          >
            Manage or Upgrade All-Access Pass
          </button>
        </div>

        {/* Cross-Platform Android Synchronization & Audit Log */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <Smartphone className="h-4 w-4" />
              <span>Android Companion Sync ({syncState})</span>
            </div>
            <button
              onClick={syncWithAndroid}
              disabled={isSyncing}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Sync Now</span>
            </button>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {syncLogs.map((log) => (
              <div
                key={log.id}
                className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-950/50"
              >
                <div className="flex items-center justify-between font-mono text-[10px] text-slate-500">
                  <span>{log.direction}</span>
                  <span>{log.timestamp}</span>
                </div>
                <div className="font-bold text-slate-900 dark:text-white mt-0.5">{log.action}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {log.payloadSummary}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={runIntegrationVerificationSuite}
            disabled={isRunningTests}
            className="w-full rounded-lg bg-slate-900 py-2 text-xs font-bold text-white hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700"
          >
            {isRunningTests
              ? 'Running 5 Ecosystem Verification Tests...'
              : `Run 5 Ecosystem Verification Tests (${integrationTests.filter((t) => t.status === 'PASSED').length}/5 Passed)`}
          </button>
        </div>
      </div>
    </div>
  );
};

const MainContent: React.FC = () => {
  const {
    activeSection,
    activeSubTab,
    selectedCertId,
    navigateTo,
    toastMessage,
    profile,
    isDemoMode,
    syncState,
  } = useCertMaster();

  const activeBank =
    ALL_112_EXAM_BANKS.find((b) => b.id === selectedCertId) || ALL_112_EXAM_BANKS[0];

  const sectionLabels: Record<string, string> = {
    dashboard: 'Dashboard',
    'my-certifications': 'My Certifications',
    study: 'Study Hub',
    practice: 'Practice & Exams',
    progress: 'Progress & Results',
    catalog: 'Explore Certifications',
    account: 'Account & Sync',
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors">
      <Header />

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl border border-slate-700 bg-slate-900/95 px-4 py-3 text-xs text-white shadow-2xl backdrop-blur-md transition-all font-medium">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Contextual Breadcrumb Bar */}
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => navigateTo('dashboard', 'overview')}
              className="hover:text-blue-600 dark:hover:text-blue-400 font-medium"
            >
              CertMaster
            </button>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {sectionLabels[activeSection] || 'Dashboard'}
            </span>
            {activeSubTab && activeSubTab !== 'overview' && (
              <>
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="capitalize text-blue-600 dark:text-blue-400 font-semibold">
                  {activeSubTab.replace('-', ' ')}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span>Active Certification:</span>
            <button
              onClick={() => navigateTo('my-certifications', 'overview', activeBank.id)}
              className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              {activeBank.code} ({activeBank.vendor})
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-5">
        {activeSection === 'dashboard' && <PerformanceDashboard />}
        {activeSection === 'my-certifications' && <SubjectCatalog />}
        {activeSection === 'study' && <StudyNotebookHub />}
        {activeSection === 'practice' &&
          (activeSubTab === 'diagnostic' ? <BehavioralAssessment /> : <ExamSimulator />)}
        {activeSection === 'progress' && <PerformanceDashboard />}
        {activeSection === 'catalog' && <SubjectCatalog />}
        {activeSection === 'account' && <AccountAndSyncPage />}
      </main>

      {/* Modals */}
      <CentralSSOModal />
      <CheckoutModal />
      <CrossPlatformSyncModal />

      {/* Clean Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 dark:border-slate-900 dark:bg-slate-950/80 text-xs text-slate-500 dark:text-slate-400">
        <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="font-bold text-slate-900 dark:text-white">CertMaster Web Platform</span>
            <span>·</span>
            <span>Unified Ecosystem with CertMaster Android</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <Smartphone className="h-3.5 w-3.5" />
              <span>
                Android Companion ({profile.androidDeviceId || 'Pixel-8-Pro'}) ·{' '}
                {isDemoMode ? 'Local Demo' : syncState}
              </span>
            </span>
            <span>·</span>
            <span>6 Full-Prep Suites · 112 Catalog Blueprints</span>
            <span>·</span>
            <span>Canonical Schema v2</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <CertMasterProvider>
      <MainContent />
    </CertMasterProvider>
  );
}
