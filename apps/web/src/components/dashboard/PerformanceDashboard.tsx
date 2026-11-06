import React, { useState } from 'react';
import { useCertMaster } from '../../context/CertMasterContext';
import { ALL_112_EXAM_BANKS, CISSP_DOMAINS } from '../../data/examBanks';
import {
  getQuestionsForExamId,
  FULL_PREP_EXAM_IDS,
} from '../../data/multiExamQuestions';
import {
  TrendingUp,
  Brain,
  Play,
  RotateCcw,
  Smartphone,
  Shield,
  Flame,
  BookOpen,
  CheckCircle2,
  Target,
  Award,
  Clock,
  Sparkles,
  History,
  BarChart3,
  Layers,
  ArrowRight,
} from 'lucide-react';

export const PerformanceDashboard: React.FC = () => {
  const {
    profile,
    historicalAttempts,
    flashcards,
    studyPlan,
    readinessMap,
    startExamSession,
    activeSection,
    activeSubTab,
    selectedCertId,
    setSelectedCertId,
    navigateTo,
    setIsSyncModalOpen,
    simulateAndroidExamCompletion,
    isSyncing,
    isDemoMode,
    syncState,
    lastCompletedExam,
  } = useCertMaster();

  const [activeDomainFilter, setActiveDomainFilter] = useState<string>('Overall Score');
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  const activeBank =
    ALL_112_EXAM_BANKS.find((b) => b.id === selectedCertId) || ALL_112_EXAM_BANKS[0];
  const certQuestions = getQuestionsForExamId(selectedCertId);
  const certReadiness = readinessMap[selectedCertId] || readinessMap.cissp || {
    readinessScore: profile.assessmentScorePercent || 78,
    passProbability: Math.min(99, (profile.assessmentScorePercent || 78) + 6),
    simulationsCompleted: historicalAttempts.length,
    weakestDomain: 'Software Development Security',
  };

  const certFlashcards = flashcards.filter(
    (f) => (f.examId || 'cissp') === selectedCertId
  );
  const knownCardsCount = certFlashcards.filter((f) => f.state === 'known').length;

  // Domains available for individual curve plotting (dynamic per active certification)
  const domainOptions = [
    'Overall Score',
    ...(activeBank.domains && activeBank.domains.length > 0
      ? activeBank.domains.map((d) => d.name)
      : CISSP_DOMAINS.map((d) => d.name)),
  ];

  // Prepare chart coordinates (SVG 640 x 220)
  const chartWidth = 640;
  const chartHeight = 220;
  const paddingX = 40;
  const paddingY = 30;

  const points = historicalAttempts.map((attempt, index) => {
    let score = attempt.scorePercent;
    if (
      activeDomainFilter !== 'Overall Score' &&
      attempt.domainScores[activeDomainFilter] !== undefined
    ) {
      score = attempt.domainScores[activeDomainFilter];
    }

    const x =
      paddingX +
      (index / Math.max(1, historicalAttempts.length - 1)) * (chartWidth - paddingX * 2);
    const y = chartHeight - paddingY - (score / 100) * (chartHeight - paddingY * 2);

    return { x, y, score, date: attempt.date, id: attempt.id, attempt };
  });

  const generateBezierPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;

    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cp1x = p0.x + (p1.x - p0.x) / 2;
      const cp1y = p0.y;
      const cp2x = p0.x + (p1.x - p0.x) / 2;
      const cp2y = p1.y;
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
    }
    return path;
  };

  const linePath = generateBezierPath(points);
  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`
      : '';

  const hoveredPoint = hoveredPointIndex !== null ? points[hoveredPointIndex] : null;

  // Domain Stress Heatmap calculation (reflects currently active certification)
  const domainsToUse =
    activeBank.domains && activeBank.domains.length > 0 ? activeBank.domains : CISSP_DOMAINS;

  const domainStressData = domainsToUse.map((domain) => {
    const latestAttempt = historicalAttempts[historicalAttempts.length - 1];
    const score = latestAttempt ? latestAttempt.domainScores[domain.name] || 72 : 72;
    const domainStress = Math.round(100 - score + profile.cognitiveStressBaseline * 0.35);
    const isHighStress = domainStress >= 65;
    const isMediumStress = domainStress >= 50 && domainStress < 65;

    return {
      id: domain.id,
      name: domain.name,
      weight: domain.weight,
      currentScore: score,
      stressIndex: domainStress,
      status: isHighStress
        ? 'High Latency / High Stress'
        : isMediumStress
        ? 'Moderate Stress'
        : 'Optimal Competency',
      severity: isHighStress ? 'high' : isMediumStress ? 'medium' : 'low',
    };
  });

  const weakestDomains = [...domainStressData]
    .sort((a, b) => a.currentScore - b.currentScore)
    .slice(0, 3);

  const milestones = studyPlan.milestones || [
    {
      stage: 1,
      stageName: 'Stage 1: Diagnostic & Behavioral Baseline',
      description: 'Complete the 15-Question Behavioral & Knowledge Calibration Assessment.',
      status: 'COMPLETED',
    },
    {
      stage: 2,
      stageName: 'Stage 2: Core Domain Study & Audio Briefings',
      description: 'Review NotebookLM study guides and listen to Maya & Liam audio lessons.',
      status: 'COMPLETED',
    },
    {
      stage: 3,
      stageName: 'Stage 3: Spaced-Repetition Flashcard Mastery',
      description: 'Advance at least 50% of active recall flashcards to Box 4-5 (Known).',
      status: knownCardsCount >= Math.ceil(certFlashcards.length * 0.5) ? 'COMPLETED' : 'IN_PROGRESS',
    },
    {
      stage: 4,
      stageName: 'Stage 4: Full Timed Mock Exam Simulations',
      description: 'Complete at least 3 full-length timed mock exams at >=70% accuracy.',
      status: historicalAttempts.length >= 3 ? 'COMPLETED' : 'IN_PROGRESS',
    },
    {
      stage: 5,
      stageName: 'Stage 5: Pass Guarantee Qualification',
      description: 'Achieve >=85% Authoritative Readiness Score across all domains.',
      status: certReadiness.readinessScore >= 85 ? 'COMPLETED' : 'IN_PROGRESS',
    },
  ];

  const isProgressSection = activeSection === 'progress';
  const progressTab = isProgressSection ? activeSubTab || 'trends' : 'overview';

  return (
    <div className="space-y-6">
      {/* Progress & Results Sub-Navigation Bar (when viewing #/progress) */}
      {isProgressSection && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
                <BarChart3 className="h-4 w-4" />
                <span>Progress, Telemetry & Cross-Platform Results</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {activeBank.code} Performance & Readiness Analytics
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-lg dark:bg-slate-800 text-xs">
              {[
                { id: 'trends', label: 'Score Trends' },
                { id: 'history', label: 'Exam History' },
                { id: 'domains', label: 'Domain Performance' },
                { id: 'readiness', label: 'Readiness & Pass Guarantee' },
                { id: 'behavioral', label: 'Behavioral Analytics' },
                { id: 'milestones', label: 'Study Milestones' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => navigateTo('progress', tab.id)}
                  className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                    progressTab === tab.id
                      ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-900 dark:text-blue-400'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          1. LEARNER-FIRST HERO CARD (CONTINUE LEARNING + ACTIVE TRACK)
         ===================================================================== */}
      {!isProgressSection && (
        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm transition-colors">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 p-6 sm:p-8">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 mb-2">
                <Shield className="h-4 w-4" />
                <span>Active Track: {activeBank.code} ({activeBank.vendor})</span>
                <span>·</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                  {isDemoMode
                    ? 'Local Demo Profile (Sign in for Live Cloud Sync)'
                    : `Cloud Firestore (${syncState})`}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Continue Learning: {activeBank.title}
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Pick up right where you left off across Web and Android. Your study plan is at{' '}
                <strong className="text-slate-800 dark:text-slate-200">
                  Stage {studyPlan.currentStage || 4} of 5
                </strong>{' '}
                with{' '}
                <strong className="text-blue-600 dark:text-blue-400">
                  {certReadiness.readinessScore}% Authoritative Readiness
                </strong>
                . Focus next on{' '}
                <strong className="text-amber-600 dark:text-amber-400">
                  {certReadiness.weakestDomain}
                </strong>
                .
              </p>

              {/* Primary Learner Actions */}
              <div className="mt-5 flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => navigateTo('study', 'guides')}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>Resume Study ({activeBank.code})</span>
                </button>

                <button
                  onClick={() => {
                    const qBank = certQuestions.slice(0, 5);
                    startExamSession(selectedCertId, qBank, 15, 'QUICK');
                  }}
                  className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50/70 px-3.5 py-2.5 text-xs font-bold text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300 transition-colors"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Quick 5-Q Practice</span>
                </button>

                <button
                  onClick={() => {
                    startExamSession(
                      selectedCertId,
                      certQuestions,
                      activeBank.durationMinutes,
                      'MOCK'
                    );
                  }}
                  className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition-colors"
                >
                  <Clock className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Full Timed Mock Exam</span>
                </button>

                <button
                  onClick={() => navigateTo('practice', 'diagnostic')}
                  className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition-colors"
                >
                  <Brain className="h-3.5 w-3.5 text-purple-500" />
                  <span>Behavioral Calibration</span>
                </button>

                <button
                  onClick={() => simulateAndroidExamCompletion()}
                  disabled={isSyncing}
                  className="flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-2.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300 transition-colors disabled:opacity-50"
                >
                  <RotateCcw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>Receive Android Attempt</span>
                </button>
              </div>
            </div>

            {/* Authoritative Readiness & Pass Probability Capsule */}
            <div className="grid grid-cols-2 gap-3 w-full lg:w-72 shrink-0">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  Readiness (60/25/15)
                </div>
                <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 font-mono tabular-nums mt-0.5">
                  {certReadiness.readinessScore}%
                </div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
                  Pass Prob: {certReadiness.passProbability}%
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  Flashcard Mastery
                </div>
                <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums mt-0.5">
                  {knownCardsCount}/{certFlashcards.length}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Target: {studyPlan.targetDate}
                </div>
              </div>

              <button
                onClick={() => navigateTo('my-certifications', 'overview', selectedCertId)}
                className="col-span-2 flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
              >
                <span>Open {activeBank.code} Certification Workspace</span>
                <ArrowRight className="h-3.5 w-3.5 text-blue-500" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          2. 5-STAGE STUDY PLAN PROGRESS & WEAKEST DOMAINS (DASHBOARD & MILESTONES)
         ===================================================================== */}
      {(!isProgressSection || progressTab === 'milestones' || progressTab === 'readiness') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 5-Stage Mastery Study Plan */}
          <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
                  <Target className="h-4 w-4" />
                  <span>Unified 5-Stage Mastery Roadmap</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Study Plan & Pass Guarantee Qualification
                </h2>
              </div>
              <button
                onClick={() => navigateTo('study', 'plan')}
                className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
              >
                Customize Schedule →
              </button>
            </div>

            <div className="space-y-2.5">
              {milestones.map((m) => {
                const isDone = m.status === 'COMPLETED';
                return (
                  <div
                    key={m.stage}
                    className={`flex items-start justify-between gap-3 rounded-lg border p-3 text-xs ${
                      isDone
                        ? 'border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/50 dark:bg-emerald-950/20'
                        : 'border-slate-200 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-950/40'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2
                        className={`h-4 w-4 shrink-0 mt-0.5 ${
                          isDone
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-400'
                        }`}
                      />
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">
                          {m.stageName}
                        </div>
                        <div className="text-slate-500 dark:text-slate-400 mt-0.5">
                          {m.description}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`shrink-0 rounded px-2 py-0.5 font-mono text-[10px] font-bold ${
                        isDone
                          ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                          : 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                      }`}
                    >
                      {isDone ? 'COMPLETE' : 'IN PROGRESS'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Weakest Domains & Recommended Actions */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">
                <Sparkles className="h-4 w-4" />
                <span>Targeted Remediation</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Priority Focus Domains
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
                Lowest-scoring domains from your recent Web & Android simulations:
              </p>

              <div className="space-y-3">
                {weakestDomains.map((d) => (
                  <div
                    key={d.id}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/50"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                      <span className="truncate">{d.name}</span>
                      <span className="font-mono text-amber-600 dark:text-amber-400">
                        {d.currentScore}%
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        onClick={() => navigateTo('study', 'guides')}
                        className="rounded bg-white border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300"
                      >
                        Study Guide
                      </button>
                      <button
                        onClick={() => navigateTo('practice', 'domain')}
                        className="rounded bg-blue-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-blue-700"
                      >
                        Drill Domain
                      </button>
                      <button
                        onClick={() => navigateTo('study', 'ai-tutor')}
                        className="rounded bg-purple-600/10 border border-purple-500/30 px-2.5 py-1 text-[11px] font-semibold text-purple-700 dark:text-purple-300"
                      >
                        Ask AI Tutor
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">
                Pass Guarantee Threshold: <strong>85%</strong>
              </span>
              <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                Current: {certReadiness.readinessScore}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          3. EXAM HISTORY TABLE & POST-EXAM QUESTION REVIEW LINK
         ===================================================================== */}
      {isProgressSection && progressTab === 'history' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
                <History className="h-4 w-4" />
                <span>Cross-Platform Attempt Ledger</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Synchronized Web & Android Exam Sessions ({historicalAttempts.length})
              </h2>
            </div>
            {lastCompletedExam && (
              <button
                onClick={() => navigateTo('practice', 'review')}
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700"
              >
                <span>Review Last Completed Exam Questions</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Certification</th>
                  <th className="py-2.5 px-3">Origin Platform</th>
                  <th className="py-2.5 px-3">Score</th>
                  <th className="py-2.5 px-3">Duration</th>
                  <th className="py-2.5 px-3">Avg Dwell</th>
                  <th className="py-2.5 px-3">Stress Index</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {[...historicalAttempts].reverse().map((att) => {
                  const passed = att.scorePercent >= 70;
                  return (
                    <tr key={att.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-3 font-mono">{att.date}</td>
                      <td className="py-3 px-3 font-bold uppercase text-slate-900 dark:text-white">
                        {att.examId}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`rounded px-2 py-0.5 font-mono text-[10px] font-bold ${
                            att.platform === 'ANDROID'
                              ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                              : 'bg-blue-500/20 text-blue-700 dark:text-blue-300'
                          }`}
                        >
                          {att.platform || 'WEB'}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white">
                        {att.scorePercent}% ({att.correctAnswers || 6}/{att.totalQuestions || 8})
                      </td>
                      <td className="py-3 px-3 font-mono">{att.timeSpentMinutes}m</td>
                      <td className="py-3 px-3 font-mono">{att.averageDwellSec}s</td>
                      <td className="py-3 px-3 font-mono">{att.stressScore}/100</td>
                      <td className="py-3 px-3">
                        <span
                          className={`font-bold ${
                            passed
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          {passed ? 'PASS (≥70%)' : 'BELOW PASS'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =====================================================================
          4. MULTI-DOMAIN INTERACTIVE BÉZIER PERFORMANCE CHART
         ===================================================================== */}
      {(!isProgressSection || progressTab === 'trends' || progressTab === 'readiness') && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
                <TrendingUp className="h-4 w-4" />
                <span>Multi-Domain Performance Curves</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Simulation Score Trajectory Over Time
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                Plot Domain:
              </label>
              <select
                value={activeDomainFilter}
                onChange={(e) => {
                  setActiveDomainFilter(e.target.value);
                  setHoveredPointIndex(null);
                }}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                {domainOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="relative w-full overflow-hidden pt-2">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-64 select-none overflow-visible"
            >
              <defs>
                <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {[100, 80, 70, 60, 40].map((val) => {
                const y = chartHeight - paddingY - (val / 100) * (chartHeight - paddingY * 2);
                const isPassingLine = val === 70;

                return (
                  <g key={val}>
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={chartWidth - paddingX}
                      y2={y}
                      stroke={isPassingLine ? '#10B981' : '#94A3B8'}
                      strokeDasharray={isPassingLine ? '4 4' : '2 4'}
                      strokeOpacity={isPassingLine ? 0.6 : 0.25}
                      strokeWidth={isPassingLine ? 1.5 : 1}
                    />
                    <text
                      x={paddingX - 8}
                      y={y + 3}
                      textAnchor="end"
                      fill={isPassingLine ? '#10B981' : '#64748B'}
                      fontSize="10"
                      fontFamily="monospace"
                    >
                      {val}%
                    </text>
                    {isPassingLine && (
                      <text
                        x={chartWidth - paddingX + 6}
                        y={y + 3}
                        fill="#10B981"
                        fontSize="9"
                        fontWeight="bold"
                      >
                        PASS (70%)
                      </text>
                    )}
                  </g>
                );
              })}

              {areaPath && <path d={areaPath} fill="url(#curveGradient)" />}

              {linePath && (
                <path
                  d={linePath}
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {points.map((pt, i) => {
                const isHovered = hoveredPointIndex === i;
                const isAndroidOrigin = pt.attempt.platform === 'ANDROID';

                return (
                  <g key={pt.id}>
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? 7 : 4.5}
                      fill="#FFFFFF"
                      stroke={isAndroidOrigin ? '#10B981' : '#2563EB'}
                      strokeWidth={isHovered ? 3.5 : 2.5}
                      className="cursor-pointer transition-all duration-150"
                      onMouseEnter={() => setHoveredPointIndex(i)}
                    />
                    <text
                      x={pt.x}
                      y={chartHeight - 8}
                      textAnchor="middle"
                      fill="#64748B"
                      fontSize="10"
                      fontFamily="monospace"
                    >
                      {pt.date.split('-').slice(1).join('/')}
                    </text>
                  </g>
                );
              })}
            </svg>

            {hoveredPoint && (
              <div
                className="absolute pointer-events-none rounded-lg border border-slate-700 bg-slate-900/95 p-3 text-xs text-white shadow-xl backdrop-blur-md z-20 font-mono"
                style={{
                  left: `${(hoveredPoint.x / chartWidth) * 100}%`,
                  top: `${(hoveredPoint.y / chartHeight) * 70}%`,
                  transform: 'translate(-50%, -115%)',
                }}
              >
                <div className="flex items-center justify-between gap-3 font-bold text-blue-400">
                  <span>
                    {activeDomainFilter}: {hoveredPoint.score}%
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] ${
                      hoveredPoint.attempt.platform === 'ANDROID'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                    }`}
                  >
                    {hoveredPoint.attempt.platform || 'WEB'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 mt-0.5">
                  Date: {hoveredPoint.date} · Stress: {hoveredPoint.attempt.stressScore}/100
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Avg Dwell: {hoveredPoint.attempt.averageDwellSec}s · Duration:{' '}
                  {hoveredPoint.attempt.timeSpentMinutes}m
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          5. DOMAIN STRESS HEATMAP & BEHAVIORAL TELEMETRY
         ===================================================================== */}
      {(!isProgressSection || progressTab === 'domains' || progressTab === 'behavioral') && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">
                <Flame className="h-4 w-4" />
                <span>Behavioral Cognitive Friction & Domain Mastery</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Domain Stress & Latency Heatmap ({profile.behavioralArchetype.name})
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {profile.behavioralArchetype.recommendedStrategy}
              </p>
            </div>
            <button
              onClick={() => navigateTo('practice', 'diagnostic')}
              className="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 shrink-0"
            >
              Recalibrate Behavioral Archetype
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {domainStressData.map((d) => (
              <div
                key={d.id}
                className={`rounded-lg border p-4 transition-all ${
                  d.severity === 'high'
                    ? 'border-amber-300 bg-amber-50/50 dark:border-amber-900/60 dark:bg-amber-950/20'
                    : d.severity === 'medium'
                    ? 'border-slate-200 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-950/40'
                    : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                  <span>Weight: {d.weight}%</span>
                  <span
                    className={`font-mono font-bold text-xs ${
                      d.severity === 'high'
                        ? 'text-amber-600 dark:text-amber-400'
                        : d.severity === 'medium'
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {d.currentScore}% Accuracy
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                  {d.name}
                </h4>

                <div className="mt-3">
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-500 dark:text-slate-400">Stress Index:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {d.stressIndex}/100
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        d.severity === 'high'
                          ? 'bg-amber-500'
                          : d.severity === 'medium'
                          ? 'bg-blue-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, d.stressIndex)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="mt-2.5 text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                  <span>{d.status}</span>
                  {d.severity === 'high' && (
                    <span className="font-bold text-amber-600 dark:text-amber-400">
                      Study Priority
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
