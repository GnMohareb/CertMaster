import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { CISSP_EXAM_QUESTIONS } from '../data/cisspBank';
import { Question, SimulationResult } from '../types';
import { ApiSyncService } from '../services/apiSyncService';
import {
  Clock,
  Flag,
  CheckCircle2,
  AlertCircle,
  Pause,
  Play,
  RotateCcw,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Grid,
  Send,
  X,
  Shield,
  Smartphone,
  Eye,
  Check,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SimulatorScreenProps {
  onFinish?: () => void;
}

export const SimulatorScreen: React.FC<SimulatorScreenProps> = ({ onFinish }) => {
  const { activeExam, userProfile, updateProfile, openCertModal } = useAuth();

  const questions: Question[] = CISSP_EXAM_QUESTIONS;
  const totalQuestions = questions.length;

  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [eliminatedOptions, setEliminatedOptions] = useState<Record<number, number[]>>({}); // qIdx -> [optionIndices]
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<number, boolean>>({});
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [showMatrixDrawer, setShowMatrixDrawer] = useState<boolean>(false);
  const [matrixFilter, setMatrixFilter] = useState<'ALL' | 'ANSWERED' | 'UNANSWERED' | 'FLAGGED'>('ALL');
  const [showCitation, setShowCitation] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [showConfirmSubmitModal, setShowConfirmSubmitModal] = useState<boolean>(false);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);

  // Countdown Timer: 180 minutes or 30 minutes for sample
  const INITIAL_SECONDS = 30 * 60; // 30 mins
  const [secondsRemaining, setSecondsRemaining] = useState<number>(INITIAL_SECONDS);

  // Behavioral Telemetry tracking: dwell time and hesitation
  const questionStartTimeRef = useRef<number>(Date.now());
  const [questionLatencies, setQuestionLatencies] = useState<Record<number, number>>({});
  const [optionSwitchCounts, setOptionSwitchCounts] = useState<Record<number, number>>({});

  // Countdown timer effect
  useEffect(() => {
    if (isPaused || isSubmitted) return;

    const timer = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, isSubmitted]);

  // Track question switch latency
  useEffect(() => {
    questionStartTimeRef.current = Date.now();
    setShowCitation(false);
  }, [currentIdx]);

  // Keyboard shortcut listener: Keys 1-4 and A-D for options, F for Flag, Arrow keys for prev/next
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSubmitted || isPaused) return;

      // Ignore if typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      const key = e.key.toUpperCase();
      let optIdx: number | null = null;

      if (key === '1' || key === 'A') optIdx = 0;
      else if (key === '2' || key === 'B') optIdx = 1;
      else if (key === '3' || key === 'C') optIdx = 2;
      else if (key === '4' || key === 'D') optIdx = 3;

      if (optIdx !== null && optIdx < currentQuestion.options.length) {
        handleSelectOption(optIdx);
      } else if (key === 'F') {
        toggleFlagCurrent();
      } else if (key === 'ARROWLEFT' && currentIdx > 0) {
        handlePrev();
      } else if (key === 'ARROWRIGHT' && currentIdx < totalQuestions - 1) {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIdx, selectedAnswers, isSubmitted, isPaused]);

  const currentQuestion = questions[currentIdx] || questions[0];

  const handleSelectOption = (optIdx: number) => {
    // If previously eliminated, don't allow or un-eliminate
    const currentElims = eliminatedOptions[currentIdx] || [];
    if (currentElims.includes(optIdx)) {
      toggleEliminateOption(optIdx);
    }

    // Measure dwell and switches
    const elapsed = Math.round((Date.now() - questionStartTimeRef.current) / 1000);
    setQuestionLatencies(prev => ({
      ...prev,
      [currentIdx]: (prev[currentIdx] || 0) + elapsed
    }));

    if (selectedAnswers[currentIdx] !== undefined && selectedAnswers[currentIdx] !== optIdx) {
      setOptionSwitchCounts(prev => ({
        ...prev,
        [currentIdx]: (prev[currentIdx] || 0) + 1
      }));
    }

    setSelectedAnswers(prev => ({ ...prev, [currentIdx]: optIdx }));
  };

  const toggleEliminateOption = (optIdx: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEliminatedOptions(prev => {
      const list = prev[currentIdx] || [];
      const updated = list.includes(optIdx)
        ? list.filter(i => i !== optIdx)
        : [...list, optIdx];

      // If eliminated currently selected answer, unselect it
      if (selectedAnswers[currentIdx] === optIdx) {
        setSelectedAnswers(old => {
          const clone = { ...old };
          delete clone[currentIdx];
          return clone;
        });
      }

      return { ...prev, [currentIdx]: updated };
    });
  };

  const toggleFlagCurrent = () => {
    setFlaggedQuestions(prev => ({
      ...prev,
      [currentIdx]: !prev[currentIdx]
    }));
  };

  const handlePrev = () => {
    if (currentIdx > 0) setCurrentIdx(currentIdx - 1);
  };

  const handleNext = () => {
    if (currentIdx < totalQuestions - 1) setCurrentIdx(currentIdx + 1);
  };

  const handleSubmitExam = async () => {
    let correct = 0;
    const domainScores: Record<string, { total: number; correct: number; percent: number }> = {};

    questions.forEach((q, idx) => {
      const isCorrect = selectedAnswers[idx] === q.correctIndex;
      if (isCorrect) correct++;

      if (!domainScores[q.domainId]) {
        domainScores[q.domainId] = { total: 0, correct: 0, percent: 0 };
      }
      domainScores[q.domainId].total++;
      if (isCorrect) domainScores[q.domainId].correct++;
    });

    Object.keys(domainScores).forEach(d => {
      domainScores[d].percent = Math.round(
        (domainScores[d].correct / domainScores[d].total) * 100
      );
    });

    const scorePercent = Math.round((correct / totalQuestions) * 100);
    const passed = scorePercent >= activeExam.passingScorePercent;
    const timeSpent = INITIAL_SECONDS - secondsRemaining;

    // Calculate total eliminations and switches
    const totalElims = Object.values(eliminatedOptions).reduce(
      (sum, list) => sum + list.length,
      0
    );
    const totalSwitches = Object.values(optionSwitchCounts).reduce(
      (sum, count) => sum + count,
      0
    );

    const stressScore = Math.min(100, Math.max(30, 50 + totalSwitches * 5 - (passed ? 15 : 0)));

    const result: SimulationResult = {
      sessionId: 'sess_' + Date.now(),
      examId: activeExam.id,
      examTitle: activeExam.title,
      timestamp: Date.now(),
      totalQuestions,
      correctCount: correct,
      scorePercent,
      passed,
      timeSpentSeconds: timeSpent,
      domainScores,
      behavioralStressScore: stressScore,
      eliminatedDistractorsCount: totalElims,
      averageLatencySeconds: Math.round(timeSpent / totalQuestions)
    };

    setSimulationResult(result);
    setIsSubmitted(true);
    await ApiSyncService.recordSimulationTelemetry(result);

    // Update readiness baseline if improved
    if (scorePercent > userProfile.assessmentScorePercent) {
      updateProfile({
        assessmentScorePercent: scorePercent,
        cognitiveStressBaseline: stressScore
      });
    }

    if (passed) {
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
    }
  };

  // Timer formatted
  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const flaggedCount = Object.values(flaggedQuestions).filter(Boolean).length;
  const unansweredCount = totalQuestions - answeredCount;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  // Urgency indicator (<10m amber, <5m red)
  const isRedUrgency = secondsRemaining < 300;
  const isAmberUrgency = secondsRemaining < 600 && !isRedUrgency;

  // Filtered matrix questions
  const filteredMatrixIndices = questions
    .map((_, idx) => idx)
    .filter(idx => {
      if (matrixFilter === 'ANSWERED') return selectedAnswers[idx] !== undefined;
      if (matrixFilter === 'UNANSWERED') return selectedAnswers[idx] === undefined;
      if (matrixFilter === 'FLAGGED') return !!flaggedQuestions[idx];
      return true;
    });

  if (isSubmitted && simulationResult) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
        {/* Results Hero Card */}
        <div className="p-8 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 border border-slate-800 shadow-2xl text-center space-y-4">
          <div
            className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center ${
              simulationResult.passed
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
            }`}
          >
            {simulationResult.passed ? (
              <Award className="w-10 h-10 animate-bounce" />
            ) : (
              <AlertCircle className="w-10 h-10" />
            )}
          </div>

          <div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                simulationResult.passed
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-rose-500/20 text-rose-400'
              }`}
            >
              {simulationResult.passed ? 'PROVISIONAL PASS' : 'NEEDS ADDITIONAL REINFORCEMENT'}
            </span>
            <h1 className="text-3xl font-black text-white mt-2">
              {simulationResult.scorePercent}%
            </h1>
            <p className="text-xs text-slate-300">
              Required Passing Score: {activeExam.passingScorePercent}% • Scored{' '}
              {simulationResult.correctCount} of {simulationResult.totalQuestions} questions correctly.
            </p>
          </div>

          {/* Metrics Trio */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-800 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-slate-400 block">Total Elapsed Time</span>
              <strong className="text-white text-sm">
                {Math.floor(simulationResult.timeSpentSeconds / 60)}m {simulationResult.timeSpentSeconds % 60}s
              </strong>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-slate-400 block">Average Latency</span>
              <strong className="text-blue-400 text-sm">
                {simulationResult.averageLatencySeconds}s / question
              </strong>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-slate-400 block">Distractors Struck</span>
              <strong className="text-emerald-400 text-sm">
                {simulationResult.eliminatedDistractorsCount} eliminated
              </strong>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            {onFinish && (
              <button
                onClick={onFinish}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Continue in Learning Journey</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => openCertModal()}
              className="px-5 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs border border-amber-500/40 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>View Readiness Certificate</span>
            </button>

            <button
              onClick={() => {
                setIsSubmitted(false);
                setSelectedAnswers({});
                setEliminatedOptions({});
                setFlaggedQuestions({});
                setSecondsRemaining(INITIAL_SECONDS);
                setCurrentIdx(0);
              }}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake Simulation</span>
            </button>
          </div>
        </div>

        {/* Detailed Question Review List */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-400" />
            Comprehensive Question Analysis & Citations
          </h3>

          <div className="space-y-4">
            {questions.map((q, idx) => {
              const userAns = selectedAnswers[idx];
              const isCorrect = userAns === q.correctIndex;

              return (
                <div
                  key={q.id}
                  className={`p-4 rounded-xl border text-xs space-y-2 ${
                    isCorrect
                      ? 'border-emerald-500/30 bg-emerald-500/5'
                      : 'border-rose-500/30 bg-rose-500/5'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-300">
                      Question #{idx + 1} • {q.domainName}
                    </span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                        isCorrect
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {isCorrect ? 'CORRECT' : 'INCORRECT'}
                    </span>
                  </div>

                  <p className="font-semibold text-slate-100 text-sm leading-relaxed">
                    {q.questionText}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                    {q.options.map((opt, optIdx) => {
                      const isChosen = userAns === optIdx;
                      const isRealCorrect = q.correctIndex === optIdx;

                      let badgeStyle = 'border-slate-800 bg-slate-950/60 text-slate-400';
                      if (isRealCorrect) {
                        badgeStyle = 'border-emerald-500 bg-emerald-500/15 text-emerald-300 font-bold';
                      } else if (isChosen && !isRealCorrect) {
                        badgeStyle = 'border-rose-500 bg-rose-500/15 text-rose-300 line-through';
                      }

                      return (
                        <div
                          key={optIdx}
                          className={`p-2.5 rounded-lg border text-xs flex items-center space-x-2 ${badgeStyle}`}
                        >
                          <span className="w-5 h-5 rounded bg-slate-800 text-[10px] flex items-center justify-center shrink-0">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="leading-snug">{opt}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 mt-2 text-[11px] space-y-1">
                    <p className="text-slate-300">
                      <strong className="text-blue-400">Explanation: </strong>
                      {q.explanation}
                    </p>
                    <p className="text-slate-400 italic font-mono text-[10px]">
                      Citation: {q.citation.title} ({q.citation.sectionOrPage})
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in">
      {/* Top Breadcrumb & Return to Journey Affordance */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        {onFinish && (
          <button
            onClick={onFinish}
            className="flex items-center space-x-1 text-slate-400 hover:text-white transition-colors cursor-pointer group"
          >
            <ChevronLeft className="w-4 h-4 text-blue-400 group-hover:-translate-x-0.5 transition-transform" />
            <span className="font-semibold">Return to Learning Journey</span>
          </button>
        )}
        <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-mono">
          <span>Stage 3 of 5</span>
          <span>•</span>
          <span className="text-emerald-400 font-bold">Passing Benchmark: {activeExam.passingScorePercent}%</span>
        </div>
      </div>

      {/* Top Simulation Engine Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md flex flex-wrap items-center justify-between gap-4">
        {/* Left: Active Exam & Progress Counter Badges */}
        <div className="flex items-center space-x-3">
          <div
            className="w-3 h-3 rounded-full shrink-0"
            style={{ backgroundColor: activeExam.primaryColorHex }}
          />
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-sm text-white">{activeExam.shortCode}</span>
              <span className="text-xs text-slate-400 font-medium">Simulation Mode</span>
            </div>
            <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
              <span className="text-emerald-400 font-semibold">{answeredCount} Answered</span>
              <span>•</span>
              <span className="text-amber-400 font-semibold">{flaggedCount} Flagged</span>
              <span>•</span>
              <span>{unansweredCount} Left</span>
            </div>
          </div>
        </div>

        {/* Center: Countdown Timer with visual urgency alerts */}
        <div
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl border text-sm font-mono font-bold transition-all ${
            isRedUrgency
              ? 'bg-rose-500/20 text-rose-400 border-rose-500/50 animate-urgency'
              : isAmberUrgency
              ? 'bg-amber-500/20 text-amber-400 border-amber-500/50'
              : 'bg-slate-950 text-slate-200 border-slate-800'
          }`}
        >
          <Clock className="w-4 h-4 text-slate-400" />
          <span>{formatTimer(secondsRemaining)}</span>
          {isRedUrgency && (
            <span className="text-[10px] font-sans uppercase tracking-wider text-rose-400">
              URGENCY
            </span>
          )}
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center space-x-2">
          {/* Pause / Resume */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title={isPaused ? 'Resume exam' : 'Pause exam'}
          >
            {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4" />}
          </button>

          {/* Question Matrix Drawer Trigger */}
          <button
            onClick={() => setShowMatrixDrawer(true)}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold border border-slate-700 transition-all cursor-pointer"
          >
            <Grid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Review Matrix</span>
          </button>

          {/* Submit Exam Button */}
          <button
            onClick={() => setShowConfirmSubmitModal(true)}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/25 transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Finish & Score</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Quick-Jump Sticky Question Ribbon */}
      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center space-x-2 overflow-x-auto select-none">
        <span className="text-[11px] font-bold text-slate-400 shrink-0 uppercase tracking-wider pl-1">
          Q Ribbon:
        </span>
        <div className="flex items-center space-x-1.5">
          {questions.map((_, idx) => {
            const isCurrent = currentIdx === idx;
            const isAnswered = selectedAnswers[idx] !== undefined;
            const isFlagged = flaggedQuestions[idx];

            let ribbonClass = 'bg-slate-800 text-slate-400 hover:bg-slate-700';
            if (isCurrent) {
              ribbonClass = 'bg-blue-600 text-white font-bold ring-2 ring-blue-400/50 scale-105';
            } else if (isFlagged) {
              ribbonClass = 'bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold';
            } else if (isAnswered) {
              ribbonClass = 'bg-emerald-500/20 text-emerald-400 font-semibold';
            }

            return (
              <button
                key={idx}
                onClick={() => setCurrentIdx(idx)}
                className={`w-7 h-7 rounded-lg text-xs flex items-center justify-center transition-all shrink-0 cursor-pointer ${ribbonClass}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Question Card */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-5 relative">
        {isPaused && (
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-sm z-30 rounded-2xl flex flex-col items-center justify-center space-y-4">
            <Pause className="w-12 h-12 text-amber-400 animate-pulse" />
            <h3 className="text-lg font-bold text-white">Exam Simulation Paused</h3>
            <p className="text-xs text-slate-400 max-w-xs text-center">
              Timer has been halted. Click resume when you are ready to continue your timed session.
            </p>
            <button
              onClick={() => setIsPaused(false)}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4" />
              <span>Resume Session</span>
            </button>
          </div>
        )}

        {/* Question Header & Tags */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold">
              Domain: {currentQuestion.domainName}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 uppercase">
              {currentQuestion.difficulty}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {/* Toggle Flag */}
            <button
              onClick={toggleFlagCurrent}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                flaggedQuestions[currentIdx]
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              <Flag className="w-3.5 h-3.5" />
              <span>{flaggedQuestions[currentIdx] ? 'Flagged' : 'Flag (F)'}</span>
            </button>

            {/* NotebookLM Citation trigger */}
            <button
              onClick={() => setShowCitation(!showCitation)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-cyan-400 text-xs font-semibold border border-slate-700 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{showCitation ? 'Hide Citation' : 'Source Citation'}</span>
            </button>
          </div>
        </div>

        {/* Question Text */}
        <div className="space-y-1">
          <span className="text-xs font-bold text-slate-400 font-mono">
            QUESTION {currentIdx + 1} OF {totalQuestions}
          </span>
          <p className="text-base sm:text-lg font-bold text-white leading-relaxed">
            {currentQuestion.questionText}
          </p>
        </div>

        {/* Options List with Strikethrough Distractor Elimination */}
        <div className="space-y-2.5 pt-2">
          {currentQuestion.options.map((opt, optIdx) => {
            const isSelected = selectedAnswers[currentIdx] === optIdx;
            const isEliminated = (eliminatedOptions[currentIdx] || []).includes(optIdx);

            return (
              <div
                key={optIdx}
                onClick={() => !isEliminated && handleSelectOption(optIdx)}
                className={`p-4 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-center justify-between cursor-pointer group ${
                  isSelected
                    ? 'border-blue-500 bg-blue-600/15 text-white shadow-sm ring-1 ring-blue-500/30'
                    : isEliminated
                    ? 'border-slate-800/50 bg-slate-950/40 text-slate-600 line-through'
                    : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center space-x-3 flex-1">
                  {/* Option letter pill (A, B, C, D) */}
                  <div
                    className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : isEliminated
                        ? 'bg-slate-800/50 text-slate-600'
                        : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-200'
                    }`}
                  >
                    {String.fromCharCode(65 + optIdx)}
                  </div>
                  <span className="leading-snug">{opt}</span>
                </div>

                {/* Strikethrough Distractor Elimination Tool: tap the ̶S̶ button */}
                <button
                  onClick={e => toggleEliminateOption(optIdx, e)}
                  title={isEliminated ? 'Restore option' : 'Eliminate distractor (Strikethrough)'}
                  className={`ml-3 px-2 py-1 rounded-md text-[11px] font-mono font-bold transition-all ${
                    isEliminated
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  ̶S̶
                </button>
              </div>
            );
          })}
        </div>

        {/* Authoritative Source Citation Card (NotebookLM grounding) */}
        {showCitation && (
          <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/30 text-xs space-y-1.5 animate-in fade-in">
            <div className="flex items-center justify-between text-cyan-400 font-bold">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                NotebookLM Authoritative Source Citation
              </span>
              <span className="text-[10px] font-mono uppercase bg-cyan-500/10 px-2 py-0.5 rounded">
                {currentQuestion.citation.standardOrFramework}
              </span>
            </div>
            <p className="text-slate-200 font-semibold">{currentQuestion.citation.title}</p>
            <p className="text-slate-400 text-[11px]">
              Location Reference: {currentQuestion.citation.sectionOrPage}
            </p>
          </div>
        )}

        {/* Prominent Bottom Action Bar: Mark, Matrix, Previous, Next, Submit */}
        <div className="pt-4 border-t border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Left Actions: Mark for Review & Question Matrix */}
          <div className="flex items-center flex-wrap gap-2.5">
            <button
              onClick={toggleFlagCurrent}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                flaggedQuestions[currentIdx]
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/25'
                  : 'bg-slate-800/90 hover:bg-slate-800 text-amber-400 border-amber-500/30'
              }`}
            >
              <Flag className={`w-4 h-4 ${flaggedQuestions[currentIdx] ? 'fill-slate-950' : ''}`} />
              <span>{flaggedQuestions[currentIdx] ? 'Marked for Review ✓' : 'Mark for Review (F)'}</span>
            </button>

            <button
              onClick={() => setShowMatrixDrawer(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
            >
              <Grid className="w-4 h-4 text-blue-400" />
              <span>Review Grid ({answeredCount}/{totalQuestions})</span>
              {flaggedCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px]">
                  {flaggedCount}⚑
                </span>
              )}
            </button>
          </div>

          {/* Right Actions: Previous, Next & Submit Exam */}
          <div className="flex items-center flex-wrap gap-2.5 justify-end">
            <button
              onClick={handlePrev}
              disabled={currentIdx === 0}
              className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs disabled:opacity-40 transition-colors cursor-pointer border border-slate-700/60"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              onClick={handleNext}
              disabled={currentIdx === totalQuestions - 1}
              className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs disabled:opacity-40 transition-colors cursor-pointer shadow-md shadow-blue-600/20"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Always Visible Submit Exam Button */}
            <button
              onClick={() => setShowConfirmSubmitModal(true)}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 transition-all cursor-pointer ring-1 ring-emerald-400/40 hover:scale-[1.02]"
            >
              <Check className="w-4 h-4" />
              <span>Submit Exam</span>
            </button>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Dialog Modal */}
      {showConfirmSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-5">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Ready to Submit Examination?</h3>
                <p className="text-xs text-slate-400">Final evaluation and scoring summary</p>
              </div>
            </div>

            {/* Summary Statistics */}
            <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Answered</span>
                <strong className="text-emerald-400 text-base">{answeredCount}</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Unanswered</span>
                <strong className={`text-base ${unansweredCount > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                  {unansweredCount}
                </strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Flagged</span>
                <strong className="text-amber-300 text-base">{flaggedCount}</strong>
              </div>
            </div>

            {unansweredCount > 0 && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>
                  You have <strong>{unansweredCount} unanswered questions</strong>. You can review them before submitting.
                </span>
              </div>
            )}

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => {
                  setShowConfirmSubmitModal(false);
                  setShowMatrixDrawer(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
              >
                Review Unanswered / Flagged
              </button>
              <button
                onClick={() => {
                  setShowConfirmSubmitModal(false);
                  handleSubmitExam();
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
              >
                Confirm & Grade Exam
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Question Matrix & Review Drawer Modal */}
      {showMatrixDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Grid className="w-4 h-4 text-blue-400" />
                Exam Review Matrix Grid ({totalQuestions} Questions)
              </h3>
              <button
                onClick={() => setShowMatrixDrawer(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 border-b border-slate-800 flex items-center space-x-1.5 text-xs">
              {(['ALL', 'ANSWERED', 'UNANSWERED', 'FLAGGED'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setMatrixFilter(f)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                    matrixFilter === f
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="p-5 overflow-y-auto">
              <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
                {filteredMatrixIndices.map(idx => {
                  const isCur = currentIdx === idx;
                  const isAns = selectedAnswers[idx] !== undefined;
                  const isFlg = flaggedQuestions[idx];

                  let btnStyle = 'bg-slate-800 text-slate-300 hover:bg-slate-750';
                  if (isCur) {
                    btnStyle = 'bg-blue-600 text-white ring-2 ring-blue-400';
                  } else if (isFlg) {
                    btnStyle = 'bg-amber-500/20 text-amber-400 border border-amber-500/50';
                  } else if (isAns) {
                    btnStyle = 'bg-emerald-500/20 text-emerald-400';
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setCurrentIdx(idx);
                        setShowMatrixDrawer(false);
                      }}
                      className={`h-12 rounded-xl text-xs font-bold flex flex-col items-center justify-center transition-all cursor-pointer ${btnStyle}`}
                    >
                      <span>Q{idx + 1}</span>
                      <span className="text-[9px] font-mono opacity-70">
                        {isFlg ? 'FLAG' : isAns ? 'ANS' : 'EMPTY'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs">
              <span className="text-slate-400">
                {answeredCount} of {totalQuestions} completed
              </span>
              <button
                onClick={() => {
                  setShowMatrixDrawer(false);
                  handleSubmitExam();
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all cursor-pointer"
              >
                Submit Exam Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
