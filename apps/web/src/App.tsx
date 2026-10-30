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
import { CheckCircle2, Shield, Smartphone } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeTab, toastMessage, profile, syncWithAndroid, isSyncing } = useCertMaster();

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

      {/* Main Container */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && <PerformanceDashboard />}
        {activeTab === 'catalog' && <SubjectCatalog />}
        {activeTab === 'assessment' && <BehavioralAssessment />}
        {activeTab === 'simulator' && <ExamSimulator />}
        {activeTab === 'study' && <StudyNotebookHub />}
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
            <span>Central Hub for CertMaster Android Ecosystem</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <Smartphone className="h-3.5 w-3.5" />
              <span>Android Companion Paired ({profile.androidDeviceId || 'Pixel-8-Pro'})</span>
            </span>
            <span>·</span>
            <span>112 Subject Banks Registered</span>
            <span>·</span>
            <span>NIST SP 800-53 / ISO 27001 Aligned</span>
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
