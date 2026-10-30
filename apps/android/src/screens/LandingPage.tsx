import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Smartphone,
  PlayCircle,
  BrainCircuit,
  Layers,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Zap,
  BookOpen,
  Award,
  ChevronRight,
  Clock,
  Flame,
  Radio,
  Lock,
  Compass,
  UserCheck,
  Headphones,
  FileCheck,
  KeyRound,
  Fingerprint,
  Building
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (tab: string) => void;
  onOpenCheckout: (examId?: string, isAllAccess?: boolean) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onOpenCheckout }) => {
  const { userProfile, activeExam, isAuthenticated, ssoSession, setShowSyncModal } = useAuth();

  const dynamicCertHighlights = [
    { code: 'CISSP', title: 'Certified Information Systems Security Professional', vendor: '(ISC)²', color: '#2563EB', tag: 'Updated Hourly' },
    { code: 'AWS SAA-C03', title: 'Solutions Architect Associate', vendor: 'AWS', color: '#F59E0B', tag: 'Live Ingestion' },
    { code: 'CompTIA Sec+', title: 'Security+ (SY0-701)', vendor: 'CompTIA', color: '#EF4444', tag: 'Updated Today' },
    { code: 'CISM', title: 'Certified Information Security Manager', vendor: 'ISACA', color: '#10B981', tag: 'Hot Subject' },
    { code: 'PMP', title: 'Project Management Professional', vendor: 'PMI', color: '#8B5CF6', tag: '2024 Exam Bank' },
    { code: 'GCP PCA', title: 'Professional Cloud Architect', vendor: 'Google Cloud', color: '#06B6D4', tag: 'Expanded Bank' },
  ];

  const studentJourneySteps = [
    {
      step: '01',
      title: 'Calibrate Knowledge Baseline',
      desc: 'Take the 10-question behavioral diagnostic to map your initial accuracy and identify cognitive blind spots.',
      icon: BrainCircuit,
      badge: 'Step 1'
    },
    {
      step: '02',
      title: 'Target Weak Domains & Flashcards',
      desc: 'Leverage NotebookLM authoritative source grounding (NIST SP 800-53, ISO 27001) and active recall flashcards.',
      icon: BookOpen,
      badge: 'Step 2'
    },
    {
      step: '03',
      title: 'High-Stress Timed Simulation',
      desc: 'Train with countdown timers, distractor elimination (̶S̶), and telemetry tracking of your hesitation and dwell time.',
      icon: PlayCircle,
      badge: 'Step 3'
    },
    {
      step: '04',
      title: 'Cross-Platform Sync & Certification',
      desc: 'Instant entitlements and progress synchronization between Web and Android with zero progress loss.',
      icon: Smartphone,
      badge: 'Step 4'
    }
  ];

  return (
    <div className="space-y-16 animate-in fade-in pb-12">
      {/* 1. HERO MARKETING SECTION */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-blue-950/70 border border-slate-800 p-8 sm:p-12 lg:p-16 shadow-2xl">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-6">
          {/* Live Status Pill */}
          <div className="inline-flex flex-wrap items-center gap-2 p-1.5 pr-4 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs shadow-inner">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              LIVE DYNAMIC CATALOG
            </span>
            <span className="text-slate-300 font-medium">
              120+ Certification Banks • Constantly Expanding & Ingested Hourly
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            Pass IT & Cyber Certifications with{' '}
            <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
              Precision Behavioral AI
            </span>{' '}
            & Real Simulations
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
            CertMaster is the central companion platform to the Android mobile app. Train under real exam stress, eliminate distractors, listen to NotebookLM audio briefings, and sync your study journey instantly across Web and Mobile.
          </p>

          {/* Call-to-Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-3">
            <button
              onClick={() => onNavigate('user-area')}
              className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 cursor-pointer group"
            >
              <span>Enter Student Portal & Journey</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => onNavigate('login')}
              className="px-5 py-3.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 hover:text-white font-bold text-sm border border-indigo-500/40 shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <KeyRound className="w-4 h-4 text-cyan-400" />
              <span>{isAuthenticated ? 'SSO Hub & Tokens' : 'Sign In with SSO'}</span>
            </button>

            <button
              onClick={() => onNavigate('simulator')}
              className="px-6 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <PlayCircle className="w-4 h-4 text-emerald-400" />
              <span>Launch Practice Simulator</span>
            </button>

            <button
              onClick={() => onNavigate('catalog')}
              className="px-5 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white font-semibold text-sm border border-slate-800 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Browse 120+ Course Banks</span>
            </button>
          </div>

          {/* Platform Trust & Synchronicity Badges */}
          <div className="pt-6 border-t border-slate-800/80 flex flex-wrap items-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>Active Account: <strong className="text-slate-200">{userProfile.email}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>Cross-Platform Web + Android Instant Entitlements</span>
            </div>
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>Continuous Course Ingestion Pipeline</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. DYNAMIC LIVE CATALOG SHOWCASE */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Constantly Expanding Library</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Popular Certifications & Live Course Ingestion
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Unlike static prep platforms, our course catalog grows hourly with updated scenario questions, regulatory frameworks, and vendor blueprint updates.
            </p>
          </div>

          <button
            onClick={() => onNavigate('catalog')}
            className="flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 shrink-0 cursor-pointer"
          >
            <span>View All 120+ Subject Banks</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dynamicCertHighlights.map((cert, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all hover:shadow-xl group space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-bold text-slate-400 uppercase tracking-wider">
                    {cert.vendor}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {cert.tag}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-3.5 h-3.5 rounded-full shrink-0"
                    style={{ backgroundColor: cert.color }}
                  />
                  <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">
                    {cert.code}
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  {cert.title}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Web & Android Synced
                </span>
                <button
                  onClick={() => onNavigate('simulator')}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>Practice</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. STUDENT JOURNEY ROADMAP (CLEAR UX & LEARNING PATH) */}
      <section className="p-8 sm:p-10 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/15 text-blue-400 border border-blue-500/30 inline-block">
            Proven Certification Path
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            The CertMaster Student Journey
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            A structured, 4-phase methodology engineered to take you from initial diagnostic baseline to exam-day mastery without burnout.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {studentJourneySteps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="relative p-6 rounded-2xl bg-slate-950/70 border border-slate-800/90 hover:border-blue-500/40 transition-all space-y-4 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-slate-700 group-hover:text-blue-500/50 transition-colors">
                    {s.step}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                    {s.badge}
                  </span>
                </div>

                <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <Icon className="w-6 h-6" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                    {s.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-800/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3 text-slate-300">
            <Compass className="w-5 h-5 text-cyan-400 shrink-0" />
            <span>
              Ready to check your current progress? View your personalized student roadmap, active pass status, and weak domains.
            </span>
          </div>
          <button
            onClick={() => onNavigate('user-area')}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shrink-0 transition-colors cursor-pointer"
          >
            Go to Student Portal →
          </button>
        </div>
      </section>

      {/* 4. CORE PLATFORM DIFFERENTIATORS */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Engineered Like the Real Exam Engine
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Every feature on the web companion matches the Android app experience for zero cognitive friction.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center font-mono font-bold text-sm">
              ̶S̶
            </div>
            <h3 className="text-base font-bold text-white">
              Strikethrough Distractor Tool
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Eliminate wrong options with one click. Proven by cognitive research to reduce option confusion and raise simulation accuracy by up to 22%.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Headphones className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">
              Multimodal NotebookLM Audio
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Listen to podcast-style deep-dive discussions between Maya and Liam on complex security domains during your commute or between exam sessions.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">
              Instant Android App Sync
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Start an exam on your desktop browser, pause, and pick up right where you left off on your Android phone with cloud telemetry synchronization.
            </p>
          </div>
        </div>
      </section>

      {/* 5. PRICING & UNIVERSAL ALL-ACCESS PASS */}
      <section className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-2xl space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
            Simple, Transparent Pricing
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Universal Cross-Platform Access
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            No recurring monthly traps. Unlock once and study anywhere.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Single Exam Pass */}
          <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase">Single Subject Pass</span>
                <span className="text-2xl font-black text-white">$29</span>
              </div>
              <p className="text-xs text-slate-400">
                Full lifetime bank access for any one certification (e.g., CISSP or AWS SAA).
              </p>
              <ul className="text-xs text-slate-300 space-y-2 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Full timed simulation engine & question bank
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  NotebookLM study guide & citations
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Web + Android cross-platform unlock
                </li>
              </ul>
            </div>

            <button
              onClick={() => onOpenCheckout(activeExam.id, false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Unlock Single Exam ($29)
            </button>
          </div>

          {/* Universal Multi-Pass */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-blue-900/40 to-slate-950/90 border-2 border-blue-500 shadow-xl space-y-4 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-slate-950 uppercase tracking-wider">
              Most Popular
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-300 uppercase">Universal All-Access Pass</span>
                <span className="text-2xl font-black text-white">$99</span>
              </div>
              <p className="text-xs text-slate-300">
                Permanent unlock for all 120+ certification banks across Web & Android.
              </p>
              <ul className="text-xs text-slate-200 space-y-2 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  All 120+ Certification Banks (ISC2, AWS, CompTIA, ISACA, PMI)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Hourly Ingested New Courses automatically unlocked
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  AI behavioral stress profiling & telemetry sync
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Unlimited audio overview briefings
                </li>
              </ul>
            </div>

            <button
              onClick={() => onOpenCheckout(undefined, true)}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition-colors cursor-pointer"
            >
              Get Universal All-Access Pass ($99)
            </button>
          </div>
        </div>
      </section>

      {/* 5. ENTERPRISE SINGLE SIGN-ON & CROSS-PLATFORM CLOUD ARCHITECTURE */}
      <section className="p-8 sm:p-10 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
              <Fingerprint className="w-4 h-4" />
              <span>Unified Enterprise Security</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Connected Single Sign-On (SSO) & Android Federation
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              One identity connects your entire certification journey. CertMaster implements OAuth 2.0 / OIDC and SAML 2.0 standards, ensuring your subscriptions and test scores federate instantly between Web and Android without friction.
            </p>
          </div>

          <button
            onClick={() => onNavigate('login')}
            className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <KeyRound className="w-4 h-4" />
            <span>Open SSO Login Portal</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-white">Google Identity Services</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Native Android Credential Manager token exchange allows you to sign in with <strong className="text-slate-200">gnmohareb@gmail.com</strong> once and remain authenticated on both platforms.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Building className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Enterprise SAML 2.0</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Integrate with Okta, Microsoft Entra ID (Azure AD), and PingFederate. Role-based access control and team license provisioning out of the box.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Instant Cross-Device Sync</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time WebSocket and REST endpoints propagate active exam unlocks, stress scores, and flashcard recall records with sub-second latency.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
