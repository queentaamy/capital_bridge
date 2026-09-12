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
import type { EvidenceRecord } from '../../types';
import {
  runWhatIfScenario,
  PRESET_SCENARIOS,
  type ScenarioAdjustmentParams,
} from '../../services/scenarioEngine';

interface WhatIfSimulatorProps {
  profileId: string;
  records: EvidenceRecord[];
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  profileId,
  records,
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
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">What-If Scenario Simulator</h2>
            <span className="text-[10px] uppercase font-semibold bg-teal-500/10 text-teal-400 border border-teal-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Zap className="w-3 h-3" />
              <span>Deterministic</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Test business improvements before applying them to see exact before-and-after readiness score deltas.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-xl transition self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Simulation</span>
        </button>
      </div>

      {/* Preset Scenario Cards */}
      <div>
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
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
                className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${
                  isMatch
                    ? 'bg-teal-500/10 border-teal-500/40 text-teal-300 ring-1 ring-teal-500/30'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div>
                  <div className="font-semibold text-xs text-white mb-1 flex items-center justify-between">
                    <span>{preset.title}</span>
                    {isMatch && <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" />}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                    {preset.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Side-by-Side Comparison Display */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Left: Base Score (Before) */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-5 text-center relative">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
              Baseline (Ama's Seed)
            </span>
            <div className="text-4xl font-black text-slate-300 tabular-nums tracking-tight my-2">
              {scenarioResult.baseScore}
              <span className="text-sm font-normal text-slate-500">/1000</span>
            </div>
            <div className="text-xs text-slate-400 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Evidence Confidence: <strong>{scenarioResult.baseECI}%</strong></span>
            </div>
          </div>

          {/* Right: Projected Scenario Score (After) */}
          <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-5 text-center relative overflow-hidden shadow-lg shadow-emerald-500/5">
            <div className="absolute top-2 right-2">
              {scenarioResult.scoreDelta > 0 && (
                <span className="text-xs font-black bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                  <TrendingUp className="w-3 h-3" />
                  <span>+{scenarioResult.scoreDelta} PTS</span>
                </span>
              )}
            </div>

            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              Projected Outcome
            </span>
            <div className="text-4xl font-black text-white tabular-nums tracking-tight my-2">
              {scenarioResult.scenarioScore}
              <span className="text-sm font-normal text-slate-400">/1000</span>
            </div>
            <div className="text-xs text-emerald-300 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>
                Evidence Confidence: <strong>{scenarioResult.scenarioECI}%</strong>
                {scenarioResult.eciDelta > 0 && (
                  <span className="text-emerald-400 ml-1 font-bold">
                    (+{scenarioResult.eciDelta}%)
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Plain Language Explanation */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold text-teal-400 mb-1.5">
            <Sparkles className="w-4 h-4" />
            <span>Traceable Impact Analysis</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {scenarioResult.explanation}
          </p>

          {/* Key Drivers List */}
          {scenarioResult.keyDrivers.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {scenarioResult.keyDrivers.map((driver, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 text-xs bg-slate-950/60 border border-slate-800/80 px-3 py-2 rounded-lg text-slate-300"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                  <span>{driver}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Interactive Sliders & Controls */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-teal-400" />
          <span>Interactive Fine-Tuning Controls</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Control 1: Add Business Records Months */}
          <div className="space-y-2">
            <div className="flex items-center justify-between font-semibold">
              <span className="text-slate-300">Add Verified Sales Books (Months)</span>
              <span className="text-teal-400 tabular-nums">
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
              className="w-full accent-teal-400 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400">
              Closes documentation gap from March to May 2026.
            </p>
          </div>

          {/* Control 2: Reduce Monthly Debt */}
          <div className="space-y-2">
            <div className="flex items-center justify-between font-semibold">
              <span className="text-slate-300">Reduce Monthly Debt Obligation (GH₵)</span>
              <span className="text-teal-400 tabular-nums">
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
              className="w-full accent-teal-400 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400">
              Pays off remaining Advans MFI loan installments.
            </p>
          </div>

          {/* Control 3: Smooth Expense Volatility */}
          <div className="flex items-center justify-between p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
            <div>
              <div className="font-semibold text-slate-200">Smooth Bulk Supplier Expenses</div>
              <div className="text-[11px] text-slate-400">
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
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                params.smoothExpenseVolatility
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {params.smoothExpenseVolatility ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          {/* Control 4: Maintain Savings Discipline */}
          <div className="space-y-2">
            <div className="flex items-center justify-between font-semibold">
              <span className="text-slate-300">Maintain Susu Savings Streak (Weeks)</span>
              <span className="text-teal-400 tabular-nums">
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
              className="w-full accent-teal-400 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400">
              Extends weekly continuous thrift savings record.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
