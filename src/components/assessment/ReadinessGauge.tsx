import React from 'react';
import { CheckCircle2, Info, Sparkles } from 'lucide-react';
import type { ReadinessBand } from '../../types';

interface ReadinessGaugeProps {
  score: number; // 0 - 1000
  band: ReadinessBand;
  bandDescription: string;
  methodologyVersion: string;
}

export const ReadinessGauge: React.FC<ReadinessGaugeProps> = ({
  score,
  band,
  bandDescription,
  methodologyVersion,
}) => {
  // Semi-circular or circular progress calculations
  const normalized = Math.min(1000, Math.max(0, score));
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  // Use a 270-degree arc for high visual drama
  const strokeDashoffset = circumference - (normalized / 1000) * (circumference * 0.75);

  const getBandColor = (band: ReadinessBand) => {
    switch (band) {
      case 'Prime Ready':
        return { text: 'text-emerald-400', stroke: '#10b981', bg: 'bg-emerald-500/10 border-emerald-500/30' };
      case 'Capital Ready':
        return { text: 'text-teal-400', stroke: '#14b8a6', bg: 'bg-teal-500/10 border-teal-500/30' };
      case 'Near Ready':
        return { text: 'text-amber-400', stroke: '#f59e0b', bg: 'bg-amber-500/10 border-amber-500/30' };
      default:
        return { text: 'text-rose-400', stroke: '#f43f5e', bg: 'bg-rose-500/10 border-rose-500/30' };
    }
  };

  const colors = getBandColor(band);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xl">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-white text-base">Financial Readiness Score</h3>
            <span className="text-[10px] text-slate-400 border border-slate-700 bg-slate-800 px-2 py-0.5 rounded-full">
              {methodologyVersion}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Deterministic evaluation of 6 normalized evidence indicators
          </p>
        </div>
        <div className={`px-3 py-1 rounded-full border text-xs font-semibold flex items-center gap-1.5 ${colors.bg} ${colors.text}`}>
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{band}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6 my-2">
        {/* Gauge Graphic */}
        <div className="relative w-44 h-44 flex items-center justify-center shrink-0">
          <svg className="w-full h-full -rotate-135 transform" viewBox="0 0 200 200">
            {/* Background Arc */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="transparent"
              stroke="#1e293b"
              strokeWidth="14"
              strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
              strokeLinecap="round"
            />
            {/* Progress Arc */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="transparent"
              stroke={colors.stroke}
              strokeWidth="14"
              strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          {/* Central Score Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-4xl font-black tracking-tight text-white tabular-nums">
              {score}
            </span>
            <span className="text-xs text-slate-400 font-medium">out of 1000</span>
          </div>
        </div>

        {/* Score Context & Explanation */}
        <div className="flex-1 space-y-3">
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5">
            <div className="text-xs font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>Assessment Summary</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {bandDescription}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-800/40 border border-slate-800 p-2.5 rounded-lg">
              <div className="text-[10px] text-slate-400 uppercase font-medium">Target Benchmark</div>
              <div className="text-sm font-bold text-slate-200 mt-0.5">700+ for MFI loans</div>
            </div>
            <div className="bg-slate-800/40 border border-slate-800 p-2.5 rounded-lg">
              <div className="text-[10px] text-slate-400 uppercase font-medium">Capital Feasibility</div>
              <div className="text-sm font-bold text-emerald-400 mt-0.5">High (GH₵8,000)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Traceability Note */}
      <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center gap-2 text-[11px] text-slate-400">
        <Info className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        <span>
          Every point is traceable to verified mobile money inflows, Susu records, and commercial receipts.
        </span>
      </div>
    </div>
  );
};
