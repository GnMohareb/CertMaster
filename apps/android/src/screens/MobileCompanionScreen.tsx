import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Smartphone,
  Globe,
  ArrowRightLeft,
  QrCode,
  CheckCircle2,
  Download,
  Shield,
  Layers,
  Sparkles,
  Wifi,
  Copy,
  Check,
  Play,
  RotateCcw,
  Zap,
  Lock,
  ExternalLink
} from 'lucide-react';

export const MobileCompanionScreen: React.FC = () => {
  const { userProfile, activeExam, syncWithAndroid, isSyncing, setShowSyncModal } = useAuth();

  const [copiedCode, setCopiedCode] = useState(false);
  const [pairingCode, setPairingCode] = useState('CERT-9824');
  const [phoneScreenState, setPhoneScreenState] = useState<'DASHBOARD' | 'SIMULATION' | 'FLASHCARDS'>('DASHBOARD');

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(pairingCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero: Website Designed to Complement the Mobile App */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                Central Web Platform
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5" />
                CertMaster Mobile App Companion
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              The Dedicated Cloud Hub For Your Mobile App
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed">
              This website is engineered to <strong>seamlessly complement your CertMaster Android app</strong>. While your phone handles on-the-go practice, audio overviews, and active recall, this web platform gives you an expansive desktop environment for full-length timed simulations, deep multi-domain Bézier analytics, and universal multi-exam bank management.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => syncWithAndroid()}
                disabled={isSyncing}
                className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 cursor-pointer"
              >
                <ArrowRightLeft className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Synchronizing State...' : 'Sync With Mobile App Now'}</span>
              </button>

              <button
                onClick={() => setShowSyncModal(true)}
                className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Wifi className="w-4 h-4 text-emerald-400" />
                <span>View Live Cloud Telemetry</span>
              </button>
            </div>
          </div>

          {/* Interactive Mobile Pairing Widget */}
          <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-700/80 shadow-2xl text-center space-y-4 max-w-sm w-full">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-blue-400" />
                Quick Device Pair
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                Live Bridge
              </span>
            </div>

            {/* Simulated QR Code graphic */}
            <div className="p-4 rounded-xl bg-white mx-auto w-36 h-36 flex items-center justify-center shadow-md">
              <svg className="w-28 h-28 text-slate-950" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14 0h4v4h-4v-4zm-4 4h4v4h-4v-4zm0-4h4v4h-4v-4zm4-4h4v4h-4v-4zm-4 0h4v4h-4v-4z"/>
              </svg>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-slate-400 block">Or enter 6-digit sync code in app:</span>
              <div className="flex items-center justify-center space-x-2">
                <span className="font-mono text-xl font-extrabold text-blue-400 tracking-wider bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                  {pairingCode}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Copy Code"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 leading-tight">
              Open <strong>CertMaster Android &gt; Cloud Hub &gt; Connect</strong> and scan this code to link <span className="text-white font-mono">{userProfile.email}</span>.
            </p>
          </div>
        </div>
      </div>

      {/* Feature Matrix: Why Web + Mobile is the Complete Solution */}
      <div className="space-y-4">
        <div className="text-center max-w-2xl mx-auto space-y-1">
          <h2 className="text-xl font-extrabold text-white">How Web & Mobile Complement Each Other</h2>
          <p className="text-xs text-slate-400">
            Engineered as two halves of a single cloud ecosystem sharing accounts, subscriptions, and scores.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mobile App Strength */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">CertMaster Mobile App</h3>
                <p className="text-xs text-slate-400">Designed for on-the-go repetition & active recall</p>
              </div>
            </div>

            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Offline-First SQLite Cache:</strong> Practice full question sets and flashcards on flights, commutes, or off-grid.</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Background Audio Briefings:</strong> Listen to Dr. Maya & Liam's deep-dive conversations with your screen locked.</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Tactile Flashcard Swiping:</strong> Rapid 3D active recall spaced-repetition drills optimized for single-hand gestures.</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Google Play In-App Billing:</strong> Pay securely via Google Play with instant unlocking on this web platform.</span>
              </li>
            </ul>
          </div>

          {/* Web App Strength */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-blue-500/30 shadow-lg shadow-blue-500/5 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/30">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">CertMaster Central Web Platform</h3>
                <p className="text-xs text-slate-400">Designed for deep focus & desktop command</p>
              </div>
            </div>

            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span><strong>Full-Screen Timed Simulations:</strong> Experience the true high-stakes exam interface with keyboard shortcuts (1-4, A-D).</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span><strong>Interactive Bézier Performance Curves:</strong> Scrub historical scores over time across individual domains with multi-curve overlay.</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span><strong>Domain Stress Heatmap:</strong> Visual diagnostic identifying latency and answer-oscillation bottlenecks.</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span><strong>Universal 112 Exam Bank Management:</strong> Search, filter, and unlock subjects across ISC2, AWS, PMI, CompTIA, ISACA, and Cisco.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Interactive Side-by-Side Synchronization Showcase */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Interactive Cross-Device Live State Mirror
            </h3>
            <p className="text-xs text-slate-400">
              See how actions on the web platform immediately reflect inside your mobile app's data layer
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400">Simulate Mobile View:</span>
            {(['DASHBOARD', 'SIMULATION', 'FLASHCARDS'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setPhoneScreenState(mode)}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                  phoneScreenState === mode
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Mock Phone Frame & Web Hub Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Simulated Mobile Mockup */}
          <div className="mx-auto w-full max-w-xs bg-slate-950 border-4 border-slate-800 rounded-[36px] p-3 shadow-2xl relative overflow-hidden">
            {/* Phone Speaker Notch */}
            <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-2" />

            {/* Screen Content */}
            <div className="bg-slate-900 rounded-[24px] p-4 min-h-[360px] text-xs flex flex-col justify-between border border-slate-800">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center space-x-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-extrabold text-white text-[11px]">CertMaster Mobile</span>
                  </div>
                  <span className="text-[10px] text-blue-400 font-mono">Pixel 8 Pro</span>
                </div>

                {phoneScreenState === 'DASHBOARD' && (
                  <div className="space-y-2 animate-in fade-in">
                    <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                      <span className="text-[10px] text-slate-400 block">Synced User</span>
                      <strong className="text-white text-xs">{userProfile.displayName}</strong>
                      <span className="text-[10px] text-emerald-400 block font-mono">
                        {userProfile.email}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-500">Readiness</span>
                        <strong className="text-emerald-400 text-sm block">
                          {userProfile.assessmentScorePercent}%
                        </strong>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-500">Cognitive Stress</span>
                        <strong className="text-amber-400 text-sm block">
                          {userProfile.cognitiveStressBaseline}/100
                        </strong>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-blue-600/15 border border-blue-500/30 text-[10px] text-blue-300">
                      Active: <strong>{activeExam.shortCode}</strong> • Unlocked on Web & Mobile
                    </div>
                  </div>
                )}

                {phoneScreenState === 'SIMULATION' && (
                  <div className="space-y-2 animate-in fade-in">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>CISSP Question #3</span>
                      <span className="text-emerald-400">Room SQLite Synced</span>
                    </div>
                    <p className="text-slate-200 text-[11px] font-semibold leading-tight">
                      Which mathematical model enforces no read-up and no write-down?
                    </p>
                    <div className="space-y-1 pt-1">
                      <div className="p-1.5 rounded bg-slate-800 text-[10px] text-slate-300">A. Biba Model</div>
                      <div className="p-1.5 rounded bg-blue-600/30 border border-blue-500 text-[10px] text-white font-bold">
                        B. Bell-LaPadula (Active)
                      </div>
                      <div className="p-1.5 rounded bg-slate-800 text-[10px] text-slate-300">C. Clark-Wilson</div>
                    </div>
                  </div>
                )}

                {phoneScreenState === 'FLASHCARDS' && (
                  <div className="space-y-2 animate-in fade-in">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-blue-900 to-indigo-950 border border-blue-500/40 text-center space-y-2">
                      <span className="text-[9px] font-mono text-cyan-300 uppercase">3D Active Recall</span>
                      <p className="text-white font-bold text-xs">
                        What is MTD = RTO + WRT?
                      </p>
                      <span className="text-[10px] text-emerald-400 block font-semibold">
                        Mastered in Box 3
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Nav Simulation */}
              <div className="pt-2 border-t border-slate-800 flex justify-around text-[9px] text-slate-400">
                <span className="text-blue-400 font-bold">Home</span>
                <span>Exams</span>
                <span>Audio</span>
                <span>Profile</span>
              </div>
            </div>
          </div>

          {/* Web Hub Sync Actions */}
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <h4 className="font-bold text-white flex items-center gap-1.5">
                <ArrowRightLeft className="w-4 h-4 text-blue-400" />
                Live State Synchronization Bus
              </h4>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Both platforms connect to the same central user record. Any simulation completed on this web platform instantly updates your mobile app's local Room database upon next sync, and vice versa.
              </p>
            </div>

            <div className="space-y-2 font-mono text-[11px]">
              <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700 flex justify-between">
                <span className="text-slate-300">Active Account:</span>
                <span className="text-blue-400 font-bold">{userProfile.email}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700 flex justify-between">
                <span className="text-slate-300">User ID:</span>
                <span className="text-slate-400">{userProfile.userId}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700 flex justify-between">
                <span className="text-slate-300">Sync Status:</span>
                <span className="text-emerald-400 font-bold">Connected • Real-Time Broadcast</span>
              </div>
            </div>

            <button
              onClick={() => syncWithAndroid()}
              disabled={isSyncing}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Simulate Cross-Platform Push</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
