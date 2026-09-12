import React from 'react';
import {
  X,
  Sparkles,
  Calculator,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  FileText,
} from 'lucide-react';
import type { IndicatorResult } from '../../types';

interface ExplainabilityModalProps {
  indicator: IndicatorResult | null;
  onClose: () => void;
  onRunScenario?: (indicatorKey: string) => void;
}

export const ExplainabilityModal: React.FC<ExplainabilityModalProps> = ({
  indicator,
  onClose,
  onRunScenario,
}) => {
  if (!indicator) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200/80 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-7 text-slate-800 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
          <Calculator className="w-4 h-4" />
          <span>Indicator Explainability</span>
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">{indicator.label}</h3>
        <p className="text-xs text-slate-500 leading-relaxed mb-6">
          {indicator.description}
        </p>

        {/* Score & Points Banner */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between mb-6">
          <div>
            <div className="text-[11px] text-slate-500 uppercase font-semibold">Normalized Score</div>
            <div className="text-3xl font-black text-slate-900 tabular-nums tracking-tight">
              {indicator.value}
              <span className="text-sm font-normal text-slate-400">/100</span>
            </div>
          </div>
          <div className="h-8 w-[1px] bg-slate-200" />
          <div>
            <div className="text-[11px] text-slate-500 uppercase font-semibold">Weight Contribution</div>
            <div className="text-lg font-bold text-emerald-700 tabular-nums">
              {(indicator.weight * 100).toFixed(0)}% ({indicator.pointsEarned} / {indicator.maxPoints} pts)
            </div>
          </div>
        </div>

        {/* Section 1: Mathematical Formula / Calculation Path */}
        <div className="space-y-4 mb-6">
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Traceable Calculation Path</span>
            </h4>
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 font-mono text-xs text-emerald-800 leading-relaxed">
              {indicator.calculationFormula}
            </div>
          </div>

          {/* Section 2: Contributing Consented Evidence */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              <span>Contributing Consented Evidence</span>
            </h4>
            {indicator.contributingEvidence.length > 0 ? (
              <ul className="space-y-1.5">
                {indicator.contributingEvidence.map((title, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 text-xs bg-slate-50 border border-slate-200/70 px-3.5 py-2 rounded-xl text-slate-700"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{title}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-xs text-slate-400 italic">
                No direct records submitted yet for this category.
              </div>
            )}
          </div>

          {/* Section 3: Gaps Identified */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Identified Gaps & Gating Factors</span>
            </h4>
            <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3.5 text-xs text-amber-800 leading-relaxed">
              {indicator.gapSummary}
            </div>
          </div>

          {/* Section 4: Practical Recommended Action */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Lightbulb className="w-3.5 h-3.5 text-emerald-600" />
              <span>Next Practical Step</span>
            </h4>
            <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-3.5 text-xs text-emerald-900 leading-relaxed">
              {indicator.recommendations[0]}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
          >
            Close
          </button>
          {onRunScenario && (
            <button
              onClick={() => {
                onClose();
                onRunScenario(indicator.key);
              }}
              className="px-4 py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition shadow-sm"
            >
              Test in What-If Simulator →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
