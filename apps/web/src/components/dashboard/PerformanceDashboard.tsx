import React, { useState } from 'react';
import { useCertMaster } from '../../context/CertMasterContext';
import { CISSP_DOMAINS } from '../../data/examBanks';
import { CISSP_EXAM_QUESTIONS } from '../../data/cisspQuestions';
import {
  TrendingUp,
  Brain,
  Activity,
  Play,
  RotateCcw,
  Smartphone,
  Shield,
  Layers,
  Sparkles,
  ArrowUpRight,
  AlertTriangle,
  Flame,
} from 'lucide-react';

export const PerformanceDashboard: React.FC = () => {
  const {
    profile,
    historicalAttempts,
    startExamSession,
    setActiveTab,
    setIsSyncModalOpen,
    simulateAndroidExamCompletion,
    isSyncing,
    isCloudConnected,
  } = useCertMaster();

  const [activeDomainFilter, setActiveDomainFilter] = useState<string>('Overall Score');
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  // Domains available for individual curve plotting
  const domainOptions = [
    'Overall Score',
    'Security & Risk Management',
    'Asset Security',
    'Security Architecture & Engineering',
    'Communication & Network Security',
    'Identity & Access Management (IAM)',
    'Security Assessment & Testing',
    'Security Operations',
    'Software Development Security',
  ];

  // Prepare chart coordinates (SVG 600 x 240)
  const chartWidth = 640;
  const chartHeight = 220;
  const paddingX = 40;
  const paddingY = 30;

  const points = historicalAttempts.map((attempt, index) => {
    let score = attempt.scorePercent;
    if (activeDomainFilter !== 'Overall Score' && attempt.domainScores[activeDomainFilter] !== undefined) {
      score = attempt.domainScores[activeDomainFilter];
    }

    const x = paddingX + (index / (historicalAttempts.length - 1 || 1)) * (chartWidth - paddingX * 2);
    // score 0% to 100% -> y from chartHeight - paddingY to paddingY
    const y = chartHeight - paddingY - (score / 100) * (chartHeight - paddingY * 2);

    return { x, y, score, date: attempt.date, id: attempt.id, attempt };
  });

  // Calculate smooth SVG Bézier curve path
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
  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`
    : '';

  const hoveredPoint = hoveredPointIndex !== null ? points[hoveredPointIndex] : null;

  // Domain Stress Heatmap calculation
  // Low accuracy (<70%) or high latency = High stress
  const domainStressData = CISSP_DOMAINS.map((domain) => {
    const latestAttempt = historicalAttempts[historicalAttempts.length - 1];
    const score = latestAttempt ? latestAttempt.domainScores[domain.name] || 72 : 72;
    // Calculate stress index for domain (0 - 100)
    const domainStress = Math.round(100 - score + (profile.cognitiveStressBaseline * 0.35));
    const isHighStress = domainStress >= 65;
    const isMediumStress = domainStress >= 50 && domainStress < 65;

    return {
      id: domain.id,
      name: domain.name,
      weight: domain.weight,
      currentScore: score,
      stressIndex: domainStress,
      status: isHighStress ? 'High Latency / High Stress' : isMediumStress ? 'Moderate Stress' : 'Optimal Competency',
      severity: isHighStress ? 'high' : isMediumStress ? 'medium' : 'low',
    };
  });

  return (
    <div className="space-y-6">
      {/* Hero Strip with Platform State */}
      <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm transition-colors">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 p-6 sm:p-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 mb-2">
              <Shield className="h-4 w-4" />
              <span>CertMaster Central Cloud Hub</span>
              <span>·</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono">Real-Time Android Sync Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Executive Performance & Cognitive Intelligence
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Unified telemetry across 112 subject banks. Synchronized in real time with your Android companion app, tracking multi-domain Bézier score velocity, cognitive stress indices, and empirical dwell times.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  startExamSession('cissp', CISSP_EXAM_QUESTIONS, 180);
                  setActiveTab('simulator');
                }}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Launch CISSP Simulation</span>
              </button>

              <button
                onClick={() => setActiveTab('assessment')}
                className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <Brain className="h-3.5 w-3.5 text-blue-500" />
                <span>Recalibrate Archetype</span>
              </button>

              <button
                onClick={() => setIsSyncModalOpen(true)}
                className="flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300 transition-colors"
              >
                <Smartphone className="h-3.5 w-3.5 text-emerald-500" />
                <span>Android Integration & Sync Bridge</span>
              </button>

              <button
                onClick={() => simulateAndroidExamCompletion()}
                disabled={isSyncing}
                className="flex items-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-300 transition-colors disabled:opacity-50"
              >
                <RotateCcw className={`h-3.5 w-3.5 text-blue-500 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Simulate Android Exam Sync</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Capsule */}
          <div className="grid grid-cols-2 gap-3 w-full lg:w-auto shrink-0">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-950/50">
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Baseline Readiness</div>
              <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 font-mono tabular-nums">
                {profile.assessmentScorePercent}%
              </div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-mono">
                {isCloudConnected ? 'Cloud Firestore Live' : 'Hybrid Cloud Cache'}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-950/50">
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Stress Baseline</div>
              <div className="text-2xl font-extrabold text-amber-500 font-mono tabular-nums">
                {profile.cognitiveStressBaseline}/100
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {profile.behavioralArchetype.name}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Domain Interactive Bézier Performance Chart */}
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

          {/* Domain Filter Dropdown */}
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

        {/* SVG Bézier Curve Visualization */}
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

            {/* Horizontal Grid Lines */}
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

            {/* Area fill under curve */}
            {areaPath && <path d={areaPath} fill="url(#curveGradient)" />}

            {/* Bézier Line */}
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

            {/* Interactive Data Points */}
            {points.map((pt, i) => {
              const isHovered = hoveredPointIndex === i;
              const isAndroidOrigin = pt.attempt.platform === 'ANDROID';

              return (
                <g key={pt.id}>
                  {/* Outer scrub ring */}
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
                  {/* Date label */}
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

          {/* Scrubbable Hover Tooltip */}
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
                <span>{activeDomainFilter}: {hoveredPoint.score}%</span>
                <span className={`px-1.5 py-0.5 rounded text-[9px] ${
                  hoveredPoint.attempt.platform === 'ANDROID'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                }`}>
                  {hoveredPoint.attempt.platform || 'WEB'}
                </span>
              </div>
              <div className="text-[11px] text-slate-300 mt-0.5">
                Date: {hoveredPoint.date} · Stress: {hoveredPoint.attempt.stressScore}/100
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Avg Dwell: {hoveredPoint.attempt.averageDwellSec}s · Duration: {hoveredPoint.attempt.timeSpentMinutes}m
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-blue-600"></span>
              <span>Score Trajectory ({activeDomainFilter})</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              <span>70% Passing Threshold Benchmark</span>
            </span>
          </div>
          <div className="text-[11px]">
            Hover data points to scrub granular cognitive metrics
          </div>
        </div>
      </div>

      {/* Domain Stress Heatmap */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">
              <Flame className="h-4 w-4" />
              <span>Behavioral Cognitive Friction</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Domain Stress & Latency Heatmap
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Identifies domains where excessive question dwell time, distractor hesitation, or low accuracy create testing vulnerability.
            </p>
          </div>
        </div>

        {/* Heatmap Grid */}
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

              {/* Stress Level Bar */}
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
                  <span className="font-bold text-amber-600 dark:text-amber-400">Study Priority</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
