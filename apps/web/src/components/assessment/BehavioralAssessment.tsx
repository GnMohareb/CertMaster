import React, { useState, useEffect } from 'react';
import { useCertMaster } from '../../context/CertMasterContext';
import { ONBOARDING_ASSESSMENT_QUESTIONS } from '../../data/assessmentQuestions';
import {
  Brain,
  Timer,
  Flag,
  RotateCcw,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  HelpCircle,
  Activity,
  AlertTriangle,
  Award,
} from 'lucide-react';

export const BehavioralAssessment: React.FC = () => {
  const {
    profile,
    activeExam,
    startExamSession,
    jumpToQuestion,
    selectOption,
    toggleEliminateOption,
    toggleFlagQuestion,
    submitExamSession,
    cancelExamSession,
    setActiveTab,
  } = useCertMaster();

  const [strikethroughMode, setStrikethroughMode] = useState(false);
  const [showCitation, setShowCitation] = useState(false);

  // If no assessment exam is currently active, prompt user to start
  const isAssessmentActive = activeExam && activeExam.examId === 'assessment';

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isAssessmentActive || activeExam.isCompleted) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
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
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAssessmentActive, activeExam, strikethroughMode]);

  const handleStartAssessment = () => {
    startExamSession('assessment', ONBOARDING_ASSESSMENT_QUESTIONS, 25);
  };

  // If assessment is completed, show the Calibrated Behavioral Profile Screen
  if (isAssessmentActive && activeExam.isCompleted) {
    const scorePct = activeExam.resultScorePercent ?? profile.assessmentScorePercent;
    const archetype = profile.behavioralArchetype;

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900 shadow-sm text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 mb-4">
            <Award className="h-8 w-8" />
          </div>

          <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            Calibration Assessment Complete
          </div>
          <h2 className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">
            Your Calibrated Behavioral Knowledge Baseline
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
            Telemetry metrics have recalibrated your baseline readiness, cognitive latency profile, and stress threshold across all 112 subject banks.
          </p>

          {/* Scores Overview */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/50">
              <div className="text-xs text-slate-500 dark:text-slate-400">Baseline Readiness</div>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
                {scorePct}%
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
                {scorePct >= 70 ? 'Passing Threshold Met' : 'Remediation Recommended'}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/50">
              <div className="text-xs text-slate-500 dark:text-slate-400">Cognitive Stress Baseline</div>
              <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 font-mono tabular-nums">
                {profile.cognitiveStressBaseline}/100
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Monitored during timed constraints
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/50">
              <div className="text-xs text-slate-500 dark:text-slate-400">Behavioral Archetype</div>
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400 truncate mt-1">
                {archetype.name}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Confidence Index: {archetype.confidenceIndex}/100
              </div>
            </div>
          </div>

          {/* Archetype Card */}
          <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50/60 p-5 text-left dark:border-blue-900/60 dark:bg-blue-950/30">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wide">
              <Brain className="h-4 w-4" />
              <span>Archetype Diagnostic: {archetype.name}</span>
            </div>
            <p className="mt-1 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {archetype.description}
            </p>

            <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-900/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px]">AVG DWELL</span>
                <span className="font-bold text-slate-900 dark:text-white tabular-nums">{archetype.avgDwellSeconds}s / item</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px]">SWITCH RATE</span>
                <span className="font-bold text-slate-900 dark:text-white tabular-nums">{archetype.switchRatePercent}%</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px]">DISTRACTOR STRIKE</span>
                <span className="font-bold text-slate-900 dark:text-white tabular-nums">{archetype.distractorEliminationRate}%</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px]">ACCURACY RATE</span>
                <span className="font-bold text-slate-900 dark:text-white tabular-nums">{archetype.accuracyRate}%</span>
              </div>
            </div>

            <div className="mt-3 text-xs text-blue-900 dark:text-blue-200 bg-white/60 dark:bg-slate-900/60 p-3 rounded border border-blue-200/60 dark:border-blue-800/60">
              <span className="font-semibold">Coaching Directive:</span> {archetype.recommendedStrategy}
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => handleStartAssessment()}
              className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Retake Calibration</span>
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-sm"
            >
              <span>View Multi-Domain Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If not currently running the assessment, show the onboarding launch screen
  if (!isAssessmentActive) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900 shadow-sm transition-colors">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
                <span>Cognitive Telemetry Engine</span>
                <span>·</span>
                <span>10 Standardized Questions</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Behavioral Knowledge & Readiness Calibration
              </h1>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
                Unlike ordinary multiple-choice tests, CertMaster observes how you solve: tracking question dwell time, option switching hesitation, and distractor strikethroughs to classify your decision archetype and calibrate realistic simulation pacing.
              </p>
            </div>

            <button
              onClick={handleStartAssessment}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-sm shrink-0"
            >
              <Brain className="h-4 w-4" />
              <span>Start 10-Question Calibration</span>
            </button>
          </div>

          {/* Current Calibrated Profile Pill */}
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
              <span className="text-xs text-slate-500 dark:text-slate-400 block">Current Readiness</span>
              <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
                {profile.assessmentScorePercent}%
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">Synchronized with Android</span>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
              <span className="text-xs text-slate-500 dark:text-slate-400 block">Cognitive Stress Index</span>
              <span className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-mono tabular-nums">
                {profile.cognitiveStressBaseline}/100
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">Latency under time pressure</span>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
              <span className="text-xs text-slate-500 dark:text-slate-400 block">Classified Archetype</span>
              <span className="text-base font-bold text-blue-600 dark:text-blue-400 block truncate mt-1">
                {profile.behavioralArchetype.name}
              </span>
              <span className="text-[11px] text-slate-500 block">Confidence: {profile.behavioralArchetype.confidenceIndex}%</span>
            </div>
          </div>

          {/* Key Behavioral Features */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-start gap-2.5">
              <Timer className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-900 dark:text-white block">Micro-Dwell Telemetry</span>
                Measures reading comprehension latency per domain.
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Activity className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-900 dark:text-white block">Switch Rate Detection</span>
                Flags second-guessing tendencies and option hesitation.
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <HelpCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-900 dark:text-white block">Distractor Elimination</span>
                Tracks logical elimination vs. speculative guessing.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Active Assessment In-Progress View ---
  const currentQ = activeExam.questions[activeExam.currentIndex];
  const isFlagged = activeExam.flaggedQuestionIds.has(currentQ.id);
  const selectedOpt = activeExam.answers[currentQ.id];
  const eliminatedOpts = activeExam.eliminations[currentQ.id] || [];

  const answeredCount = Object.keys(activeExam.answers).length;
  const totalCount = activeExam.questions.length;
  const progressPercent = Math.round((answeredCount / totalCount) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Top Session Ribbon */}
      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-3 dark:border-slate-800 dark:bg-slate-900 shadow-sm transition-colors">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 font-mono">
            Item {activeExam.currentIndex + 1} of {totalCount}
          </span>
          <span className="text-xs text-slate-400">·</span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {answeredCount} Answered ({progressPercent}%)
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Strikethrough Mode Toggle */}
          <button
            onClick={() => setStrikethroughMode((prev) => !prev)}
            title="Toggle Distractor Strikethrough Mode (Key: S)"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              strikethroughMode
                ? 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            <span className="line-through font-bold">S</span>
            <span className="hidden sm:inline">Eliminate Distractors</span>
          </button>

          {/* Flag Toggle */}
          <button
            onClick={() => toggleFlagQuestion(currentQ.id)}
            title="Flag question for review (Key: F)"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              isFlagged
                ? 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            <Flag className={`h-3.5 w-3.5 ${isFlagged ? 'fill-current text-amber-500' : ''}`} />
            <span className="hidden sm:inline">{isFlagged ? 'Flagged' : 'Flag'}</span>
          </button>

          {/* Cancel */}
          <button
            onClick={cancelExamSession}
            className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 px-2 py-1"
          >
            Exit
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden dark:bg-slate-800">
        <div
          className="h-full bg-blue-600 transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>

      {/* Question Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900 shadow-sm transition-colors">
        {/* Domain & Difficulty Tags (Quiet text metadata) */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Domain {currentQ.domainNumber}: {currentQ.domain}
            </span>
            <span>·</span>
            <span>{currentQ.difficulty}</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 font-mono text-[11px]">
            <span>Keys: [1-4 / A-D] select · [S] strike · [F] flag</span>
          </div>
        </div>

        {/* Scenario Text (if any) */}
        {currentQ.scenario && (
          <div className="mb-4 rounded-lg bg-slate-50 p-4 text-xs sm:text-sm text-slate-700 dark:bg-slate-950/60 dark:text-slate-300 leading-relaxed border border-slate-200/60 dark:border-slate-800/60">
            {currentQ.scenario}
          </div>
        )}

        {/* Prompt */}
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
          {currentQ.prompt}
        </h2>

        {/* Strikethrough mode helper banner */}
        {strikethroughMode && (
          <div className="mt-3 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/60">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>Elimination Mode Active: Click any choice or press its key to strike it out as a known wrong answer.</span>
          </div>
        )}

        {/* Options List */}
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

                {/* Strikethrough Action Affordance */}
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
            <span>{showCitation ? 'Hide Authoritative Citation' : 'View NotebookLM Authoritative Citation'}</span>
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
                Source: {currentQ.citation.sourceDocument}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Navigation Ribbon */}
        <div className="mt-8 flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={() => jumpToQuestion(Math.max(0, activeExam.currentIndex - 1))}
            disabled={activeExam.currentIndex === 0}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Previous</span>
          </button>

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
              onClick={submitExamSession}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Submit & Calibrate Profile</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Jump Ribbon */}
      <div className="flex items-center gap-1.5 overflow-x-auto p-2 bg-white rounded-xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800 scrollbar-thin">
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
    </div>
  );
};
