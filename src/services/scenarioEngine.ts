// ============================================================================
// CapitalBridge Scenario & What-If Engine
// Principle: What-if simulates deterministic adjustments without LLM arithmetic.
// ============================================================================

import type { EvidenceRecord, IndicatorKey, WhatIfScenarioResult } from '../types';
import { calculateAssessment } from './assessmentEngine';

export interface ScenarioAdjustmentParams {
  addBusinessRecordsMonths: number; // 0 to 6
  reduceMonthlyDebtAmount: number; // 0 to 500
  smoothExpenseVolatility: boolean;
  maintainSavingsWeeks: number; // 0 to 12
}

export const PRESET_SCENARIOS = [
  {
    id: 'sc_add_books',
    title: 'Add 3 Months Sales Ledgers',
    description: 'Submit reconstructed sales & invoice records for March - May 2026',
    params: {
      addBusinessRecordsMonths: 3,
      reduceMonthlyDebtAmount: 0,
      smoothExpenseVolatility: false,
      maintainSavingsWeeks: 0,
    },
  },
  {
    id: 'sc_clear_debt',
    title: 'Pay Off Advans Micro-Loan',
    description: 'Clear remaining GH₵1,000 balance to eliminate GH₵500/mo obligation',
    params: {
      addBusinessRecordsMonths: 0,
      reduceMonthlyDebtAmount: 500,
      smoothExpenseVolatility: false,
      maintainSavingsWeeks: 0,
    },
  },
  {
    id: 'sc_smooth_cashflow',
    title: 'Smooth Supplier Outlays',
    description: 'Split bulk weekly wholesale payments into staggered bi-weekly schedules',
    params: {
      addBusinessRecordsMonths: 0,
      reduceMonthlyDebtAmount: 0,
      smoothExpenseVolatility: true,
      maintainSavingsWeeks: 0,
    },
  },
  {
    id: 'sc_prime_ready',
    title: 'Combined Prime Readiness Path',
    description: 'Add 3 months books + clear loan + smooth supplier outlays',
    params: {
      addBusinessRecordsMonths: 3,
      reduceMonthlyDebtAmount: 500,
      smoothExpenseVolatility: true,
      maintainSavingsWeeks: 8,
    },
  },
];

export function runWhatIfScenario(
  profileId: string,
  records: EvidenceRecord[],
  params: ScenarioAdjustmentParams
): WhatIfScenarioResult {
  // 1. Calculate Base Assessment (Baseline Ama: 742 score, 86% ECI)
  const base = calculateAssessment(profileId, records);

  // 2. Calculate Scenario Assessment with adjustments
  const scenario = calculateAssessment(profileId, records, params);

  // 3. Compute indicator differences
  const changedIndicators: WhatIfScenarioResult['changedIndicators'] = [];
  const keyDrivers: string[] = [];

  (Object.keys(base.indicators) as IndicatorKey[]).forEach((key) => {
    const beforeVal = base.indicators[key].value;
    const afterVal = scenario.indicators[key].value;
    const delta = afterVal - beforeVal;

    if (delta !== 0) {
      changedIndicators.push({
        key,
        label: base.indicators[key].label,
        beforeValue: beforeVal,
        afterValue: afterVal,
        delta,
      });

      if (key === 'documentation_completeness') {
        keyDrivers.push(
          `Documentation completeness jumped +${delta} pts (now ${afterVal}/100) by eliminating the 3-month bookkeeping blind spot.`
        );
      } else if (key === 'cashflow_stability') {
        keyDrivers.push(
          `Cash-flow stability gained +${delta} pts (now ${afterVal}/100) by eliminating lump-sum supplier payment drops.`
        );
      } else if (key === 'debt_burden') {
        keyDrivers.push(
          `Debt service capacity improved +${delta} pts (now ${afterVal}/100) by freeing up GH₵500/mo operating capital.`
        );
      } else if (key === 'business_activity') {
        keyDrivers.push(
          `Business activity index strengthened +${delta} pts due to longer continuous verified sales throughput.`
        );
      }
    }
  });

  const scoreDelta = scenario.overallScore - base.overallScore;
  const eciDelta = scenario.eci.overall - base.eci.overall;

  const explanation =
    scoreDelta > 0
      ? `Your financial readiness score increases from ${base.overallScore} to ${scenario.overallScore} (+${scoreDelta} points). ${
          eciDelta > 0
            ? `Evidence Confidence improves from ${base.eci.overall}% to ${scenario.eci.overall}% (+${eciDelta}%). `
            : ''
        }This moves your profile firmly into ${scenario.readinessBand} status, making your capital request highly viable.`
      : `No positive changes made yet. Try selecting a scenario or adjusting the controls above to preview potential score lifts.`;

  return {
    baseScore: base.overallScore,
    scenarioScore: scenario.overallScore,
    scoreDelta,
    baseECI: base.eci.overall,
    scenarioECI: scenario.eci.overall,
    eciDelta,
    changedIndicators,
    explanation,
    keyDrivers,
  };
}
