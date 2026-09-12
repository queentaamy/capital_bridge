// ============================================================================
// CapitalBridge Phase 1 Automated Test Suite
// Verifies: Domain Models, Deterministic Math Engine, ECI & What-If Engine
// ============================================================================

import { AMA_PROFILE, INITIAL_EVIDENCE_RECORDS } from '../data/seedData';
import {
  calculateAssessment,
  INDICATOR_WEIGHTS,
} from '../services/assessmentEngine';
import { runWhatIfScenario, PRESET_SCENARIOS } from '../services/scenarioEngine';
import { supabase } from '../lib/supabase';
import type { IndicatorKey } from '../types';

let testsPassed = 0;
let testsFailed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    testsPassed++;
  } else {
    console.error(`  ✗ FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
    testsFailed++;
  }
}

async function runPhase1Tests() {
  console.log('\n======================================================');
  console.log('🧪 RUNNING PHASE 1 TEST SUITE: CAPITALBRIDGE ENGINE');
  console.log('======================================================\n');

  // ----------------------------------------------------
  // Test Suite 1: Domain Models & Seed Data
  // ----------------------------------------------------
  console.log('--- Suite 1: Domain Models & Seed Integrity ---');
  assert(AMA_PROFILE.name === 'Ama Mensah', 'User profile name matches Ama Mensah');
  assert(AMA_PROFILE.capitalGoalAmount === 8000, 'Capital goal is exactly GH₵8,000');
  assert(AMA_PROFILE.currency === 'GH₵', 'Currency symbol is GH₵ (Ghanaian Cedi)');
  assert(INITIAL_EVIDENCE_RECORDS.length === 7, 'Loaded 7 initial evidence records across 5 categories');

  // Verify all categories represented
  const categories = new Set(INITIAL_EVIDENCE_RECORDS.map((r) => r.category));
  assert(categories.has('transactions'), 'Transactions evidence present (MoMo & Ecobank)');
  assert(categories.has('savings'), 'Savings evidence present (Susu deposits)');
  assert(categories.has('business'), 'Business ledger evidence present');
  assert(categories.has('obligations'), 'Debt obligation present (Advans MFI)');
  assert(categories.has('documents'), 'Statutory permits present (RGD & AMA)');

  // ----------------------------------------------------
  // Test Suite 2: Weights & Mathematical Foundation
  // ----------------------------------------------------
  console.log('\n--- Suite 2: Engine Weighting & Max Points ---');
  const totalWeight = (Object.keys(INDICATOR_WEIGHTS) as IndicatorKey[]).reduce(
    (sum, k) => sum + INDICATOR_WEIGHTS[k],
    0
  );
  assert(
    Math.abs(totalWeight - 1.0) < 0.0001,
    'All 6 indicator weights sum up to exactly 1.00 (100% / 1000 pts)',
    `Sum: ${totalWeight}`
  );

  // ----------------------------------------------------
  // Test Suite 3: Deterministic Baseline Assessment
  // ----------------------------------------------------
  console.log('\n--- Suite 3: Baseline Assessment (Ama Mensah) ---');
  const baseline = calculateAssessment(AMA_PROFILE.id, INITIAL_EVIDENCE_RECORDS);

  // Assert Overall Score is EXACTLY 742
  assert(
    baseline.overallScore === 742,
    'Baseline Readiness Score evaluates to EXACTLY 742 / 1000',
    `Expected 742, got ${baseline.overallScore}`
  );

  // Assert Readiness Band
  assert(
    baseline.readinessBand === 'Capital Ready',
    'Readiness Band evaluates to "Capital Ready" (700-849)',
    `Got ${baseline.readinessBand}`
  );

  // Assert ECI is EXACTLY 86%
  assert(
    baseline.eci.overall === 86,
    'Evidence Confidence Index evaluates to EXACTLY 86%',
    `Expected 86, got ${baseline.eci.overall}`
  );

  // Assert ECI Dimensions
  assert(baseline.eci.completeness === 88, 'ECI Completeness evaluates to 88%');
  assert(baseline.eci.consistency === 85, 'ECI Consistency evaluates to 85%');
  assert(baseline.eci.traceability === 85, 'ECI Traceability evaluates to 85%');

  // Assert Individual Indicators
  assert(baseline.indicators.income_consistency.value === 82, 'Income Consistency: 82/100 (+164 pts)');
  assert(baseline.indicators.business_activity.value === 84, 'Business Activity: 84/100 (+168 pts)');
  assert(baseline.indicators.savings_behaviour.value === 80, 'Savings Behaviour: 80/100 (+120 pts)');
  assert(baseline.indicators.debt_burden.value === 76, 'Debt Burden: 76/100 (+114 pts)');
  assert(baseline.indicators.cashflow_stability.value === 64, 'Cash-flow Stability: 64/100 (Gap identified: +96 pts)');
  assert(baseline.indicators.documentation_completeness.value === 53, 'Documentation Completeness: 53/100 (Gap identified: +80 pts)');

  // Verify Sum of Points equals 742
  const pointsSum = (Object.keys(baseline.indicators) as IndicatorKey[]).reduce(
    (sum, k) => sum + baseline.indicators[k].pointsEarned,
    0
  );
  assert(
    pointsSum === 742,
    'Sum of individual points earned equals total score (742)',
    `Sum: ${pointsSum}`
  );

  // ----------------------------------------------------
  // Test Suite 4: Traceability & Explainability
  // ----------------------------------------------------
  console.log('\n--- Suite 4: Traceability & Formula Audit ---');
  (Object.keys(baseline.indicators) as IndicatorKey[]).forEach((key) => {
    const ind = baseline.indicators[key];
    assert(
      ind.calculationFormula.length > 10,
      `Traceable formula exists for ${ind.label}`
    );
    assert(
      ind.contributingEvidence.length > 0,
      `Contributing evidence records mapped to ${ind.label}`
    );
  });

  // ----------------------------------------------------
  // Test Suite 5: What-If Scenario Engine Simulations
  // ----------------------------------------------------
  console.log('\n--- Suite 5: What-If Scenarios & Delta Math ---');

  // Scenario 1: Add 3 Months Books
  const sc1 = runWhatIfScenario(AMA_PROFILE.id, INITIAL_EVIDENCE_RECORDS, {
    addBusinessRecordsMonths: 3,
    reduceMonthlyDebtAmount: 0,
    smoothExpenseVolatility: false,
    maintainSavingsWeeks: 0,
  });
  assert(
    sc1.scenarioScore === 790,
    'What-If: Adding 3 months sales books lifts score from 742 to 790 (+48 pts)',
    `Got ${sc1.scenarioScore}`
  );
  assert(
    sc1.scenarioECI === 94,
    'What-If: Adding 3 months sales books lifts ECI from 86% to 94% (+8%)',
    `Got ${sc1.scenarioECI}%`
  );
  assert(
    sc1.keyDrivers.some((d) => d.includes('Documentation completeness jumped')),
    'Plain-language explanation identifies Documentation Completeness as key driver'
  );

  // Scenario 2: Clear Remaining Micro-Loan
  const sc2 = runWhatIfScenario(AMA_PROFILE.id, INITIAL_EVIDENCE_RECORDS, {
    addBusinessRecordsMonths: 0,
    reduceMonthlyDebtAmount: 500,
    smoothExpenseVolatility: false,
    maintainSavingsWeeks: 0,
  });
  assert(
    sc2.scenarioScore === 766,
    'What-If: Paying off GH₵500/mo loan lifts score to 766 (+24 pts)',
    `Got ${sc2.scenarioScore}`
  );

  // Scenario 4: Combined Prime Ready Path
  const scPrime = runWhatIfScenario(
    AMA_PROFILE.id,
    INITIAL_EVIDENCE_RECORDS,
    PRESET_SCENARIOS[3].params
  );
  assert(
    scPrime.scenarioScore >= 850,
    'What-If: Combined Prime Ready scenario surpasses 850 pts',
    `Got ${scPrime.scenarioScore}`
  );

  // ----------------------------------------------------
  // Test Suite 6: Supabase Live Database Verification
  // ----------------------------------------------------
  console.log('\n--- Suite 6: Supabase Database Sync Verification ---');
  try {
    const { data: profileRow, error: profileErr } = await supabase
      .from('profiles')
      .select('id, name, capital_goal_amount')
      .eq('id', 'usr_ama_mensah_01')
      .single();

    assert(
      !profileErr && profileRow?.name === 'Ama Mensah',
      'Supabase profile table returns seeded Ama Mensah record'
    );

    const { data: asmRow, error: asmErr } = await supabase
      .from('assessments')
      .select('overall_score, eci_overall, readiness_band')
      .eq('profile_id', 'usr_ama_mensah_01')
      .single();

    assert(
      !asmErr && asmRow?.overall_score === 742 && asmRow?.eci_overall === 86,
      'Supabase assessment table verifies 742 score & 86% ECI'
    );

    const { data: indicators, error: indErr } = await supabase
      .from('assessment_indicators')
      .select('indicator_key, value, level')
      .eq('assessment_id', 'asm_baseline_742');

    assert(
      !indErr && indicators && indicators.length === 6,
      'Supabase assessment_indicators table has all 6 verified indicators',
      `Count: ${indicators?.length}`
    );
  } catch (err) {
    console.error('Supabase query error:', err);
    assert(false, 'Supabase query execution succeeded');
  }

  // ----------------------------------------------------
  // Summary
  // ----------------------------------------------------
  console.log('\n======================================================');
  console.log(`🏁 TEST RESULTS: ${testsPassed} PASSED, ${testsFailed} FAILED`);
  console.log('======================================================\n');

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runPhase1Tests();
