import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User,
  ShieldCheck,
  Smartphone,
  Layers,
  Sparkles,
  Zap,
  PlayCircle,
  BookOpen,
  BrainCircuit,
  Award,
  Clock,
  Flame,
  CheckCircle2,
  RefreshCw,
  CreditCard,
  QrCode,
  Calendar,
  BarChart3,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  KeyRound,
  Headphones,
  Check,
  ArrowRight,
  FileText,
  RotateCcw,
  Target,
  ListChecks,
  ExternalLink
} from 'lucide-react';

interface UserAreaScreenProps {
  onNavigate: (tab: string) => void;
  onOpenCheckout: (examId?: string, isAllAccess?: boolean) => void;
}

export const UserAreaScreen: React.FC<UserAreaScreenProps> = ({ onNavigate, onOpenCheckout }) => {
  const {
    userProfile,
    isSyncing,
    syncWithAndroid,
    activeExam,
    activeExamId,
    setActiveExamId,
    setShowSyncModal,
    openCertModal,
    openLoginModal,
    showToast
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'JOURNEY' | 'ENROLLED' | 'TEST_DAY' | 'SYNC_ACCOUNT'>('JOURNEY');

  // Test Day Checklist State
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    ids: true,
    timing: true,
    distractor: true,
    sleep: false,
    nist: true
  });

  const toggleChecklist = (id: string) => {
    setChecklist(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const completedChecklistCount = Object.values(checklist).filter(Boolean).length;

  const enrolledCertifications = [
    {
      id: 'cissp',
      title: 'Certified Information Systems Security Professional',
      shortCode: 'CISSP',
      vendor: '(ISC)²',
      readinessPercent: 82,
      completedSimulations: 3,
      avgScore: 81,
      targetDate: 'Nov 24, 2026',
      status: 'EXAM READY',
      statusColor: 'emerald',
      primaryColorHex: '#2563EB',
      weakDomain: 'Domain 3: Security Architecture'
    },
    {
      id: 'aws-saa',
      title: 'AWS Certified Solutions Architect – Associate',
      shortCode: 'AWS SAA-C03',
      vendor: 'Amazon Web Services',
      readinessPercent: 64,
      completedSimulations: 1,
      avgScore: 68,
      targetDate: 'Dec 15, 2026',
      status: 'REINFORCING',
      statusColor: 'amber',
      primaryColorHex: '#F59E0B',
      weakDomain: 'Domain 2: Resilient Architectures'
    },
    {
      id: 'sec-plus',
      title: 'CompTIA Security+ (SY0-701)',
      shortCode: 'Sec+',
      vendor: 'CompTIA',
      readinessPercent: 88,
      completedSimulations: 4,
      avgScore: 88,
      targetDate: 'Nov 10, 2026',
      status: 'EXAM READY',
      statusColor: 'emerald',
      primaryColorHex: '#EF4444',
      weakDomain: 'Domain 4: Operations & Incident Response'
    }
  ];

  const currentEnrolled = enrolledCertifications.find(c => c.id === activeExamId) || enrolledCertifications[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* 1. STUDENT IDENTITY & READINESS HERO BANNER */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4 sm:space-x-5">
            <div className="relative">
              <img
                src={userProfile.avatarUrl}
                alt={userProfile.displayName}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-blue-500 shadow-lg shadow-blue-500/20"
              />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-[10px] text-white">
                ✓
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  {userProfile.displayName}
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  GOOGLE SSO VERIFIED
                </span>
                <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-md bg-blue-500/15 text-blue-400 border border-blue-500/30">
                  UNIVERSAL ALL-ACCESS PASS
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono">{userProfile.email}</p>
              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-400">
                <span>Active Target: <strong className="text-blue-300 font-bold">{activeExam.title}</strong></span>
                <span>•</span>
                <span>Archetype: <strong className="text-amber-400 font-bold">{userProfile.behavioralArchetype}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => openCertModal()}
              className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>Readiness Certificate</span>
            </button>

            <button
              onClick={() => syncWithAndroid()}
              disabled={isSyncing}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Mobile Telemetry'}</span>
            </button>

            <button
              onClick={() => onNavigate('simulator')}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Launch Practice Exam</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Strip */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-400 flex items-center gap-1 text-[11px] mb-0.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Overall Readiness
            </span>
            <div className="flex items-baseline gap-2">
              <strong className="text-emerald-400 text-xl font-black">
                {userProfile.assessmentScorePercent}%
              </strong>
              <span className="text-[10px] text-slate-400 font-medium">Pass Target: 70%</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-400 flex items-center gap-1 text-[11px] mb-0.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" /> Study Streak
            </span>
            <div className="flex items-baseline gap-2">
              <strong className="text-white text-xl font-black">5 Days Active</strong>
              <span className="text-[10px] text-amber-400 font-bold">On Track</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-400 flex items-center gap-1 text-[11px] mb-0.5">
              <Target className="w-3.5 h-3.5 text-blue-400" /> Test Day Countdown
            </span>
            <div className="flex items-baseline gap-2">
              <strong className="text-white text-xl font-black">18 Days Left</strong>
              <span className="text-[10px] text-slate-400 font-medium">{currentEnrolled.targetDate}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-400 flex items-center gap-1 text-[11px] mb-0.5">
              <Smartphone className="w-3.5 h-3.5 text-cyan-400" /> Android Companion
            </span>
            <div className="flex items-baseline gap-2">
              <strong className="text-cyan-400 text-sm font-bold">Pixel 8 Pro</strong>
              <span className="text-[10px] text-emerald-400 font-semibold">120+ Banks Cached</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. DYNAMIC NEXT RECOMMENDED ACTION BANNER */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-900/30 via-slate-900 to-indigo-950/40 border border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-start sm:items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase text-blue-400 tracking-wider">
                Recommended Next Step • Stage 2
              </span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                Weak Domain Detected (58%)
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 font-semibold mt-0.5">
              Reinforce <strong className="text-white">Domain 3: Security Architecture & Engineering</strong> with flashcards & NotebookLM citations to reach 85% passing readiness.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigate('notebook')}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Open Study Hub</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. NAVIGATION SUB-TABS */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2 text-xs font-bold overflow-x-auto">
        <button
          onClick={() => setActiveTab('JOURNEY')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'JOURNEY'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <BrainCircuit className="w-4 h-4" />
          <span>5-Stage Mastery Roadmap</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-400 text-slate-950 font-black">
            Active
          </span>
        </button>

        <button
          onClick={() => setActiveTab('ENROLLED')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'ENROLLED'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>My Enrolled Certifications ({enrolledCertifications.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('TEST_DAY')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'TEST_DAY'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <ListChecks className="w-4 h-4" />
          <span>Test Day Checklist ({completedChecklistCount}/5)</span>
        </button>

        <button
          onClick={() => setActiveTab('SYNC_ACCOUNT')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'SYNC_ACCOUNT'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Android Pairing & SSO</span>
        </button>
      </div>

      {/* 4. TAB 1: INTERACTIVE 5-STAGE MASTERY ROADMAP */}
      {activeTab === 'JOURNEY' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-blue-400" />
                  <span>The Complete Student Journey: {activeExam.shortCode} Certification Path</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Follow each guided milestone from initial baseline calibration to final test-day pass guarantee.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openCertModal()}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Pass Guarantee Qualified</span>
                </button>
              </div>
            </div>

            {/* 5-STAGE INTERACTIVE MILESTONES */}
            <div className="space-y-4">
              {/* STAGE 1: DIAGNOSTIC CALIBRATION */}
              <div className="p-5 sm:p-6 rounded-2xl bg-slate-950 border-2 border-emerald-500/40 space-y-4 relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black text-sm">
                      01
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                          STAGE 1 • CALIBRATION COMPLETE
                        </span>
                        <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                          SCORE: {userProfile.assessmentScorePercent}%
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white mt-0.5">
                        Baseline Diagnostic & Behavioral Telemetry
                      </h3>
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigate('assessment')}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Recalibrate (10 Questions)</span>
                  </button>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Your baseline cognitive profile was established from question dwell times and hesitation option switches. You are currently classified as an <strong className="text-amber-300 font-bold">"{userProfile.behavioralArchetype}"</strong> (42s average dwell, low hesitation switches).
                </p>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400 flex flex-wrap gap-4">
                  <span>Dwell Time: <strong className="text-slate-200">42s / question</strong></span>
                  <span>Distractor Strikeout: <strong className="text-emerald-400">4 strikes</strong></span>
                  <span>Option Switches: <strong className="text-blue-400">3 switches</strong></span>
                  <span>Sync Status: <strong className="text-emerald-400">Cloud Mirrored</strong></span>
                </div>
              </div>

              {/* STAGE 2: TARGETED WEAK DOMAIN REMEDIATION */}
              <div className="p-5 sm:p-6 rounded-2xl bg-slate-950 border-2 border-blue-500 space-y-4 shadow-xl shadow-blue-500/5 relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-black text-sm">
                      02
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                          STAGE 2 • ACTIVE FOCUS
                        </span>
                        <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 animate-pulse">
                          ACTION REQUIRED
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white mt-0.5">
                        Targeted Weak Domain Mastery & Grounded Citations
                      </h3>
                    </div>
                  </div>

                  <span className="text-xs text-slate-400 font-mono">
                    Progress: 65% Remediated
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Based on simulation telemetry, your accuracy is lowest in <strong className="text-white">Domain 3: Security Architecture & Engineering (58%)</strong> and <strong className="text-white">Domain 5: Identity & Access Management (64%)</strong>. Review these authoritative modules:
                </p>

                {/* 3 Quick Action Study Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <button
                    onClick={() => onNavigate('notebook')}
                    className="p-3.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-left transition-all group cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <FileText className="w-4 h-4 text-blue-400" />
                      <span className="text-[10px] text-slate-500 font-mono">NIST SP 800-53</span>
                    </div>
                    <h4 className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors">
                      Domain 3 Study Notes
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Authoritative citations on Bell-LaPadula & Biba models.
                    </p>
                  </button>

                  <button
                    onClick={() => onNavigate('notebook')}
                    className="p-3.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-left transition-all group cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <BookOpen className="w-4 h-4 text-emerald-400" />
                      <span className="text-[10px] text-slate-500 font-mono">15 Cards</span>
                    </div>
                    <h4 className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                      Active Recall Flashcards
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Spaced-repetition drills on IAM federation and SAML/OIDC.
                    </p>
                  </button>

                  <button
                    onClick={() => onNavigate('notebook')}
                    className="p-3.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-left transition-all group cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <Headphones className="w-4 h-4 text-purple-400" />
                      <span className="text-[10px] text-slate-500 font-mono">12 min audio</span>
                    </div>
                    <h4 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                      Audio Podcast Briefing
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Maya & Liam deep-dive into Security Engineering principles.
                    </p>
                  </button>
                </div>
              </div>

              {/* STAGE 3: FULL-LENGTH PRACTICE SIMULATION */}
              <div className="p-5 sm:p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center font-black text-sm">
                      03
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          STAGE 3 • TIMED BENCHMARK
                        </span>
                        <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                          3 MOCKS COMPLETED
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white mt-0.5">
                        High-Stress Timed Simulation & Distractor Elimination
                      </h3>
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigate('simulator')}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <PlayCircle className="w-4 h-4" />
                    <span>Launch New Exam Simulator</span>
                  </button>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Train under exact certification conditions with a 30-minute countdown, visual urgency alerts, distractor strikethrough (̶S̶), and the interactive Question Review Grid.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Best Simulation Score</span>
                    <strong className="text-base font-bold text-emerald-400">81% (Passed)</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Average Latency</span>
                    <strong className="text-base font-bold text-blue-400">38s / Question</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Distractors Struck</span>
                    <strong className="text-base font-bold text-white">12 Total</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Option Hesitation</span>
                    <strong className="text-base font-bold text-amber-400">Low (1.4/exam)</strong>
                  </div>
                </div>
              </div>

              {/* STAGE 4: PERFORMANCE AUDIT & READINESS FORECAST */}
              <div className="p-5 sm:p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center font-black text-sm">
                      04
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                          STAGE 4 • ANALYTICS AUDIT
                        </span>
                        <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300">
                          82% PASS PROBABILITY
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white mt-0.5">
                        Domain Heatmap & Pass Guarantee Verification
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onNavigate('dashboard')}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold text-xs border border-slate-700 transition-colors cursor-pointer"
                    >
                      <BarChart3 className="w-3.5 h-3.5 inline mr-1 text-blue-400" />
                      <span>View Full Analytics</span>
                    </button>
                    <button
                      onClick={() => openCertModal()}
                      className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs transition-colors cursor-pointer"
                    >
                      <Award className="w-3.5 h-3.5 inline mr-1 text-amber-400" />
                      <span>Certificate</span>
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Your performance across all 8 CISSP domains has crossed the 70% proficiency line, qualifying your account for the <strong className="text-emerald-400">CertMaster Pass Guarantee</strong>.
                </p>
              </div>

              {/* STAGE 5: MOBILE OFFLINE SYNC & TEST DAY READY */}
              <div className="p-5 sm:p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center font-black text-sm">
                      05
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                          STAGE 5 • EXAM DAY READINESS
                        </span>
                        <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300">
                          18 DAYS TO EXAM
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white mt-0.5">
                        Cross-Device Sync & Testing Center Preparation
                      </h3>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('TEST_DAY')}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold text-xs border border-slate-700 transition-colors cursor-pointer"
                  >
                    <span>View Test Day Checklist →</span>
                  </button>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Keep studying on the go. Your CertMaster Android companion app on Pixel 8 Pro is completely synchronized with offline flashcards and simulation banks.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB 2: ENROLLED CERTIFICATIONS */}
      {activeTab === 'ENROLLED' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">My Active Certification Banks</h2>
                <p className="text-xs text-slate-400">
                  Switch between enrolled exams to update your learning roadmap and question bank instantly.
                </p>
              </div>
              <button
                onClick={() => onNavigate('catalog')}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Browse 120+ Courses →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {enrolledCertifications.map(cert => {
                const isSelected = cert.id === activeExamId;
                return (
                  <div
                    key={cert.id}
                    className={`p-5 rounded-2xl border text-xs flex flex-col justify-between transition-all ${
                      isSelected
                        ? 'bg-slate-950 border-blue-500 ring-2 ring-blue-500/30 shadow-xl'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span
                          className="px-2.5 py-1 rounded-lg text-xs font-bold text-white"
                          style={{ backgroundColor: cert.primaryColorHex }}
                        >
                          {cert.shortCode}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                          {cert.status}
                        </span>
                      </div>

                      <h3 className="font-bold text-white text-sm line-clamp-2">
                        {cert.title}
                      </h3>
                      <p className="text-[11px] text-slate-400">Vendor: {cert.vendor}</p>

                      <div className="space-y-1.5 pt-2 border-t border-slate-800 text-[11px]">
                        <div className="flex justify-between text-slate-300">
                          <span>Readiness:</span>
                          <strong className="text-emerald-400">{cert.readinessPercent}%</strong>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>Target Date:</span>
                          <span className="font-mono text-slate-400">{cert.targetDate}</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>Focus Area:</span>
                          <span className="text-amber-400 truncate max-w-[150px]">{cert.weakDomain}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-800 flex items-center gap-2">
                      {isSelected ? (
                        <div className="w-full py-2 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/40 text-center font-bold text-xs flex items-center justify-center gap-1.5">
                          <Check className="w-3.5 h-3.5" />
                          <span>Active Journey Target</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setActiveExamId(cert.id);
                            showToast(`Switched active journey target to ${cert.shortCode}`);
                          }}
                          className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-center font-bold text-xs transition-colors cursor-pointer"
                        >
                          Set as Target Exam
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 6. TAB 3: TEST DAY CHECKLIST & TIME MANAGEMENT */}
      {activeTab === 'TEST_DAY' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <ListChecks className="w-5 h-5 text-emerald-400" />
                  <span>Exam Day Readiness & Test Center Protocol</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Ensure all administrative, psychological, and strategy requirements are checked before test day.
                </p>
              </div>

              <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                {completedChecklistCount} of 5 Completed
              </div>
            </div>

            <div className="space-y-3">
              <label
                onClick={() => toggleChecklist('ids')}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-900 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={checklist.ids}
                    onChange={() => {}}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-0"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-white">Two Valid Forms of Government Photo ID</h4>
                    <p className="text-xs text-slate-400">
                      Pearson VUE requires one primary government photo ID (Passport / Driver's License) with matching name.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase text-slate-500">Required</span>
              </label>

              <label
                onClick={() => toggleChecklist('timing')}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-900 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={checklist.timing}
                    onChange={() => {}}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-0"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-white">Time Management Strategy (72s per question)</h4>
                    <p className="text-xs text-slate-400">
                      Do not exceed 100 seconds on any single scenario question. Use "Mark for Review" and advance.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase text-slate-500">Pacing</span>
              </label>

              <label
                onClick={() => toggleChecklist('distractor')}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-900 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={checklist.distractor}
                    onChange={() => {}}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-0"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-white">Distractor Elimination Rule (̶S̶ Technique)</h4>
                    <p className="text-xs text-slate-400">
                      Always eliminate at least 2 obviously flawed distractor options before choosing between the top two answers.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase text-slate-500">Strategy</span>
              </label>

              <label
                onClick={() => toggleChecklist('nist')}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-900 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={checklist.nist}
                    onChange={() => {}}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-0"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-white">Review NIST SP 800-53 / ISO 27001 Grounding</h4>
                    <p className="text-xs text-slate-400">
                      Memorize the primary differences between detective, preventive, and compensating security controls.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase text-slate-500">Framework</span>
              </label>

              <label
                onClick={() => toggleChecklist('sleep')}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-900 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={checklist.sleep}
                    onChange={() => {}}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-0"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-white">8 Hours Rest & Hydration Prior to Test</h4>
                    <p className="text-xs text-slate-400">
                      Cognitive endurance is critical. Full-length 125-175 question exams require intense mental focus.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase text-slate-500">Physical</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* 7. TAB 4: MOBILE SYNC & SSO ACCOUNT SETTINGS */}
      {activeTab === 'SYNC_ACCOUNT' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-emerald-400" />
                <span>Android Companion Pairing & SSO Credentials</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                CertMaster links Web & Android under Google Single Sign-On with offline SQLite caching.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <span className="text-xs font-bold text-slate-400 uppercase">Paired Device Profile</span>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Google Pixel 8 Pro</h4>
                  <p className="text-xs text-slate-400 font-mono">Device ID: pixel8pro_android_gnm_77a9</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400">
                    SYNCHRONIZED & READY
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                All 120+ certification banks, question explanations, and telemetry dwell logs are mirrored to the mobile app's local Room database for offline flights and commuting.
              </p>
              <button
                onClick={() => syncWithAndroid()}
                disabled={isSyncing}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing with Mobile...' : 'Force Immediate Android Sync'}</span>
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <span className="text-xs font-bold text-slate-400 uppercase">SSO & Entitlement Tier</span>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                  <KeyRound className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{userProfile.email}</h4>
                  <p className="text-xs text-slate-400">SSO Subject ID: {userProfile.userId}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/15 text-blue-400">
                    UNIVERSAL MULTI-PASS LIFETIME
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Includes all newly ingested courses added hourly to the central curriculum pipeline across Web and Android.
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('login')}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-colors cursor-pointer text-center"
                >
                  Inspect SSO Claims
                </button>
                <button
                  onClick={() => setShowSyncModal(true)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-colors cursor-pointer text-center"
                >
                  Sync Telemetry Logs
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
