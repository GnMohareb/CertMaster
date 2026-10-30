import React, { useState } from 'react';
import { HistoricalSessionPoint } from '../data/historicalScores';

interface PerformanceLineChartProps {
  sessions: HistoricalSessionPoint[];
}

export const PerformanceLineChart: React.FC<PerformanceLineChartProps> = ({ sessions }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<string>('overall');

  if (!sessions || sessions.length === 0) {
    return <div className="text-slate-400 text-xs py-10 text-center">No simulation telemetry recorded yet.</div>;
  }

  const width = 640;
  const height = 240;
  const paddingX = 40;
  const paddingY = 30;

  const innerWidth = width - paddingX * 2;
  const innerHeight = height - paddingY * 2;

  // Domain labels and keys
  const domainKeys = [
    { key: 'overall', label: 'Overall Simulation Score', color: '#3B82F6' },
    { key: 'd1', label: 'Security & Risk', color: '#10B981' },
    { key: 'd2', label: 'Asset Security', color: '#06B6D4' },
    { key: 'd3', label: 'Security Architecture', color: '#EC4899' },
    { key: 'd4', label: 'Network Security', color: '#F59E0B' },
    { key: 'd5', label: 'IAM', color: '#8B5CF6' }
  ];

  const getScoreForPoint = (session: HistoricalSessionPoint, key: string) => {
    if (key === 'overall') return session.overallScore;
    return session.domainBreakdown[key] ?? session.overallScore;
  };

  // Convert points to SVG coordinates
  const points = sessions.map((sess, i) => {
    const x = paddingX + (i / (sessions.length - 1)) * innerWidth;
    const score = getScoreForPoint(sess, selectedDomain);
    const y = paddingY + innerHeight - (score / 100) * innerHeight;
    return { x, y, score, session: sess };
  });

  // Calculate smooth Bézier curve command
  const createSmoothPath = (pts: Array<{ x: number; y: number }>) => {
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;

    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = i > 0 ? pts[i - 1] : pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = i < pts.length - 2 ? pts[i + 2] : p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;

      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return path;
  };

  const linePath = createSmoothPath(points);
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  const activeDomainInfo = domainKeys.find(d => d.key === selectedDomain) || domainKeys[0];
  const passingLineY = paddingY + innerHeight - (70 / 100) * innerHeight;

  return (
    <div className="space-y-4">
      {/* Domain Selector Pills */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] text-slate-400 font-semibold mr-1">Telemetry Domain:</span>
        {domainKeys.map(d => (
          <button
            key={d.key}
            onClick={() => setSelectedDomain(d.key)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center space-x-1.5 ${
              selectedDomain === d.key
                ? 'bg-slate-800 text-white border border-slate-600 shadow-sm'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
            <span>{d.label}</span>
          </button>
        ))}
      </div>

      {/* SVG Canvas Chart */}
      <div className="relative rounded-2xl bg-slate-950/80 border border-slate-800 p-4">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={activeDomainInfo.color} stopOpacity="0.35" />
              <stop offset="100%" stopColor={activeDomainInfo.color} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[100, 75, 50, 25, 0].map(val => {
            const y = paddingY + innerHeight - (val / 100) * innerHeight;
            return (
              <g key={val}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="#334155"
                  strokeDasharray="4 4"
                  strokeWidth="0.8"
                />
                <text
                  x={paddingX - 8}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="9"
                  fill="#64748B"
                  fontFamily="monospace"
                >
                  {val}%
                </text>
              </g>
            );
          })}

          {/* 70% Passing Threshold Line */}
          <line
            x1={paddingX}
            y1={passingLineY}
            x2={width - paddingX}
            y2={passingLineY}
            stroke="#10B981"
            strokeWidth="1.5"
            strokeDasharray="5 5"
          />
          <text
            x={width - paddingX - 4}
            y={passingLineY - 4}
            textAnchor="end"
            fontSize="9"
            fontWeight="bold"
            fill="#10B981"
          >
            PASS THRESHOLD 70%
          </text>

          {/* Area Fill */}
          <path d={areaPath} fill="url(#chartGradient)" />

          {/* Bézier Line Curve */}
          <path
            d={linePath}
            fill="none"
            stroke={activeDomainInfo.color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {points.map((pt, idx) => {
            const isHovered = hoveredIdx === idx;
            return (
              <g key={idx}>
                {/* Vertical hover indicator */}
                {isHovered && (
                  <line
                    x1={pt.x}
                    y1={paddingY}
                    x2={pt.x}
                    y2={height - paddingY}
                    stroke="#94A3B8"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                )}

                {/* Point circle */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 6 : 4}
                  fill={isHovered ? '#FFFFFF' : activeDomainInfo.color}
                  stroke="#0F172A"
                  strokeWidth="2"
                  className="cursor-pointer transition-all duration-150"
                  onMouseEnter={() => setHoveredIdx(idx)}
                />

                {/* Date labels on X-axis */}
                <text
                  x={pt.x}
                  y={height - paddingY + 16}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="600"
                  fill={isHovered ? '#F8FAFC' : '#64748B'}
                >
                  {pt.session.dateStr}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Scrub Tooltip Card */}
        {hoveredIdx !== null && (
          <div
            className="absolute z-20 pointer-events-none p-3 rounded-xl bg-slate-900 border border-slate-700 shadow-xl text-xs space-y-1 transform -translate-x-1/2 -translate-y-full"
            style={{
              left: `${(points[hoveredIdx].x / width) * 100}%`,
              top: `${Math.max(20, (points[hoveredIdx].y / height) * 100 - 15)}%`
            }}
          >
            <div className="flex items-center justify-between space-x-3 border-b border-slate-800 pb-1">
              <span className="font-bold text-white">{points[hoveredIdx].session.dateStr} Simulation</span>
              <span
                className={`font-mono font-bold px-1.5 py-0.5 rounded text-[10px] ${
                  points[hoveredIdx].score >= 70 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                }`}
              >
                {points[hoveredIdx].score}% {points[hoveredIdx].score >= 70 ? 'PASSED' : 'DEFICIT'}
              </span>
            </div>
            <div className="text-[11px] text-slate-300 pt-0.5">
              <span>Domain Metric: </span>
              <span className="font-bold text-white">{activeDomainInfo.label}</span>
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 pt-1">
              <span>Elapsed: {points[hoveredIdx].session.durationMins}m</span>
              <span>Stress Factor: {points[hoveredIdx].session.stressFactor}/100</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
