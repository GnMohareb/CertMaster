import React from 'react';
import { useCertMaster } from '../../context/CertMasterContext';
import { Smartphone, RefreshCw, Sun, Moon, ShieldCheck, User } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    profile,
    theme,
    toggleTheme,
    syncWithAndroid,
    isSyncing,
    activeTab,
    setActiveTab,
    setIsSSOModalOpen,
    setIsSyncModalOpen,
  } = useCertMaster();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/95 transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 text-left text-lg font-bold tracking-tight text-slate-900 dark:text-white hover:opacity-90 transition-opacity"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span className="font-extrabold tracking-tight">CertMaster</span>
          </button>
          
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span>·</span>
            <span>Web Platform</span>
          </div>
        </div>

        {/* Zone 2: Concise single-line navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'dashboard'
                ? 'text-blue-600 dark:text-blue-400 font-semibold border-b-2 border-blue-600 dark:border-blue-400'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('catalog')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'catalog'
                ? 'text-blue-600 dark:text-blue-400 font-semibold border-b-2 border-blue-600 dark:border-blue-400'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            112 Exam Catalog
          </button>
          <button
            onClick={() => setActiveTab('assessment')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'assessment'
                ? 'text-blue-600 dark:text-blue-400 font-semibold border-b-2 border-blue-600 dark:border-blue-400'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Behavioral Calibration
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'simulator'
                ? 'text-blue-600 dark:text-blue-400 font-semibold border-b-2 border-blue-600 dark:border-blue-400'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Exam Simulator
          </button>
          <button
            onClick={() => setActiveTab('study')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'study'
                ? 'text-blue-600 dark:text-blue-400 font-semibold border-b-2 border-blue-600 dark:border-blue-400'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            NotebookLM & Audio
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action + Profile / Cross-Platform Sync Trigger */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Sync With Android Button */}
          <button
            onClick={syncWithAndroid}
            disabled={isSyncing}
            title="Sync with CertMaster Android Companion App"
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
          >
            <Smartphone className="h-3.5 w-3.5 text-emerald-500" />
            <span className="hidden lg:inline">Android Sync</span>
            <RefreshCw className={`h-3 w-3 text-slate-400 ${isSyncing ? 'animate-spin text-blue-500' : ''}`} />
          </button>

          {/* Sync History / Audit Modal Trigger */}
          <button
            onClick={() => setIsSyncModalOpen(true)}
            className="hidden sm:flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
            title="View Cross-Platform Cloud Sync Bus"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            <span className="font-mono text-[11px]">Synced</span>
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
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-1 pr-3 text-left hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 transition-colors"
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
            <div className="hidden xl:block">
              <div className="text-xs font-semibold leading-tight text-slate-900 dark:text-white truncate max-w-[120px]">
                {profile.displayName}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[120px] font-mono">
                {profile.userId}
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Horizontal Sub-Navigation */}
      <div className="md:hidden flex items-center overflow-x-auto border-t border-slate-200 px-4 py-2 dark:border-slate-800 text-xs font-medium gap-4 scrollbar-none">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`whitespace-nowrap px-2.5 py-1 rounded-md ${
            activeTab === 'dashboard' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('catalog')}
          className={`whitespace-nowrap px-2.5 py-1 rounded-md ${
            activeTab === 'catalog' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          112 Catalog
        </button>
        <button
          onClick={() => setActiveTab('assessment')}
          className={`whitespace-nowrap px-2.5 py-1 rounded-md ${
            activeTab === 'assessment' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Assessment
        </button>
        <button
          onClick={() => setActiveTab('simulator')}
          className={`whitespace-nowrap px-2.5 py-1 rounded-md ${
            activeTab === 'simulator' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Simulator
        </button>
        <button
          onClick={() => setActiveTab('study')}
          className={`whitespace-nowrap px-2.5 py-1 rounded-md ${
            activeTab === 'study' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          NotebookLM
        </button>
      </div>
    </header>
  );
};
