import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { CrossPlatformSyncModal } from './components/CrossPlatformSyncModal';
import { StripeCheckoutModal } from './components/StripeCheckoutModal';
import { NotificationToast } from './components/NotificationToast';

import { DashboardScreen } from './screens/DashboardScreen';
import { DualDeviceScreen } from './screens/DualDeviceScreen';
import { MobileCompanionScreen } from './screens/MobileCompanionScreen';
import { CatalogScreen } from './screens/CatalogScreen';
import { SimulatorScreen } from './screens/SimulatorScreen';
import { AssessmentScreen } from './screens/AssessmentScreen';
import { StudyMaterialsScreen } from './screens/StudyMaterialsScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { LandingPage } from './screens/LandingPage';
import { UserAreaScreen } from './screens/UserAreaScreen';
import { LoginScreen } from './screens/LoginScreen';
import { AuthModal } from './components/AuthModal';
import { ReadinessCertificateModal } from './components/ReadinessCertificateModal';
import { Smartphone, Shield, ArrowUpRight } from 'lucide-react';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [isStripeOpen, setIsStripeOpen] = useState(false);
  const [stripeExamId, setStripeExamId] = useState<string | undefined>();
  const [stripeIsAllAccess, setStripeIsAllAccess] = useState(false);

  const { activeExam, userProfile, setShowSyncModal, showCertModal, closeCertModal } = useAuth();

  useEffect(() => {
    const handleNavEvent = (e: any) => {
      if (e.detail && typeof e.detail === 'string') {
        setCurrentTab(e.detail);
      }
    };
    window.addEventListener('nav-tab', handleNavEvent);
    return () => window.removeEventListener('nav-tab', handleNavEvent);
  }, []);

  const handleOpenStripe = (examId?: string, isAllAccess: boolean = false) => {
    setStripeExamId(examId);
    setStripeIsAllAccess(isAllAccess);
    setIsStripeOpen(true);
  };

  const handleLaunchExam = (examId: string) => {
    setCurrentTab('simulator');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={tab => setCurrentTab(tab)}
        onOpenStripe={examId => handleOpenStripe(examId, true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'landing' && (
          <LandingPage
            onNavigate={tab => setCurrentTab(tab)}
            onOpenCheckout={(examId, isAll) => handleOpenStripe(examId, isAll)}
          />
        )}
        {currentTab === 'user-area' && (
          <UserAreaScreen
            onNavigate={tab => setCurrentTab(tab)}
            onOpenCheckout={(examId, isAll) => handleOpenStripe(examId, isAll)}
          />
        )}
        {currentTab === 'dual-device' && <DualDeviceScreen />}
        {currentTab === 'dashboard' && (
          <DashboardScreen
            onNavigate={tab => setCurrentTab(tab)}
            onOpenCheckout={examId => handleOpenStripe(examId, false)}
          />
        )}
        {currentTab === 'mobile-companion' && <MobileCompanionScreen />}
        {currentTab === 'catalog' && (
          <CatalogScreen
            onOpenCheckout={(examId, isAll) => handleOpenStripe(examId, isAll)}
            onLaunchExam={handleLaunchExam}
            onNavigate={tab => setCurrentTab(tab)}
          />
        )}
        {currentTab === 'simulator' && (
          <SimulatorScreen onFinish={() => setCurrentTab('user-area')} />
        )}
        {currentTab === 'assessment' && (
          <AssessmentScreen onComplete={() => setCurrentTab('user-area')} />
        )}
        {currentTab === 'notebook' && (
          <StudyMaterialsScreen onNavigate={tab => setCurrentTab(tab)} />
        )}
        {currentTab === 'profile' && (
          <ProfileScreen
            onOpenCheckout={(examId, isAll) => handleOpenStripe(examId, isAll)}
            onNavigate={tab => setCurrentTab(tab)}
          />
        )}
        {currentTab === 'login' && (
          <LoginScreen onNavigate={tab => setCurrentTab(tab)} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-blue-500" />
            <span className="font-bold text-slate-300">CertMaster Central Cloud Platform</span>
            <span>•</span>
            <span className="text-emerald-400 font-medium">120+ Dynamic Course Banks (Live Ingestion Pipeline)</span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowSyncModal(true)}
              className="flex items-center space-x-1.5 text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Android Telemetry Link</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
            </button>
            <span>v2.4.0 (Enterprise Companion)</span>
          </div>
        </div>
      </footer>

      {/* Modals & Overlays */}
      <AuthModal />
      <ReadinessCertificateModal isOpen={showCertModal} onClose={closeCertModal} />
      <CrossPlatformSyncModal />
      <StripeCheckoutModal
        isOpen={isStripeOpen}
        onClose={() => setIsStripeOpen(false)}
        selectedExamId={stripeExamId}
        isAllAccess={stripeIsAllAccess}
      />
      <NotificationToast />
    </div>
  );
};
