import React from 'react';
import { DOMAIN_STRESS_STATS, DomainStressStat } from '../data/historicalScores';
import { AlertTriangle, CheckCircle, Clock, Zap, ArrowRight } from 'lucide-react';

interface DomainStressHeatmapProps {
  onPracticeDomain?: (domainId: string) => void;
}

export const DomainStressHeatmap: React.FC<DomainStressHeatmapProps> = ({ onPracticeDomain }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-400" />
            Cognitive Stress & Domain Readiness Heatmap
          </h3>
          <p className="text-xs text-slate-400">
            Real-time biometric latency tracking highlighting domains with option-hesitation or accuracy dips
          </p>
        </div>
        <div className="flex items-center space-x-3 text-[11px] font-semibold">
          <span className="flex items-center text-emerald-400 gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> Optimal (&gt;75%)
          </span>
          <span className="flex items-center text-amber-400 gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400" /> Moderate Hesitation
          </span>
          <span className="flex items-center text-rose-400 gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-400" /> High Stress
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {DOMAIN_STRESS_STATS.map(stat => {
          const isHigh = stat.stressLevel === 'HIGH_STRESS';
          const isMod = stat.stressLevel === 'MODERATE';

          const borderBg = isHigh
            ? 'border-rose-500/40 bg-rose-500/5 hover:border-rose-500/60'
            : isMod
            ? 'border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50'
            : 'border-slate-800 bg-slate-900/60 hover:border-slate-700';

          const badgeColor = isHigh
            ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
            : isMod
            ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
            : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';

          return (
            <div
              key={stat.domainId}
              className={`p-3.5 rounded-xl border transition-all ${borderBg} flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-md bg-slate-800 text-[10px] font-bold text-slate-300 flex items-center justify-center shrink-0">
                      D{stat.orderNumber}
                    </span>
                    <h4 className="text-xs font-bold text-slate-200 leading-snug">
                      {stat.domainName}
                    </h4>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase shrink-0 ${badgeColor}`}>
                    {stat.stressLevel.replace('_', ' ')}
                  </span>
                </div>

                {/* Accuracy Bar */}
                <div className="space-y-1 mb-2">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Mastery Accuracy</span>
                    <span className="font-bold text-slate-200">{stat.averageAccuracy}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        stat.averageAccuracy >= 80
                          ? 'bg-emerald-500'
                          : stat.averageAccuracy >= 70
                          ? 'bg-blue-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${stat.averageAccuracy}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3 text-slate-500" />
                    Latency: {stat.averageLatencySeconds}s/q
                  </span>
                  <span className="font-mono text-slate-400">
                    Switches: {stat.hesitationCount} hesitations
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed italic bg-slate-950/40 p-2 rounded-lg border border-slate-800/80">
                  "{stat.recommendation}"
                </p>
              </div>

              {onPracticeDomain && (
                <button
                  onClick={() => onPracticeDomain(stat.domainId)}
                  className="mt-3 w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 text-blue-400 hover:text-blue-300 font-semibold text-[11px] flex items-center justify-center gap-1 transition-colors"
                >
                  <span>Targeted Domain Drill</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
