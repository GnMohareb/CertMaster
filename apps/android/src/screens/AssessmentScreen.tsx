import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { ASSESSMENT_10_QUESTIONS } from '../data/assessmentQuestions';
import { Question, UserCentralProfile } from '../types';
import {
  BrainCircuit,
  Zap,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Check,
  Smartphone
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AssessmentScreenProps {
  onComplete?: () => void;
}

export const AssessmentScreen: React.FC<AssessmentScreenProps> = ({ onComplete }) => {
  const { userProfile, updateProfile } = useAuth();

  const questions: Question[] = ASSESSMENT_10_QUESTIONS;
  const total = questions.length;

  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [eliminatedOptions, setEliminatedOptions] = useState<Record<number, number[]>>({});
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Behavioral telemetry
  const questionStartTimeRef = useRef<number>(Date.now());
  const [latencies, setLatencies] = useState<number[]>([]);
  const [switchCounts, setSwitchCounts] = useState<number[]>(new Array(total).fill(0));
  const [totalEliminations, setTotalEliminations] = useState<number>(0);

  const [finalArchetype, setFinalArchetype] = useState<string>('');
  const [finalScore, setFinalScore] = useState<number>(0);
  const [finalStress, setFinalStress] = useState<number>(0);

  useEffect(() => {
    questionStartTimeRef.current = Date.now();
  }, [currentIdx]);

  const currentQ = questions[currentIdx];

  const handleSelectOption = (optIdx: number) => {
    const elapsedSec = Math.max(1, Math.round((Date.now() - questionStartTimeRef.current) / 1000));
    setLatencies(prev => {
      const copy = [...prev];
      copy[currentIdx] = (copy[currentIdx] || 0) + elapsedSec;
      return copy;
    });

    if (selectedAnswers[currentIdx] !== undefined && selectedAnswers[currentIdx] !== optIdx) {
      setSwitchCounts(prev => {
        const copy = [...prev];
        copy[currentIdx] = (copy[currentIdx] || 0) + 1;
        return copy;
      });
    }

    setSelectedAnswers(prev => ({ ...prev, [currentIdx]: optIdx }));
  };

  const handleEliminate = (optIdx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setEliminatedOptions(prev => {
      const list = prev[currentIdx] || [];
      const updated = list.includes(optIdx)
        ? list.filter(i => i !== optIdx)
        : [...list, optIdx];

      if (!list.includes(optIdx)) {
        setTotalEliminations(c => c + 1);
      }

      return { ...prev, [currentIdx]: updated };
    });
  };

  const handleNext = () => {
    if (currentIdx < total - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      finishAssessment();
    }
  };

  const finishAssessment = () => {
    let correct = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        correct++;
      }
    });

    const scorePct = Math.round((correct / total) * 100);
    const avgLatency =
      latencies.length > 0
        ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
        : 45;
    const totalSwitches = switchCounts.reduce((a, b) => a + b, 0);

    // Archetype Classification Logic:
    // Fast Guesser: avgLatency < 20s and totalSwitches <= 2
    // Confident Master: scorePct >= 80 and avgLatency < 45s and totalSwitches <= 3
    // Analytical Hesitator: avgLatency >= 45s or totalSwitches >= 4
    // Deliberate Strategist: totalEliminations >= 6 and scorePct >= 70
    let archetype: UserCentralProfile['behavioralArchetype'] = 'Analytical Hesitator';
    let stress = 68;

    if (scorePct >= 85 && avgLatency < 40 && totalSwitches <= 2) {
      archetype = 'Confident Master';
      stress = 35;
    } else if (totalEliminations >= 6 && scorePct >= 70) {
      archetype = 'Deliberate Strategist';
      stress = 54;
    } else if (avgLatency < 22 && scorePct < 70) {
      archetype = 'Fast Guesser';
      stress = 72;
    } else if (avgLatency >= 45 || totalSwitches >= 4) {
      archetype = 'Analytical Hesitator';
      stress = 68;
    } else {
      archetype = 'Methodical Verifier';
      stress = 50;
    }

    setFinalArchetype(archetype);
    setFinalScore(scorePct);
    setFinalStress(stress);
    setIsCompleted(true);

    updateProfile({
      assessmentCompleted: true,
      assessmentScorePercent: scorePct,
      cognitiveStressBaseline: stress,
      behavioralArchetype: archetype,
      averageDwellTimeSec: avgLatency,
      distractorEliminationRate: Math.min(1, Math.round((totalEliminations / (total * 3)) * 100) / 100),
      optionSwitchCountAvg: Math.round((totalSwitches / total) * 10) / 10,
      hesitationNotes: `Calibrated via 10-Question Diagnostic Engine. Average question dwell time: ${avgLatency}s. Option oscillation: ${totalSwitches} switches. Distractor strikes: ${totalEliminations}.`
    });

    confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
  };

  if (isCompleted) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in">
        <div className="p-8 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 border border-slate-800 shadow-2xl text-center space-y-4">
          <div className="w-20 h-20 rounded-full mx-auto bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center">
            <BrainCircuit className="w-10 h-10 animate-pulse" />
          </div>

          <div>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              Cognitive Profile Calibrated
            </span>
            <h1 className="text-3xl font-extrabold text-white mt-2">
              Archetype: "{finalArchetype}"
            </h1>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              Your telemetry baseline has been pushed to the central cloud repository and mirrored to your CertMaster Android client.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-800 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block">Baseline Readiness</span>
              <strong className="text-2xl font-black text-emerald-400">{finalScore}%</strong>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block">Stress Index</span>
              <strong className="text-2xl font-black text-amber-400">{finalStress}/100</strong>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block">Distractors Eliminated</span>
              <strong className="text-2xl font-black text-blue-400">{totalEliminations}</strong>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            {onComplete && (
              <button
                onClick={onComplete}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Proceed to Stage 2: Weak Domain Remediation</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => {
                setIsCompleted(false);
                setCurrentIdx(0);
                setSelectedAnswers({});
                setEliminatedOptions({});
              }}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Recalibrate (Retake)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4 animate-in fade-in">
      {/* Top Breadcrumb & Return to Journey */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        {onComplete && (
          <button
            onClick={onComplete}
            className="flex items-center space-x-1 text-slate-400 hover:text-white transition-colors cursor-pointer group"
          >
            <span className="text-blue-400 font-bold group-hover:-translate-x-0.5 transition-transform">←</span>
            <span className="font-semibold">Back to Learning Journey</span>
          </button>
        )}
        <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-mono">
          <span>Stage 1 of 5</span>
          <span>•</span>
          <span className="text-cyan-400 font-bold">10 Calibration Questions</span>
        </div>
      </div>

      {/* Onboarding Header */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BrainCircuit className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">
              Behavioral Knowledge Calibration (10 Questions)
            </h2>
          </div>
          <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-lg">
            Q {currentIdx + 1} of {total}
          </span>
        </div>
        <p className="text-xs text-slate-300">
          Answers and interactions (dwell time, distractor strikeout, hesitation switches) are fed into the behavioral classification engine to tune adaptive drills.
        </p>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-3">
          <div
            className="h-full bg-cyan-500 rounded-full transition-all duration-300"
            style={{ width: `${((currentIdx + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
        <div className="flex items-center justify-between text-xs">
          <span className="px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20">
            {currentQ.domainName}
          </span>
          <span className="text-slate-400 font-mono text-[11px]">
            Difficulty: {currentQ.difficulty}
          </span>
        </div>

        <p className="text-base sm:text-lg font-bold text-white leading-relaxed">
          {currentQ.questionText}
        </p>

        {/* Options */}
        <div className="space-y-2.5">
          {currentQ.options.map((opt, optIdx) => {
            const isChosen = selectedAnswers[currentIdx] === optIdx;
            const isElim = (eliminatedOptions[currentIdx] || []).includes(optIdx);

            return (
              <div
                key={optIdx}
                onClick={() => !isElim && handleSelectOption(optIdx)}
                className={`p-4 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-center justify-between cursor-pointer group ${
                  isChosen
                    ? 'border-cyan-500 bg-cyan-500/15 text-white ring-1 ring-cyan-500/40'
                    : isElim
                    ? 'border-slate-800/40 bg-slate-950/40 text-slate-600 line-through'
                    : 'border-slate-800 bg-slate-950/70 text-slate-300 hover:border-slate-700 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center space-x-3 flex-1">
                  <div
                    className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                      isChosen
                        ? 'bg-cyan-500 text-slate-950'
                        : isElim
                        ? 'bg-slate-800/40 text-slate-600'
                        : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'
                    }`}
                  >
                    {String.fromCharCode(65 + optIdx)}
                  </div>
                  <span>{opt}</span>
                </div>

                <button
                  onClick={e => handleEliminate(optIdx, e)}
                  title="Strike out distractor"
                  className={`ml-2 px-2 py-1 rounded text-[11px] font-mono font-bold transition-all ${
                    isElim
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  ̶S̶
                </button>
              </div>
            );
          })}
        </div>

        {/* Navigation */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
          <button
            onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
            disabled={currentIdx === 0}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold disabled:opacity-40 transition-colors"
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            disabled={selectedAnswers[currentIdx] === undefined}
            className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold disabled:opacity-40 shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>{currentIdx === total - 1 ? 'Analyze & Calibrate Profile' : 'Next Question'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
