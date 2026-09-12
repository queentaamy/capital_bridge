import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  FileSpreadsheet,
  Coins,
  Scale,
  Building,
  FileCheck,
} from 'lucide-react';
import type { IndicatorKey, IndicatorResult, IndicatorLevel } from '../../types';

interface IndicatorCardProps {
  indicator: IndicatorResult;
  onInspect: (indicator: IndicatorResult) => void;
}

function renderIndicatorIcon(key: IndicatorKey) {
  switch (key) {
    case 'income_consistency':
      return <TrendingUp className="w-4 h-4" />;
    case 'cashflow_stability':
      return <Coins className="w-4 h-4" />;
    case 'savings_behaviour':
      return <FileSpreadsheet className="w-4 h-4" />;
    case 'debt_burden':
      return <Scale className="w-4 h-4" />;
    case 'business_activity':
      return <Building className="w-4 h-4" />;
    case 'documentation_completeness':
      return <FileCheck className="w-4 h-4" />;
  }
}

export const IndicatorCard: React.FC<IndicatorCardProps> = ({
  indicator,
  onInspect,
}) => {
  const getLevelBadge = (level: IndicatorLevel) => {
    switch (level) {
      case 'excellent':
        return {
          label: 'Strong',
          badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          barColor: 'bg-emerald-500',
        };
      case 'good':
        return {
          label: 'Healthy',
          badge: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
          barColor: 'bg-teal-500',
        };
      case 'moderate':
        return {
          label: 'Moderate',
          badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          barColor: 'bg-amber-500',
        };
      case 'gap':
        return {
          label: 'Gap Identified',
          badge: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
          barColor: 'bg-rose-500',
        };
    }
  };

  const styling = getLevelBadge(indicator.level);

  return (
    <div
      onClick={() => onInspect(indicator)}
      className="bg-slate-900/70 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 transition cursor-pointer flex flex-col justify-between group shadow-sm"
    >
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-800 border border-slate-700/70 text-slate-300 group-hover:text-emerald-400 group-hover:border-emerald-500/30 transition">
              {renderIndicatorIcon(indicator.key)}
            </div>
            <div>
              <h4 className="font-semibold text-slate-200 text-sm group-hover:text-white transition">
                {indicator.label}
              </h4>
              <div className="text-[11px] text-slate-400">
                Weight: {(indicator.weight * 100).toFixed(0)}% ({indicator.maxPoints} pts max)
              </div>
            </div>
          </div>

          <div
            className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold flex items-center gap-1 ${styling.badge}`}
          >
            {indicator.level === 'gap' ? (
              <AlertTriangle className="w-3 h-3" />
            ) : (
              <CheckCircle2 className="w-3 h-3" />
            )}
            <span>{styling.label}</span>
          </div>
        </div>

        {/* Score and Bar */}
        <div className="my-3">
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-2xl font-black text-white tabular-nums tracking-tight">
              {indicator.value}
              <span className="text-xs font-normal text-slate-400">/100</span>
            </span>
            <span className="text-xs font-semibold text-emerald-400 tabular-nums">
              +{indicator.pointsEarned} pts to score
            </span>
          </div>
          <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden">
            <div
              className={`${styling.barColor} h-full rounded-full transition-all duration-700`}
              style={{ width: `${indicator.value}%` }}
            />
          </div>
        </div>

        {/* Summary Snippet */}
        <p className="text-xs text-slate-400 line-clamp-2 mt-2 leading-relaxed">
          {indicator.level === 'gap' || indicator.level === 'moderate'
            ? indicator.gapSummary
            : indicator.strengths[0]}
        </p>
      </div>

      {/* Footer Action */}
      <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400 group-hover:text-emerald-400 transition">
        <span>Inspect calculation path</span>
        <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
      </div>
    </div>
  );
};
