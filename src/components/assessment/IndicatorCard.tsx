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
          badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
          barColor: 'bg-emerald-600',
        };
      case 'good':
        return {
          label: 'Healthy',
          badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
          barColor: 'bg-emerald-500',
        };
      case 'moderate':
        return {
          label: 'Moderate',
          badge: 'bg-amber-50 text-amber-700 border-amber-200/80',
          barColor: 'bg-amber-500',
        };
      case 'gap':
        return {
          label: 'Gap Identified',
          badge: 'bg-rose-50 text-rose-700 border-rose-200/80',
          barColor: 'bg-rose-500',
        };
    }
  };

  const styling = getLevelBadge(indicator.level);

  return (
    <div
      onClick={() => onInspect(indicator)}
      className="bg-white hover:bg-slate-50/60 border border-slate-200/80 hover:border-slate-300 rounded-3xl p-5 sm:p-6 transition cursor-pointer flex flex-col justify-between group shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-md"
    >
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 group-hover:bg-emerald-100 transition">
              {renderIndicatorIcon(indicator.key)}
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition">
                {indicator.label}
              </h4>
              <div className="text-[11px] text-slate-400 font-medium">
                Weight: {(indicator.weight * 100).toFixed(0)}% ({indicator.maxPoints} pts max)
              </div>
            </div>
          </div>

          <div
            className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold flex items-center gap-1 ${styling.badge}`}
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
            <span className="text-2xl font-black text-slate-900 tabular-nums tracking-tight">
              {indicator.value}
              <span className="text-xs font-normal text-slate-400">/100</span>
            </span>
            <span className="text-xs font-bold text-emerald-700 tabular-nums">
              +{indicator.pointsEarned} pts to score
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className={`${styling.barColor} h-full rounded-full transition-all duration-700`}
              style={{ width: `${indicator.value}%` }}
            />
          </div>
        </div>

        {/* Summary Snippet */}
        <p className="text-xs text-slate-500 line-clamp-2 mt-2 leading-relaxed">
          {indicator.level === 'gap' || indicator.level === 'moderate'
            ? indicator.gapSummary
            : indicator.strengths[0]}
        </p>
      </div>

      {/* Footer Action */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 group-hover:text-emerald-700 font-medium transition">
        <span>Inspect calculation path</span>
        <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition text-slate-400 group-hover:text-emerald-600" />
      </div>
    </div>
  );
};
