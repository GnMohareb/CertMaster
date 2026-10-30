import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CATALOG_112_EXAMS } from '../data/catalog112';
import {
  ShieldCheck,
  Smartphone,
  RefreshCw,
  Sun,
  Moon,
  ChevronDown,
  Layers,
  LayoutDashboard,
  PlayCircle,
  BrainCircuit,
  BookOpen,
  User,
  CreditCard,
  CheckCircle2,
  Lock,
  ArrowRightLeft,
  Sparkles,
  UserCheck,
  KeyRound,
  LogOut,
  Award
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenStripe: (examId?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab, onOpenStripe }) => {
  const {
    isAuthenticated,
    ssoSession,
    userProfile,
    activeExam,
    activeExamId,
    setActiveExamId,
    isSyncing,
    syncWithAndroid,
    logout,
    openLoginModal,
    openCertModal,
    themeMode,
    toggleTheme,
    setShowSyncModal
  } = useAuth();

  const [examDropdownOpen, setExamDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const isExamSubscribed = userProfile.subscriptions[activeExamId]?.status === 'ACTIVE';

  const navItems = [
    { id: 'landing', label: 'Overview', icon: Sparkles },
    { id: 'user-area', label: 'My Journey', icon: UserCheck, badge: '5 Stages' },
    { id: 'simulator', label: 'Practice Simulator', icon: PlayCircle },
    { id: 'notebook', label: 'Study Hub', icon: BookOpen },
    { id: 'dashboard', label: 'Analytics', icon: LayoutDashboard },
    { id: 'catalog', label: '120+ Courses', icon: Layers }
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Companion Hub Identity */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onSelectTab('landing')}
              className="flex items-center space-x-2.5 focus:outline-none group text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-0.5 shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform flex items-center justify-center">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-blue-400 group-hover:text-cyan-300 transition-colors" />
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-blue-200 bg-clip-text text-transparent">
                    CertMaster
                  </span>
                  <span className="px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md">
                    Central Hub
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                  <Smartphone className="w-3 h-3 text-emerald-400 inline" />
                  Android Companion Synced
                </p>
              </div>
            </button>

            {/* Active Exam Selector Pill */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setExamDropdownOpen(!examDropdownOpen)}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/70 text-xs font-semibold text-slate-200 transition-all"
              >
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: activeExam.primaryColorHex }}
                />
                <span className="truncate max-w-[140px]">{activeExam.shortCode}</span>
                {isExamSubscribed ? (
                  <span className="flex items-center text-[10px] text-emerald-400 bg-emerald-500/10 px-1 rounded">
                    <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" /> Active
                  </span>
                ) : (
                  <span className="flex items-center text-[10px] text-amber-400 bg-amber-500/10 px-1 rounded">
                    <Lock className="w-2.5 h-2.5 mr-0.5" /> Unlock
                  </span>
                )}
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {examDropdownOpen && (
                <div className="absolute left-0 mt-2 w-80 max-h-96 overflow-y-auto bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50">
                  <div className="p-2 border-b border-slate-800 mb-1 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Switch Exam Bank
                    </span>
                    <button
                      onClick={() => {
                        onSelectTab('catalog');
                        setExamDropdownOpen(false);
                      }}
                      className="text-[11px] text-blue-400 hover:text-blue-300 font-medium"
                    >
                      Browse 120+ Courses (Live Ingestion) →
                    </button>
                  </div>
                  {CATALOG_112_EXAMS.slice(0, 10).map(exam => {
                    const isSub = userProfile.subscriptions[exam.id]?.status === 'ACTIVE';
                    return (
                      <button
                        key={exam.id}
                        onClick={() => {
                          setActiveExamId(exam.id);
                          setExamDropdownOpen(false);
                        }}
                        className={`w-full text-left p-2 rounded-lg flex items-center justify-between text-xs transition-colors ${
                          exam.id === activeExamId
                            ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                            : 'hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2 truncate pr-2">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: exam.primaryColorHex }}
                          />
                          <div className="truncate">
                            <p className="font-bold truncate">{exam.shortCode}</p>
                            <p className="text-[10px] text-slate-400 truncate">{exam.title}</p>
                          </div>
                        </div>
                        {isSub ? (
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded shrink-0">
                            UNLOCKED
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded shrink-0">
                            $29
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons & Sync Hub */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Live Dual-Device View Trigger */}
            <button
              onClick={() => onSelectTab('dual-device')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                currentTab === 'dual-device'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-400 shadow-md shadow-blue-500/30 ring-2 ring-blue-400/40'
                  : 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
              }`}
              title="See Web and Mobile App connected side by side with live sync"
            >
              <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline font-extrabold">Web + Phone Live</span>
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            </button>

            {/* Interactive 'Sync with Android App' Button */}
            <button
              onClick={() => syncWithAndroid()}
              disabled={isSyncing}
              title="Real-time Bidirectional Sync with Android App"
              className="relative flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold transition-all disabled:opacity-60 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">
                {isSyncing ? 'Syncing...' : 'Sync with Android'}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </button>

            {/* Dedicated Single Sign-On (SSO) Status & Login Button */}
            {isAuthenticated ? (
              <button
                onClick={() => onSelectTab('login')}
                className={`hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                  currentTab === 'login'
                    ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-500/20'
                    : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                }`}
                title="Single Sign-On (SSO) Connected. Click to inspect token claims or switch account."
              >
                <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden xl:inline">SSO:</span>
                <span className="font-mono text-[11px] truncate max-w-[130px]">{ssoSession.email}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </button>
            ) : (
              <button
                onClick={() => onSelectTab('login')}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold shadow-md shadow-blue-500/30 transition-all cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Sign In / SSO</span>
              </button>
            )}

            {/* Sync Telemetry Log modal trigger */}
            <button
              onClick={() => setShowSyncModal(true)}
              title="View Cloud Sync Telemetry & Log"
              className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <Smartphone className="w-4 h-4 text-slate-300" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              title={`Switch to ${themeMode === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {themeMode === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-300" />
              ) : (
                <Moon className="w-4 h-4 text-slate-300" />
              )}
            </button>

            {/* User Profile SSO Pill */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center space-x-2 pl-1 pr-2 py-1 rounded-full bg-slate-800 hover:bg-slate-700/80 border border-slate-700 transition-all text-left"
              >
                <img
                  src={userProfile.avatarUrl}
                  alt={userProfile.displayName}
                  className="w-7 h-7 rounded-full object-cover border border-blue-400/50"
                />
                <div className="hidden md:block leading-tight pr-1">
                  <p className="text-xs font-bold text-slate-200 truncate max-w-[100px]">
                    {userProfile.displayName}
                  </p>
                  <p className="text-[10px] text-emerald-400 font-mono">
                    {isAuthenticated ? 'SSO Active' : 'Guest'}
                  </p>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-3 z-50">
                  <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
                    <img
                      src={userProfile.avatarUrl}
                      alt={userProfile.displayName}
                      className="w-10 h-10 rounded-full object-cover border border-blue-500"
                    />
                    <div className="truncate">
                      <p className="text-sm font-bold text-white truncate">{userProfile.displayName}</p>
                      <p className="text-xs text-slate-400 font-mono truncate">{userProfile.email}</p>
                      <span className={`inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold ${
                        isAuthenticated
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {isAuthenticated ? 'GOOGLE SSO VERIFIED' : 'GUEST MODE'}
                      </span>
                    </div>
                  </div>

                  <div className="py-2 space-y-1 text-xs">
                    <div className="flex justify-between py-1 text-slate-300">
                      <span>User ID:</span>
                      <span className="font-mono text-slate-400">{userProfile.userId}</span>
                    </div>
                    <div className="flex justify-between py-1 text-slate-300">
                      <span>Cognitive Stress:</span>
                      <span className="font-bold text-amber-400">{userProfile.cognitiveStressBaseline}/100</span>
                    </div>
                    <div className="flex justify-between py-1 text-slate-300">
                      <span>Archetype:</span>
                      <span className="font-bold text-blue-400">{userProfile.behavioralArchetype}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 space-y-1.5">
                    <button
                      onClick={() => {
                        onSelectTab('user-area');
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                        <span>My Learning Journey (5 Stages)</span>
                      </span>
                      <ChevronDown className="w-3 h-3 -rotate-90 text-blue-400" />
                    </button>
                    <button
                      onClick={() => {
                        openCertModal();
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-amber-400" />
                        <span>View Readiness Certificate</span>
                      </span>
                      <span className="text-[10px] font-mono font-bold bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-300">
                        {userProfile.assessmentScorePercent}%
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        onSelectTab('login');
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                        <span>SSO Portal & Token Claims</span>
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        onSelectTab('profile');
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-xs font-semibold text-slate-200 transition-colors"
                    >
                      Manage Profile & Entitlements
                    </button>
                    <button
                      onClick={() => {
                        onOpenStripe();
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center justify-center space-x-1 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-xs font-bold text-white transition-all shadow-sm"
                    >
                      <CreditCard className="w-3.5 h-3.5 mr-1" />
                      Universal All-Access ($99)
                    </button>
                    {isAuthenticated && (
                      <button
                        onClick={() => {
                          logout();
                          onSelectTab('login');
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full flex items-center justify-center space-x-1 px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold border border-rose-500/20 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5 mr-1" />
                        <span>Sign Out of SSO</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Bar */}
      <div className="lg:hidden border-t border-slate-800 bg-slate-900/95 px-2 py-1.5 overflow-x-auto flex space-x-1">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap ${
                isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
