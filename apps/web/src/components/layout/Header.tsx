import React, { useState, useEffect } from 'react';
import { useCertMaster, PrimaryLearnerSection } from '../../context/CertMasterContext';
import { ALL_112_EXAM_BANKS } from '../../data/examBanks';
import { FULL_PREP_EXAM_IDS } from '../../data/multiExamQuestions';
import {
  Smartphone,
  RefreshCw,
  Sun,
  Moon,
  ShieldCheck,
  User,
  Menu,
  X,
  BookOpen,
  Award,
  BarChart3,
  Compass,
  LayoutDashboard,
  CheckSquare,
  Settings,
} from 'lucide-react';

const NAV_ITEMS: {
  id: PrimaryLearnerSection;
  label: string;
  shortLabel: string;
  defaultSubTab: string;
  icon: React.FC<{ className?: string }>;
}[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    shortLabel: 'Dashboard',
    defaultSubTab: 'overview',
    icon: LayoutDashboard,
  },
  {
    id: 'my-certifications',
    label: 'My Certifications',
    shortLabel: 'My Certs',
    defaultSubTab: 'overview',
    icon: Award,
  },
  {
    id: 'study',
    label: 'Study',
    shortLabel: 'Study',
    defaultSubTab: 'guides',
    icon: BookOpen,
  },
  {
    id: 'practice',
    label: 'Practice & Exams',
    shortLabel: 'Practice & Exams',
    defaultSubTab: 'mock',
    icon: CheckSquare,
  },
  {
    id: 'progress',
    label: 'Progress & Results',
    shortLabel: 'Progress & Results',
    defaultSubTab: 'trends',
    icon: BarChart3,
  },
  {
    id: 'catalog',
    label: 'Explore Certifications',
    shortLabel: 'Explore Catalog',
    defaultSubTab: 'all',
    icon: Compass,
  },
  {
    id: 'account',
    label: 'Account',
    shortLabel: 'Account',
    defaultSubTab: 'profile',
    icon: Settings,
  },
];

export const Header: React.FC = () => {
  const {
    profile,
    theme,
    toggleTheme,
    syncWithAndroid,
    isSyncing,
    syncState,
    isDemoMode,
    activeSection,
    selectedCertId,
    setSelectedCertId,
    navigateTo,
    setIsSSOModalOpen,
    setIsSyncModalOpen,
  } = useCertMaster();

  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Close mobile drawer on Escape
  useEffect(() => {
    if (!isMobileDrawerOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileDrawerOpen]);

  const fullPrepBanks = ALL_112_EXAM_BANKS.filter((b) => FULL_PREP_EXAM_IDS.has(b.id));

  const syncBadgeConfig = (() => {
    if (syncState === 'SYNC_PENDING' || isSyncing) {
      return {
        dotClass: 'bg-blue-500 animate-pulse',
        label: 'Sync Pending',
        title: 'Synchronization with Cloud & Android in progress',
      };
    }
    if (syncState === 'SYNC_FAILED') {
      return {
        dotClass: 'bg-rose-500',
        label: 'Sync Failed',
        title: 'Last synchronization failed — click to inspect sync queue & retry',
      };
    }
    if (syncState === 'SYNCHRONIZED' && !isDemoMode) {
      return {
        dotClass: 'bg-emerald-500',
        label: 'Synchronized',
        title: 'Authenticated & synchronized with named Firestore database',
      };
    }
    return {
      dotClass: 'bg-amber-500',
      label: 'Local Demo',
      title: 'Running in Local Demo Mode — Sign in with Google SSO for live cloud sync',
    };
  })();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/95 transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Brand Wordmark + Active Certification Switcher */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => navigateTo('dashboard', 'overview')}
            className="flex items-center gap-2.5 text-left text-lg font-bold tracking-tight text-slate-900 dark:text-white hover:opacity-90 transition-opacity"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span className="font-extrabold tracking-tight">CertMaster</span>
          </button>

          {/* Active Certification Context Switcher */}
          <div className="hidden sm:flex items-center gap-1.5 pl-2 border-l border-slate-200 dark:border-slate-800">
            <label htmlFor="active-cert-select" className="sr-only">
              Active Certification Track
            </label>
            <select
              id="active-cert-select"
              value={selectedCertId}
              onChange={(e) => setSelectedCertId(e.target.value)}
              title="Switch active certification study track"
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-blue-600 hover:bg-slate-100 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-blue-400"
            >
              {fullPrepBanks.map((b) => (
                <option key={b.id} value={b.id}>
                  Track: {b.code}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Zone 2: Learner-Centered Primary Navigation (7 Clear Sections) */}
        <nav
          aria-label="Primary Learner Navigation"
          className="hidden lg:flex items-center gap-4 xl:gap-5 text-xs xl:text-sm font-medium text-slate-600 dark:text-slate-300"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id, item.defaultSubTab)}
                aria-current={isActive ? 'page' : undefined}
                className={`whitespace-nowrap transition-colors py-1 ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400 font-semibold border-b-2 border-blue-600 dark:border-blue-400'
                    : 'hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {item.shortLabel}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Sync Status, Theme, Profile & Mobile Drawer Trigger */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Sync With Android Button */}
          <button
            onClick={syncWithAndroid}
            disabled={isSyncing}
            title="Sync with CertMaster Android Companion App"
            className="hidden sm:flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
          >
            <Smartphone className="h-3.5 w-3.5 text-emerald-500" />
            <span className="hidden xl:inline">Android Sync</span>
            <RefreshCw className={`h-3 w-3 text-slate-400 ${isSyncing ? 'animate-spin text-blue-500' : ''}`} />
          </button>

          {/* Truthful Sync State Badge */}
          <button
            onClick={() => setIsSyncModalOpen(true)}
            className="hidden md:flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
            title={syncBadgeConfig.title}
          >
            <span className={`h-2 w-2 rounded-full ${syncBadgeConfig.dotClass}`}></span>
            <span className="font-mono text-[11px]">{syncBadgeConfig.label}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Color Theme"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Central SSO Profile Trigger */}
          <button
            onClick={() => setIsSSOModalOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-1 pr-2.5 text-left hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 transition-colors"
          >
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.displayName}
                referrerPolicy="no-referrer"
                className="h-7 w-7 rounded-md object-cover border border-slate-300 dark:border-slate-700"
              />
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 text-white text-xs font-bold">
                <User className="h-4 w-4" />
              </div>
            )}
            <div className="hidden 2xl:block">
              <div className="text-xs font-semibold leading-tight text-slate-900 dark:text-white truncate max-w-[110px]">
                {profile.displayName}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[110px] font-mono">
                {isDemoMode ? 'Demo Mode' : profile.userId.slice(0, 12)}
              </div>
            </div>
          </button>

          {/* Accessible Mobile Drawer Button */}
          <button
            type="button"
            onClick={() => setIsMobileDrawerOpen((open) => !open)}
            aria-expanded={isMobileDrawerOpen}
            aria-controls="mobile-learner-drawer"
            aria-label="Toggle Navigation Menu"
            className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {isMobileDrawerOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Accessible Mobile & Tablet Navigation Drawer */}
      {isMobileDrawerOpen && (
        <div
          id="mobile-learner-drawer"
          role="dialog"
          aria-label="Mobile Navigation Drawer"
          className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 shadow-xl dark:border-slate-800 dark:bg-slate-950"
        >
          <div className="mb-3 flex items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Active Certification:
            </span>
            <select
              value={selectedCertId}
              onChange={(e) => setSelectedCertId(e.target.value)}
              className="rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs font-bold text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-blue-400"
            >
              {fullPrepBanks.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.code} — {b.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    navigateTo(item.id, item.defaultSubTab);
                    setIsMobileDrawerOpen(false);
                  }}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
            <button
              onClick={() => {
                setIsSyncModalOpen(true);
                setIsMobileDrawerOpen(false);
              }}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 dark:border-slate-800 dark:text-slate-300"
            >
              <span className={`h-2 w-2 rounded-full ${syncBadgeConfig.dotClass}`}></span>
              <span>Sync Status: {syncBadgeConfig.label}</span>
            </button>

            <button
              onClick={() => {
                syncWithAndroid();
                setIsMobileDrawerOpen(false);
              }}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white"
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span>Sync Android Now</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
