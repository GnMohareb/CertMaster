import React, { useState, useEffect } from 'react';
import { useCertMaster } from '../../context/CertMasterContext';
import { CISSP_EXAM_QUESTIONS } from '../../data/cisspQuestions';
import {
  Clock,
  Pause,
  Play,
  Flag,
  RotateCcw,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Grid,
  X,
  FileCheck,
  ChevronRight,
  Shield,
} from 'lucide-react';

export const ExamSimulator: React.FC = () => {
  const {
    activeExam,
    startExamSession,
    pauseExamSession,
    resumeExamSession,
    jumpToQuestion,
    selectOption,
    toggleEliminateOption,
    toggleFlagQuestion,
    submitExamSession,
    cancelExamSession,
    setActiveTab,
  } = useCertMaster();

  const [isMatrixOpen, setIsMatrixOpen] = useState(false);
  const [matrixFilter, setMatrixFilter] = useState<'ALL' | 'ANSWERED' | 'REMAINING' | 'FLAGGED'>('ALL');
  const [strikethroughMode, setStrikethroughMode] = useState(false);
  const [showCitation, setShowCitation] = useState(false);

  // Countdown timer effect
  useEffect(() => {
    if (!activeExam || !activeExam.isRunning || activeExam.isPaused || activeExam.isCompleted) return;

    const timer = setInterval(() => {
      // Direct update on session remaining seconds through jump or state
      if (activeExam.timeRemainingSeconds <= 1) {
        submitExamSession();
        clearInterval(timer);
      } else {
        // decrement
        activeExam.timeRemainingSeconds -= 1;
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [activeExam]);

  // Keyboard shortcut listener
  useEffect(() => {
    if (!activeExam || activeExam.isPaused || activeExam.isCompleted) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      const q = activeExam.questions[activeExam.currentIndex];
      if (!q) return;

      if (e.key >= '1' && e.key <= '4') {
        const idx = parseInt(e.key) - 1;
        if (q.options[idx]) {
          if (strikethroughMode) {
            toggleEliminateOption(q.id, q.options[idx].id);
          } else {
            selectOption(q.id, q.options[idx].id);
          }
        }
      } else if (['a', 'b', 'c', 'd', 'A', 'B', 'C', 'D'].includes(e.key)) {
        const letter = e.key.toUpperCase();
        const opt = q.options.find((o) => o.letter === letter);
        if (opt) {
          if (strikethroughMode) {
            toggleEliminateOption(q.id, opt.id);
          } else {
            selectOption(q.id, opt.id);
          }
        }
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFlagQuestion(q.id);
      } else if (e.key === 's' || e.key === 'S') {
        setStrikethroughMode((prev) => !prev);
      } else if (e.key === 'm' || e.key === 'M') {
        setIsMatrixOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeExam, strikethroughMode]);

  // If no exam session active, show start CISSP Simulator card
  if (!activeExam || activeExam.examId === 'assessment') {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900 shadow-sm transition-colors">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
                <span>Enterprise Simulation Engine</span>
                <span>·</span>
                <span>Component-Identical to Android App</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                CISSP Full Mock Exam Simulation
              </h1>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
                Experience full enterprise examination conditions. Features timed countdown with visual urgency alerts, distractor elimination strikethroughs, question matrix jump drawer, and authoritative NotebookLM citations for all 8 CBK domains.
              </p>
            </div>

            <button
              onClick={() => startExamSession('cissp', CISSP_EXAM_QUESTIONS, 180)}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-sm shrink-0"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>Launch CISSP Simulation (180m)</span>
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/40">
              <span className="text-slate-400 block text-[10px]">PASS THRESHOLD</span>
              <span className="text-base font-bold text-slate-900 dark:text-white">700 / 1000 (70%)</span>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/40">
              <span className="text-slate-400 block text-[10px]">TIME LIMIT</span>
              <span className="text-base font-bold text-slate-900 dark:text-white">180 Minutes</span>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/40">
              <span className="text-slate-400 block text-[10px]">DOMAINS COVERED</span>
              <span className="text-base font-bold text-slate-900 dark:text-white">8 CBK Domains</span>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/40">
              <span className="text-slate-400 block text-[10px]">CROSS-PLATFORM</span>
              <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">Synced to Android</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Exam Result View ---
  if (activeExam.isCompleted) {
    const scorePct = activeExam.resultScorePercent ?? 0;
    const isPass = scorePct >= 70;

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900 shadow-sm text-center">
          <div
            className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl mb-4 ${
              isPass
                ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
                : 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400'
            }`}
          >
            {isPass ? <CheckCircle className="h-8 w-8" /> : <AlertCircle className="h-8 w-8" />}
          </div>

          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {activeExam.examTitle}
          </div>
          <h2 className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">
            Simulation Completed: {isPass ? 'PASS (Proficient)' : 'NEEDS REVIEW (Below 70%)'}
          </h2>
          <div className="mt-3 text-4xl font-extrabold font-mono text-blue-600 dark:text-blue-400 tabular-nums">
            {scorePct}%
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Your results have been synchronized across cloud storage to your CertMaster Android companion app profile.
          </p>

          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              onClick={() => startExamSession(activeExam.examId, activeExam.questions, activeExam.durationMinutes)}
              className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Retake Simulation</span>
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-sm"
            >
              <span>View Performance Curves</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Active Exam Running View ---
  const currentQ = activeExam.questions[activeExam.currentIndex];
  const isFlagged = activeExam.flaggedQuestionIds.has(currentQ.id);
  const selectedOpt = activeExam.answers[currentQ.id];
  const eliminatedOpts = activeExam.eliminations[currentQ.id] || [];

  const answeredCount = Object.keys(activeExam.answers).length;
  const flaggedCount = activeExam.flaggedQuestionIds.size;
  const totalCount = activeExam.questions.length;
  const unansweredCount = totalCount - answeredCount;
  const progressPercent = Math.round((answeredCount / totalCount) * 100);

  // Time formatting
  const mins = Math.floor(activeExam.timeRemainingSeconds / 60);
  const secs = activeExam.timeRemainingSeconds % 60;
  const timeFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  // Urgency styling: <10m amber, <5m crimson
  const isUnder10Min = mins < 10;
  const isUnder5Min = mins < 5;

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Top Simulator Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-sm transition-colors">
        
        {/* Left: Exam title & Progress counters */}
        <div>
          <div className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-sm">
            {activeExam.examTitle}
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
            <span className="font-semibold text-blue-600 dark:text-blue-400 font-mono">
              Q{activeExam.currentIndex + 1} of {totalCount}
            </span>
            <span>·</span>
            <span>{answeredCount} Answered</span>
            <span>·</span>
            <span className={flaggedCount > 0 ? 'text-amber-500 font-medium' : ''}>
              {flaggedCount} Flagged
            </span>
            <span>·</span>
            <span>{unansweredCount} Left</span>
          </div>
        </div>

        {/* Right: Urgency Timer, Pause, and Matrix Button */}
        <div className="flex items-center gap-3">
          {/* Urgency Countdown Badge */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono font-bold text-xs tabular-nums border transition-colors ${
              isUnder5Min
                ? 'bg-rose-500/10 border-rose-500 text-rose-600 dark:text-rose-400 animate-pulse'
                : isUnder10Min
                ? 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400'
                : 'bg-slate-100 border-slate-200 text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200'
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>{timeFormatted}</span>
            {isUnder5Min && <span className="text-[10px] font-bold uppercase ml-1">Urgent</span>}
          </div>

          {/* Pause / Resume */}
          <button
            onClick={activeExam.isPaused ? resumeExamSession : pauseExamSession}
            title={activeExam.isPaused ? 'Resume exam' : 'Pause exam'}
            className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
          >
            {activeExam.isPaused ? <Play className="h-3.5 w-3.5 fill-current" /> : <Pause className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{activeExam.isPaused ? 'Resume' : 'Pause'}</span>
          </button>

          {/* Question Matrix Drawer Trigger */}
          <button
            onClick={() => setIsMatrixOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Grid className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Matrix (M)</span>
          </button>
        </div>
      </div>

      {/* Sticky Quick-Jump Question Ribbon */}
      <div className="sticky top-16 z-30 flex items-center gap-1.5 overflow-x-auto p-2.5 bg-white/95 backdrop-blur-md rounded-xl border border-slate-200 dark:bg-slate-900/95 dark:border-slate-800 shadow-sm scrollbar-thin">
        {activeExam.questions.map((q, idx) => {
          const isCur = idx === activeExam.currentIndex;
          const isAns = !!activeExam.answers[q.id];
          const isFlg = activeExam.flaggedQuestionIds.has(q.id);

          return (
            <button
              key={q.id}
              onClick={() => jumpToQuestion(idx)}
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-mono font-bold transition-all ${
                isCur
                  ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                  : isFlg
                  ? 'bg-amber-100 text-amber-700 border border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                  : isAns
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
              }`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Main Question Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900 shadow-sm transition-colors">
        {/* Domain & Difficulty Tags */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Domain {currentQ.domainNumber}: {currentQ.domain}
            </span>
            <span>·</span>
            <span>{currentQ.difficulty}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Strikethrough Distractor Elimination */}
            <button
              onClick={() => setStrikethroughMode((prev) => !prev)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold border transition-colors ${
                strikethroughMode
                  ? 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300'
              }`}
            >
              <span className="line-through font-mono font-bold">S</span>
              <span className="hidden sm:inline">Strikethrough Tool</span>
            </button>

            {/* Flag Button */}
            <button
              onClick={() => toggleFlagQuestion(currentQ.id)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold border transition-colors ${
                isFlagged
                  ? 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300'
              }`}
            >
              <Flag className={`h-3 w-3 ${isFlagged ? 'fill-current text-amber-500' : ''}`} />
              <span className="hidden sm:inline">{isFlagged ? 'Flagged' : 'Flag'}</span>
            </button>
          </div>
        </div>

        {/* Scenario Box (if present) */}
        {currentQ.scenario && (
          <div className="mb-4 rounded-lg bg-slate-50 p-4 text-xs sm:text-sm text-slate-700 dark:bg-slate-950/60 dark:text-slate-300 leading-relaxed border border-slate-200/60 dark:border-slate-800/60">
            {currentQ.scenario}
          </div>
        )}

        {/* Prompt */}
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
          {currentQ.prompt}
        </h2>

        {/* Strikethrough mode indicator */}
        {strikethroughMode && (
          <div className="mt-3 text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/60">
            Click any answer option to eliminate it with a visual strikethrough. Press S to exit tool.
          </div>
        )}

        {/* Options */}
        <div className="mt-6 space-y-3">
          {currentQ.options.map((opt) => {
            const isSelected = selectedOpt === opt.id;
            const isEliminated = eliminatedOpts.includes(opt.id);

            return (
              <div
                key={opt.id}
                className={`group flex items-start justify-between rounded-lg border p-3.5 sm:p-4 text-xs sm:text-sm transition-all ${
                  isEliminated
                    ? 'border-slate-200 bg-slate-100/60 opacity-40 dark:border-slate-800 dark:bg-slate-950/40'
                    : isSelected
                    ? 'border-blue-600 bg-blue-50/70 dark:border-blue-500 dark:bg-blue-950/40 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 dark:border-slate-800 dark:hover:border-slate-700 dark:hover:bg-slate-800/40'
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    if (strikethroughMode) {
                      toggleEliminateOption(currentQ.id, opt.id);
                    } else {
                      selectOption(currentQ.id, opt.id);
                    }
                  }}
                  className="flex items-start gap-3.5 flex-1 text-left"
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-mono font-bold transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white dark:bg-blue-500'
                        : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 group-hover:bg-slate-300'
                    }`}
                  >
                    {opt.letter}
                  </span>
                  <span
                    className={`leading-relaxed ${
                      isEliminated
                        ? 'line-through text-slate-400 dark:text-slate-500'
                        : isSelected
                        ? 'font-semibold text-slate-900 dark:text-white'
                        : 'text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    {opt.text}
                  </span>
                </button>

                {/* Strikethrough Button Affordance */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleEliminateOption(currentQ.id, opt.id);
                  }}
                  title={isEliminated ? 'Restore distractor' : 'Eliminate distractor'}
                  className={`ml-2 p-1 rounded text-xs transition-colors shrink-0 ${
                    isEliminated
                      ? 'text-amber-600 hover:text-amber-800 dark:text-amber-400'
                      : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="line-through font-mono font-bold px-1">S</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Authoritative NotebookLM Citation Card */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setShowCitation((prev) => !prev)}
            className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>{showCitation ? 'Hide NotebookLM Citation' : 'Show NotebookLM Authoritative Citation'}</span>
          </button>

          {showCitation && (
            <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs dark:border-slate-800 dark:bg-slate-950/60">
              <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white mb-1">
                <span>{currentQ.citation.authority}</span>
                <span className="font-mono text-[11px] text-slate-500">{currentQ.citation.section}</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-2">
                {currentQ.citation.note}
              </p>
              <div className="text-[11px] text-slate-400 font-mono">
                Source Document: {currentQ.citation.sourceDocument}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Pager */}
        <div className="mt-8 flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={() => jumpToQuestion(Math.max(0, activeExam.currentIndex - 1))}
            disabled={activeExam.currentIndex === 0}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-2">
            {activeExam.currentIndex < totalCount - 1 ? (
              <button
                onClick={() => jumpToQuestion(activeExam.currentIndex + 1)}
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-sm"
              >
                <span>Next Question</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={() => setIsMatrixOpen(true)}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm"
              >
                <FileCheck className="h-4 w-4" />
                <span>Review & Submit</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Question Matrix & Review Drawer */}
      {isMatrixOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 transition-colors my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Question Matrix & Review Drawer
                </h3>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {answeredCount} of {totalCount} answered · {flaggedCount} flagged for review
                </div>
              </div>
              <button
                onClick={() => setIsMatrixOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg dark:bg-slate-800 my-4 text-xs">
              <button
                onClick={() => setMatrixFilter('ALL')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  matrixFilter === 'ALL'
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white font-semibold'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                All ({totalCount})
              </button>
              <button
                onClick={() => setMatrixFilter('ANSWERED')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  matrixFilter === 'ANSWERED'
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white font-semibold'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Answered ({answeredCount})
              </button>
              <button
                onClick={() => setMatrixFilter('REMAINING')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  matrixFilter === 'REMAINING'
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white font-semibold'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Remaining ({unansweredCount})
              </button>
              <button
                onClick={() => setMatrixFilter('FLAGGED')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  matrixFilter === 'FLAGGED'
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white font-semibold'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Flagged ({flaggedCount})
              </button>
            </div>

            {/* Matrix Grid */}
            <div className="grid grid-cols-5 sm:grid-cols-8 gap-2.5 max-h-72 overflow-y-auto p-1">
              {activeExam.questions.map((q, idx) => {
                const isAns = !!activeExam.answers[q.id];
                const isFlg = activeExam.flaggedQuestionIds.has(q.id);

                if (matrixFilter === 'ANSWERED' && !isAns) return null;
                if (matrixFilter === 'REMAINING' && isAns) return null;
                if (matrixFilter === 'FLAGGED' && !isFlg) return null;

                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      jumpToQuestion(idx);
                      setIsMatrixOpen(false);
                    }}
                    className={`flex flex-col items-center justify-center h-12 rounded-lg border text-xs font-mono font-bold transition-all ${
                      idx === activeExam.currentIndex
                        ? 'border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-500 dark:bg-blue-950 dark:text-blue-300'
                        : isFlg
                        ? 'border-amber-400 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        : isAns
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400'
                    }`}
                  >
                    <span>{idx + 1}</span>
                    <span className="text-[9px] font-normal">
                      {isFlg ? 'FLAG' : isAns ? 'OK' : 'OPEN'}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Matrix Actions */}
            <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsMatrixOpen(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Return to Exam
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMatrixOpen(false);
                  submitExamSession();
                }}
                className="rounded-lg bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm"
              >
                Submit Simulation Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pause Modal Snapshot */}
      {activeExam.isPaused && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 text-center shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400 mb-3">
              <Pause className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Exam Session Paused</h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Timer is frozen at <span className="font-mono font-bold text-slate-900 dark:text-white">{timeFormatted}</span>. Your selections and distractor states are preserved in cloud memory.
            </p>

            <div className="mt-6 flex flex-col gap-2">
              <button
                onClick={resumeExamSession}
                className="w-full rounded-lg bg-blue-600 py-2.5 text-xs font-bold text-white hover:bg-blue-700 shadow-sm"
              >
                Resume Simulation
              </button>
              <button
                onClick={cancelExamSession}
                className="w-full rounded-lg border border-slate-200 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                Exit Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
