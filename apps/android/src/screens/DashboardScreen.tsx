import React from 'react';
import { useAuth } from '../context/AuthContext';
import { PerformanceLineChart } from '../components/PerformanceLineChart';
import { DomainStressHeatmap } from '../components/DomainStressHeatmap';
import { HISTORICAL_SIMULATION_SESSIONS } from '../data/historicalScores';
import {
  ShieldAlert,
  BrainCircuit,
  Zap,
  PlayCircle,
  BookOpen,
  Headphones,
  CheckCircle2,
  TrendingUp,
  Layers,
  ArrowRight,
  Sparkles,
  Smartphone
} from 'lucide-react';

interface DashboardScreenProps {
  onNavigate: (tab: string) => void;
  onOpenCheckout: (examId?: string) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onNavigate, onOpenCheckout }) => {
  const { userProfile, activeExam, activeExamId } = useAuth();
  const isSubscribed = userProfile.subscriptions[activeExamId]?.status === 'ACTIVE';

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Top Breadcrumb & Return to Journey */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <button
          onClick={() => onNavigate('user-area')}
          className="flex items-center space-x-1 text-slate-400 hover:text-white transition-colors cursor-pointer group"
        >
          <span className="text-blue-400 font-bold group-hover:-translate-x-0.5 transition-transform">←</span>
          <span className="font-semibold">Back to Learning Journey</span>
        </button>
        <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-mono">
          <span>Stage 4 of 5</span>
          <span>•</span>
          <span className="text-purple-400 font-bold">Performance Analytics & Predictive Pass Meter</span>
        </div>
      </div>

      {/* Top Banner & Readiness Profile Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: activeExam.primaryColorHex }} />
                Active Exam Bank: {activeExam.shortCode}
              </span>
              <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5" />
                Web & Android Synchronized
              </span>
              {!isSubscribed && (
                <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  Preview Mode
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome Back, {userProfile.displayName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Your central telemetry baseline is calibrated to{' '}
              <strong className="text-blue-400 font-bold">{userProfile.assessmentScorePercent}% Readiness</strong>.
              Your cognitive archetype is classified as{' '}
              <span className="text-amber-300 font-bold underline decoration-amber-400/40 underline-offset-4">
                "{userProfile.behavioralArchetype}"
              </span>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('simulator')}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Launch Simulator</span>
            </button>
            <button
              onClick={() => onNavigate('assessment')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
            >
              <BrainCircuit className="w-4 h-4 text-cyan-400" />
              <span>Recalibrate Profile</span>
            </button>
          </div>
        </div>

        {/* Behavioral Metrics Trio */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Readiness Baseline</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-extrabold text-emerald-400">
                {userProfile.assessmentScorePercent}%
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Pass Target: 70%</span>
            </div>
            <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${userProfile.assessmentScorePercent}%` }}
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Cognitive Stress Index</span>
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-extrabold text-amber-400">
                {userProfile.cognitiveStressBaseline}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">/ 100</span>
              <span className="text-[10px] text-amber-400 font-semibold bg-amber-500/10 px-1.5 py-0.5 rounded">
                Moderate Hesitation
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5 truncate">
              Avg Dwell: {userProfile.averageDwellTimeSec}s • Switch Rate: {userProfile.optionSwitchCountAvg}/q
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Universal Entitlement</span>
              <ShieldAlert className="w-4 h-4 text-blue-400" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-lg font-extrabold text-white">
                {userProfile.subscriptionTier}
              </span>
            </div>
            <p className="text-[10px] text-emerald-400 mt-1 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              112 Banks Available • Instant Android Sync
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Multi-Domain Bézier Chart & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 2 Cols: Performance Curve Visualization */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                Historical Performance Trajectory (Bézier Telemetry)
              </h2>
              <p className="text-xs text-slate-400">
                Interactive score evolution scrubbable across dates and individual domains
              </p>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-bold">
              +24% Delta
            </span>
          </div>

          <PerformanceLineChart sessions={HISTORICAL_SIMULATION_SESSIONS} />
        </div>

        {/* 1 Col: Quick Feature Navigation */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Rapid Study Launchpad
            </h3>

            <div className="space-y-2">
              <button
                onClick={() => onNavigate('simulator')}
                className="w-full p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-left transition-all group flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400 group-hover:scale-105 transition-transform">
                    <PlayCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-blue-300">
                      Component-Identical Simulator
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Timed engine, strikethrough tool, quick ribbon
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
              </button>

              <button
                onClick={() => onNavigate('assessment')}
                className="w-full p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-left transition-all group flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-cyan-600/20 text-cyan-400 group-hover:scale-105 transition-transform">
                    <BrainCircuit className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-cyan-300">
                      Behavioral Assessment (10 Qs)
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Calibrates latency, hesitation, stress index
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              </button>

              <button
                onClick={() => onNavigate('notebook')}
                className="w-full p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-left transition-all group flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-emerald-600/20 text-emerald-400 group-hover:scale-105 transition-transform">
                    <Headphones className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-emerald-300">
                      Audio Briefings & Flashcards
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Maya & Liam podcast, 3D active recall
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
              </button>

              <button
                onClick={() => onNavigate('catalog')}
                className="w-full p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-left transition-all group flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 group-hover:scale-105 transition-transform">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-indigo-300">
                      Browse 112 Exam Banks
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      AWS, CompTIA, ISACA, PMI, Cisco, Google
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Domain Stress & Readiness Heatmap */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
        <DomainStressHeatmap onPracticeDomain={() => onNavigate('simulator')} />
      </div>
    </div>
  );
};
