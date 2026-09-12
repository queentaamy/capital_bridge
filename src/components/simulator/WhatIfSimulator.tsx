import React, { useState } from 'react';
import {
  SlidersHorizontal,
  ArrowRight,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Check,
  RotateCcw,
  Zap,
} from 'lucide-react';
import type { EvidenceRecord, UserProfile } from '../../types';
import {
  runWhatIfScenario,
  PRESET_SCENARIOS,
  type ScenarioAdjustmentParams,
} from '../../services/scenarioEngine';

interface WhatIfSimulatorProps {
  profileId: string;
  records: EvidenceRecord[];
  profile?: UserProfile;
  onApplyScenario?: (params: ScenarioAdjustmentParams) => void;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  profileId,
  records,
  profile,
  onApplyScenario,
}) => {
  const [params, setParams] = useState<ScenarioAdjustmentParams>({
    addBusinessRecordsMonths: 0,
    reduceMonthlyDebtAmount: 0,
    smoothExpenseVolatility: false,
    maintainSavingsWeeks: 0,
  });

  const scenarioResult = runWhatIfScenario(profileId, records, params);

  const handleApplyPreset = (presetParams: ScenarioAdjustmentParams) => {
    setParams(presetParams);
  };

  const handleReset = () => {
    setParams({
      addBusinessRecordsMonths: 0,
      reduceMonthlyDebtAmount: 0,
      smoothExpenseVolatility: false,
      maintainSavingsWeeks: 0,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">What-If Scenario Simulator</h2>
            <span className="text-[10px] uppercase font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Zap className="w-3 h-3 text-emerald-600" />
              <span>Deterministic Math</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Test business improvements before applying them to see exact before-and-after readiness score deltas.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200/80 px-3.5 py-2 rounded-xl transition shadow-xs font-semibold self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span>Reset Simulation</span>
        </button>
      </div>

      {/* Preset Scenario Cards */}
      <div>
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5">
          One-Click Demo Presets
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PRESET_SCENARIOS.map((preset) => {
            const isMatch =
              params.addBusinessRecordsMonths === preset.params.addBusinessRecordsMonths &&
              params.reduceMonthlyDebtAmount === preset.params.reduceMonthlyDebtAmount &&
              params.smoothExpenseVolatility === preset.params.smoothExpenseVolatility &&
              params.maintainSavingsWeeks === preset.params.maintainSavingsWeeks;

            return (
              <button
                key={preset.id}
                onClick={() => handleApplyPreset(preset.params)}
                className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between shadow-xs ${
                  isMatch
                    ? 'bg-emerald-50/80 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20 shadow-sm'
                    : 'bg-white border-slate-200/80 hover:border-emerald-300 text-slate-700 hover:bg-slate-50/50'
                }`}
              >
                <div>
                  <div className="font-bold text-xs text-slate-900 mb-1 flex items-center justify-between">
                    <span>{preset.title}</span>
                    {isMatch && <Check className="w-4 h-4 text-emerald-600 shrink-0 font-bold" />}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                    {preset.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Side-by-Side Comparison Display */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-4 sm:p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-center">
          {/* Left: Base Score (Before) */}
          <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-5 sm:p-6 text-center relative">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-white border border-slate-200 px-2.5 py-0.5 rounded-full shadow-xs">
              {profile ? `Baseline (${profile.name.split(' ')[0]})` : "Baseline (Ama's Seed)"}
            </span>
            <div className="text-4xl sm:text-5xl font-black text-slate-900 tabular-nums tracking-tight my-2.5">
              {scenarioResult.baseScore}
              <span className="text-sm font-normal text-slate-400">/1000</span>
            </div>
            <div className="text-xs text-slate-600 flex items-center justify-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Evidence Confidence: <strong className="text-slate-800">{scenarioResult.baseECI}%</strong></span>
            </div>
          </div>

          {/* Right: Projected Scenario Score (After) */}
          <div className="bg-emerald-50/50 border-2 border-emerald-500/40 rounded-2xl p-5 sm:p-6 pt-10 sm:pt-6 text-center relative overflow-hidden shadow-sm">
            <div className="absolute top-3 right-3">
              {scenarioResult.scoreDelta > 0 && (
                <span className="text-xs font-black bg-emerald-600 text-white px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs animate-pulse">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+{scenarioResult.scoreDelta} PTS</span>
                </span>
              )}
            </div>

            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-white border border-emerald-200 px-2.5 py-0.5 rounded-full shadow-xs">
              Projected Outcome
            </span>
            <div className="text-4xl sm:text-5xl font-black text-emerald-900 tabular-nums tracking-tight my-2.5">
              {scenarioResult.scenarioScore}
              <span className="text-sm font-normal text-emerald-600/70">/1000</span>
            </div>
            <div className="text-xs text-emerald-800 flex items-center justify-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>
                Evidence Confidence: <strong className="text-emerald-950">{scenarioResult.scenarioECI}%</strong>
                {scenarioResult.eciDelta > 0 && (
                  <span className="text-emerald-700 ml-1 font-bold">
                    (+{scenarioResult.eciDelta}%)
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Plain Language Explanation */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 mb-1.5">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Traceable Impact Analysis</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            {scenarioResult.explanation}
          </p>

          {/* Key Drivers List */}
          {scenarioResult.keyDrivers.length > 0 && (
            <div className="mt-3.5 space-y-1.5">
              {scenarioResult.keyDrivers.map((driver, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 text-xs bg-slate-50 border border-slate-200/70 px-3.5 py-2.5 rounded-xl text-slate-700 font-medium"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{driver}</span>
                </div>
              ))}
            </div>
          )}

          {/* Action CTA: Apply to Active Profile */}
          {onApplyScenario && scenarioResult.scoreDelta > 0 && (
            <div className="mt-6 p-4 sm:p-5 bg-emerald-50 border border-emerald-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-emerald-950 block">
                  Simulated Readiness Boost Ready
                </span>
                <span className="text-[11px] text-emerald-800/80 font-medium">
                  Instantly commit these improvements to your active dashboard and Financial Passport.
                </span>
              </div>
              <button
                onClick={() => onApplyScenario(params)}
                className="inline-flex items-center justify-center gap-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl transition shadow-sm active:scale-95 w-full sm:w-auto shrink-0"
              >
                <Check className="w-4 h-4" />
                <span>Apply +{scenarioResult.scoreDelta} PTS to My Profile</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Sliders & Controls */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-4 sm:p-7 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
        <h3 className="text-sm font-bold text-slate-900 mb-5 flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
          <span>Interactive Fine-Tuning Controls</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Control 1: Add Business Records Months */}
          <div className="space-y-2.5 bg-slate-50/70 border border-slate-200/70 p-4 rounded-2xl">
            <div className="flex items-center justify-between font-bold">
              <span className="text-slate-800">Add Verified Sales Books (Months)</span>
              <span className="text-emerald-700 tabular-nums">
                +{params.addBusinessRecordsMonths} Months
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="6"
              step="1"
              value={params.addBusinessRecordsMonths}
              onChange={(e) =>
                setParams({
                  ...params,
                  addBusinessRecordsMonths: Number(e.target.value),
                })
              }
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <p className="text-[11px] text-slate-500">
              Closes documentation gap to achieve full 6-month observation window.
            </p>
          </div>

          {/* Control 2: Reduce Monthly Debt */}
          <div className="space-y-2.5 bg-slate-50/70 border border-slate-200/70 p-4 rounded-2xl">
            <div className="flex items-center justify-between font-bold">
              <span className="text-slate-800">Reduce Monthly Debt Obligation (GH₵)</span>
              <span className="text-emerald-700 tabular-nums">
                -GH₵ {params.reduceMonthlyDebtAmount}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="500"
              step="100"
              value={params.reduceMonthlyDebtAmount}
              onChange={(e) =>
                setParams({
                  ...params,
                  reduceMonthlyDebtAmount: Number(e.target.value),
                })
              }
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <p className="text-[11px] text-slate-500">
              Reduces or pays off monthly debt service installments to unlock debt capacity.
            </p>
          </div>

          {/* Control 3: Smooth Expense Volatility */}
          <div className="flex items-center justify-between p-4 bg-slate-50/70 border border-slate-200/70 rounded-2xl">
            <div>
              <div className="font-bold text-slate-800">Smooth Bulk Supplier Expenses</div>
              <div className="text-[11px] text-slate-500">
                Split large batch inventory outlays to reduce weekly cash dips.
              </div>
            </div>
            <button
              onClick={() =>
                setParams({
                  ...params,
                  smoothExpenseVolatility: !params.smoothExpenseVolatility,
                })
              }
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-xs ${
                params.smoothExpenseVolatility
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {params.smoothExpenseVolatility ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          {/* Control 4: Maintain Savings Discipline */}
          <div className="space-y-2.5 bg-slate-50/70 border border-slate-200/70 p-4 rounded-2xl">
            <div className="flex items-center justify-between font-bold">
              <span className="text-slate-800">Maintain Susu Savings Streak (Weeks)</span>
              <span className="text-emerald-700 tabular-nums">
                +{params.maintainSavingsWeeks} Weeks
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="12"
              step="2"
              value={params.maintainSavingsWeeks}
              onChange={(e) =>
                setParams({
                  ...params,
                  maintainSavingsWeeks: Number(e.target.value),
                })
              }
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <p className="text-[11px] text-slate-500">
              Extends weekly continuous thrift savings record.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
