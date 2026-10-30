import React, { useState, useEffect } from 'react';
import { useCertMaster, PracticeSessionMode } from '../../context/CertMasterContext';
import { ALL_112_EXAM_BANKS } from '../../data/examBanks';
import {
  getQuestionsForExamId,
  FULL_PREP_EXAM_IDS,
} from '../../data/multiExamQuestions';
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
  Target,
  Zap,
  Layers,
  Award,
  Brain,
} from 'lucide-react';

export const ExamSimulator: React.FC = () => {
  const {
    activeExam,
    lastCompletedExam,
    startExamSession,
    pauseExamSession,
    resumeExamSession,
    jumpToQuestion,
    selectOption,
    toggleEliminateOption,
    toggleFlagQuestion,
    submitExamSession,
    cancelExamSession,
    selectedCertId,
    setSelectedCertId,
    activeSubTab,
    navigateTo,
  } = useCertMaster();

  const [isMatrixOpen, setIsMatrixOpen] = useState(false);
  const [matrixFilter, setMatrixFilter] = useState<'ALL' | 'ANSWERED' | 'REMAINING' | 'FLAGGED'>('ALL');
  const [strikethroughMode, setStrikethroughMode] = useState(false);
  const [showCitation, setShowCitation] = useState(false);
  const [selectedDomainDrill, setSelectedDomainDrill] = useState<string>('ALL');
  const [showDetailedReview, setShowDetailedReview] = useState<boolean>(false);

  const activeBank =
    ALL_112_EXAM_BANKS.find((b) => b.id === selectedCertId) || ALL_112_EXAM_BANKS[0];
  const certQuestions = getQuestionsForExamId(selectedCertId);
  const availableDomains = Array.from(new Set(certQuestions.map((q) => q.domain)));

  // Countdown timer effect
  useEffect(() => {
    if (!activeExam || !activeExam.isRunning || activeExam.isPaused || activeExam.isCompleted) return;

    const timer = setInterval(() => {
      if (activeExam.timeRemainingSeconds <= 1) {
        submitExamSession();
        clearInterval(timer);
      } else {
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

  // Review session to display when viewing Post-Exam Review
  const reviewSession =
    (activeExam && activeExam.isCompleted ? activeExam : null) || lastCompletedExam;

  // If user navigated to #/practice/review and a completed session exists
  if (activeSubTab === 'review' && reviewSession && (!activeExam || activeExam.isCompleted)) {
    const scorePct = reviewSession.resultScorePercent ?? 0;
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-blue-600 dark:text-blue-400">
              Post-Exam Question-by-Question Review
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              {reviewSession.examTitle} — Score: {scorePct}%
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateTo('practice', 'mock')}
              className="rounded-lg border border-slate-300 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
            >
              Back to Practice Modes
            </button>
            <button
              onClick={() => navigateTo('progress', 'history')}
              className="rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-700"
            >
              View Attempt History
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {reviewSession.questions.map((q, idx) => {
            const userSelected = reviewSession.answers[q.id];
            const isCorrect = userSelected === q.correctOptionId;
            return (
              <div
                key={q.id}
                className={`rounded-xl border p-6 bg-white dark:bg-slate-900 shadow-sm ${
                  isCorrect
                    ? 'border-emerald-200 dark:border-emerald-900/60'
                    : 'border-rose-200 dark:border-rose-900/60'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-mono font-bold text-slate-500">
                    Question {idx + 1} · {q.domain}
                  </span>
                  <span
                    className={`rounded px-2 py-0.5 font-mono text-[10px] font-bold ${
                      isCorrect
                        ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                        : 'bg-rose-500/20 text-rose-700 dark:text-rose-300'
                    }`}
                  >
                    {isCorrect ? 'CORRECT' : 'INCORRECT / UNANSWERED'}
                  </span>
                </div>

                {q.scenario && (
                  <div className="mb-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-950/60 dark:text-slate-300">
                    {q.scenario}
                  </div>
                )}

                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
                  {q.prompt}
                </h3>

                <div className="space-y-2 mb-4">
                  {q.options.map((opt) => {
                    const isOptCorrect = opt.id === q.correctOptionId;
                    const isOptSelected = opt.id === userSelected;
                    return (
                      <div
                        key={opt.id}
                        className={`flex items-start justify-between rounded-lg border p-3 text-xs ${
                          isOptCorrect
                            ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 font-semibold text-emerald-950 dark:text-emerald-200'
                            : isOptSelected
                            ? 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200'
                            : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="font-mono font-bold">{opt.letter}.</span>
                          <span>{opt.text}</span>
                        </div>
                        {isOptCorrect && (
                          <span className="ml-2 shrink-0 font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                            ✓ Correct Answer
                          </span>
                        )}
                        {!isOptCorrect && isOptSelected && (
                          <span className="ml-2 shrink-0 font-mono text-[10px] font-bold text-rose-600 dark:text-rose-400">
                            ✗ Your Choice
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 text-xs dark:border-slate-800 dark:bg-slate-950/60">
                  <div className="font-bold text-slate-900 dark:text-white mb-1">
                    Authoritative Explanation ({q.citation.authority} · {q.citation.section})
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {q.citation.note}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // If no exam session active, show Learner Practice & Exams Mode Hub
  if (!activeExam || activeExam.examId === 'assessment') {
    const fullPrepBanks = ALL_112_EXAM_BANKS.filter((b) => FULL_PREP_EXAM_IDS.has(b.id));
    const isFullPrep = FULL_PREP_EXAM_IDS.has(selectedCertId);

    return (
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Practice Mode Hub Header */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900 shadow-sm transition-colors">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
                <span>Practice & Examination Suite</span>
                <span>·</span>
                <span>Unified Web & Android Telemetry</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {activeBank.code} — {activeBank.title}
              </h1>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
                Choose your practice mode below. Every session tracks question dwell time, option switches, and distractor elimination strikethroughs, updating your 60/25/15 Readiness Score across Web and Android.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
              <select
                value={selectedCertId}
                onChange={(e) => setSelectedCertId(e.target.value)}
                className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                {fullPrepBanks.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.code} ({b.vendor})
                  </option>
                ))}
              </select>

              {lastCompletedExam && (
                <button
                  onClick={() => navigateTo('practice', 'review')}
                  className="rounded-lg border border-blue-300 bg-blue-50 px-3.5 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300"
                >
                  Review Last Exam ({lastCompletedExam.resultScorePercent}%)
                </button>
              )}
            </div>
          </div>

          {!isFullPrep ? (
            <div className="mt-6 rounded-xl border border-amber-300 bg-amber-50/70 p-6 dark:border-amber-800 dark:bg-amber-950/30">
              <h3 className="text-sm font-bold text-amber-900 dark:text-amber-300">
                Catalog Preview — Blueprint Only ({activeBank.code})
              </h3>
              <p className="mt-1 text-xs text-amber-800 dark:text-amber-400">
                To maintain strict certification content integrity, CertMaster never substitutes another exam's questions. Select one of the 6 Full-Prep Certifications (CISSP, AWS SAA-C03, Security+ SY0-701, PMP, CISM, or CEH v12) above to launch live practice and mock exams.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-slate-200 dark:border-slate-800">
              {/* Mode 1: Quick Practice */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-5 dark:border-slate-800 dark:bg-slate-950/40 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Zap className="h-4 w-4" />
                      <span>Quick Practice Session</span>
                    </span>
                    <span className="font-mono">15 Mins · Rapid Drill</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Rapid {Math.min(5, certQuestions.length)}-Question Sprint
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    High-yield scenario questions for daily momentum when you have 10–15 minutes.
                  </p>
                </div>
                <button
                  onClick={() =>
                    startExamSession(
                      selectedCertId,
                      certQuestions.slice(0, 5),
                      15,
                      'QUICK'
                    )
                  }
                  className="mt-4 w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700 shadow-sm"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Start Quick Practice ({activeBank.code})</span>
                </button>
              </div>

              {/* Mode 2: Domain-Specific Practice */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-5 dark:border-slate-800 dark:bg-slate-950/40 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Target className="h-4 w-4" />
                      <span>Domain-Specific Drill</span>
                    </span>
                    <span className="font-mono">Targeted Remediation</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Focus on a Single {activeBank.code} Domain
                  </h3>
                  <div className="mt-2">
                    <select
                      value={selectedDomainDrill}
                      onChange={(e) => setSelectedDomainDrill(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                    >
                      <option value="ALL">All Domains ({certQuestions.length} Qs)</option>
                      {availableDomains.map((dom) => (
                        <option key={dom} value={dom}>
                          {dom}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const filtered =
                      selectedDomainDrill === 'ALL'
                        ? certQuestions
                        : certQuestions.filter((q) => q.domain === selectedDomainDrill);
                    startExamSession(
                      selectedCertId,
                      filtered.length > 0 ? filtered : certQuestions,
                      30,
                      'DOMAIN'
                    );
                  }}
                  className="mt-4 w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Launch Domain Drill</span>
                </button>
              </div>

              {/* Mode 3: Full Timed Mock Exam */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-5 dark:border-slate-800 dark:bg-slate-950/40 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Award className="h-4 w-4" />
                      <span>Full Timed Mock Examination</span>
                    </span>
                    <span className="font-mono">{activeBank.durationMinutes} Mins</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {activeBank.code} Enterprise Simulation
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Full examination conditions with urgency timer, matrix review drawer, and Pass Guarantee qualification tracking.
                  </p>
                </div>
                <button
                  onClick={() =>
                    startExamSession(
                      selectedCertId,
                      certQuestions,
                      activeBank.durationMinutes,
                      'MOCK'
                    )
                  }
                  className="mt-4 w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 shadow-sm"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Launch Full Timed Mock ({activeBank.durationMinutes}m)</span>
                </button>
              </div>

              {/* Mode 4: Behavioral & Knowledge Calibration */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-5 dark:border-slate-800 dark:bg-slate-950/40 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-purple-600 dark:text-purple-400 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Brain className="h-4 w-4" />
                      <span>Diagnostic & Behavioral Calibration</span>
                    </span>
                    <span className="font-mono">15 Questions</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Cognitive Stress & Archetype Assessment
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Calibrates your test-taking archetype (Analytical Hesitator, Impulsive Guesser, Rapid Master) and 25% Diagnostic weight.
                  </p>
                </div>
                <button
                  onClick={() => navigateTo('practice', 'diagnostic')}
                  className="mt-4 w-full flex items-center justify-center gap-2 rounded-lg border border-purple-400 bg-purple-600/10 px-4 py-2.5 text-xs font-bold text-purple-700 hover:bg-purple-600/20 dark:text-purple-300"
                >
                  <Brain className="h-3.5 w-3.5" />
                  <span>Open Behavioral Calibration</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- Exam Result View (With Inline Question-by-Question Review Toggle) ---
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
            Your attempt, domain breakdown, and updated 60/25/15 Readiness Score have been synchronized across Web and Android.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setShowDetailedReview((prev) => !prev)}
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm"
            >
              <BookOpen className="h-4 w-4" />
              <span>
                {showDetailedReview
                  ? 'Hide Question-by-Question Review'
                  : 'Review Questions & Explanations'}
              </span>
            </button>

            <button
              onClick={() =>
                startExamSession(
                  activeExam.examId,
                  activeExam.questions,
                  activeExam.durationMinutes,
                  activeExam.practiceMode
                )
              }
              className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Retake Simulation</span>
            </button>

            <button
              onClick={() => {
                cancelExamSession();
                navigateTo('progress', 'trends');
              }}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-sm"
            >
              <span>View Progress & Results</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {showDetailedReview && (
          <div className="space-y-4">
            {activeExam.questions.map((q, idx) => {
              const userSelected = activeExam.answers[q.id];
              const isCorrect = userSelected === q.correctOptionId;
              return (
                <div
                  key={q.id}
                  className={`rounded-xl border p-6 bg-white dark:bg-slate-900 shadow-sm ${
                    isCorrect
                      ? 'border-emerald-200 dark:border-emerald-900/60'
                      : 'border-rose-200 dark:border-rose-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-mono font-bold text-slate-500">
                      Question {idx + 1} · {q.domain}
                    </span>
                    <span
                      className={`rounded px-2 py-0.5 font-mono text-[10px] font-bold ${
                        isCorrect
                          ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                          : 'bg-rose-500/20 text-rose-700 dark:text-rose-300'
                      }`}
                    >
                      {isCorrect ? 'CORRECT' : 'INCORRECT'}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                    {q.prompt}
                  </h3>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 text-xs dark:border-slate-800 dark:bg-slate-950/60">
                    <div className="font-bold text-slate-900 dark:text-white mb-1">
                      Correct Option: {q.correctOptionId.toUpperCase()} · {q.citation.authority} ({q.citation.section})
                    </div>
                    <p className="text-slate-600 dark:text-slate-300">{q.citation.note}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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

  const mins = Math.floor(activeExam.timeRemainingSeconds / 60);
  const secs = activeExam.timeRemainingSeconds % 60;
  const timeFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  const isUnder10Min = mins < 10;
  const isUnder5Min = mins < 5;

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Top Simulator Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-sm transition-colors">
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

        <div className="flex items-center gap-3">
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
          </div>

          <button
            onClick={activeExam.isPaused ? resumeExamSession : pauseExamSession}
            title={activeExam.isPaused ? 'Resume exam' : 'Pause exam'}
            className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
          >
            {activeExam.isPaused ? (
              <Play className="h-3.5 w-3.5 fill-current" />
            ) : (
              <Pause className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">{activeExam.isPaused ? 'Resume' : 'Pause'}</span>
          </button>

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
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Domain {currentQ.domainNumber}: {currentQ.domain}
            </span>
            <span>·</span>
            <span>{currentQ.difficulty}</span>
          </div>

          <div className="flex items-center gap-2">
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

        {currentQ.scenario && (
          <div className="mb-4 rounded-lg bg-slate-50 p-4 text-xs sm:text-sm text-slate-700 dark:bg-slate-950/60 dark:text-slate-300 leading-relaxed border border-slate-200/60 dark:border-slate-800/60">
            {currentQ.scenario}
          </div>
        )}

        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
          {currentQ.prompt}
        </h2>

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

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleEliminateOption(currentQ.id, opt.id);
                  }}
                  title={isEliminated ? 'Restore distractor' : 'Eliminate distractor'}
                  className="ml-2 p-1 rounded text-xs transition-colors shrink-0 text-slate-400 hover:text-slate-600"
                >
                  <span className="line-through font-mono font-bold px-1">S</span>
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setShowCitation((prev) => !prev)}
            className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>
              {showCitation ? 'Hide Authoritative Citation' : 'Show Authoritative Source Citation'}
            </span>
          </button>

          {showCitation && (
            <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs dark:border-slate-800 dark:bg-slate-950/60">
              <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white mb-1">
                <span>{currentQ.citation.authority}</span>
                <span className="font-mono text-[11px] text-slate-500">
                  {currentQ.citation.section}
                </span>
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

      {/* Question Matrix Drawer */}
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

            <div className="grid grid-cols-5 sm:grid-cols-8 gap-2.5 max-h-72 overflow-y-auto p-1 my-4">
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
    </div>
  );
};
