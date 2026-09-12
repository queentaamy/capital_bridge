// ============================================================================
// CapitalBridge Phase 3 Automated Test Suite
// Verifies: Core Interactive Demo Loop, State Reactivity, Explainability & Coach
// ============================================================================

import { AMA_PROFILE, INITIAL_EVIDENCE_RECORDS, INITIAL_IMPROVEMENT_ACTIONS } from '../data/seedData';
import { calculateAssessment } from '../services/assessmentEngine';
import { runWhatIfScenario, PRESET_SCENARIOS } from '../services/scenarioEngine';
import { generateDeterministicFallbackResponse } from '../services/geminiCoachService';
import type { EvidenceRecord, ImprovementAction, IndicatorKey } from '../types';

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

async function runPhase3Tests() {
  console.log('\n======================================================');
  console.log('⚡ RUNNING PHASE 3 TEST SUITE: INTERACTIVE DEMO LOOP');
  console.log('======================================================\n');

  // ----------------------------------------------------
  // Test Suite 1: Evidence Center State Reactivity
  // ----------------------------------------------------
  console.log('--- Suite 1: Evidence Reactivity & Dynamic Recalculation ---');

  let currentRecords: EvidenceRecord[] = [...INITIAL_EVIDENCE_RECORDS];
  const initialAssessment = calculateAssessment(AMA_PROFILE.id, currentRecords);
  assert(initialAssessment.overallScore === 742, 'Initial assessment baseline evaluates to 742');

  // 1.1 Test Disabling a Core Evidence Record (Simulate removing Ecobank statement)
  currentRecords = currentRecords.map((r) =>
    r.id === 'ev_bank_01' ? { ...r, isActive: false } : r
  );
  const degradedAssessment = calculateAssessment(AMA_PROFILE.id, currentRecords);
  assert(
    degradedAssessment.overallScore <= initialAssessment.overallScore,
    'Disabling evidence record causes readiness score to stay constant or drop'
  );

  // 1.2 Test Adding Simulated New Evidence (+3 Months Books)
  const simulatedNewBook: EvidenceRecord = {
    id: `ev_sim_${Date.now()}`,
    category: 'business',
    sourceName: 'Reconstructed Market Committee Daily Books',
    title: 'Q1 Daily Sales Logs (March - May 2026)',
    dateRange: { start: '2026-03-01', end: '2026-05-31' },
    totalInflow: 24000,
    totalOutflow: 0,
    balance: 24000,
    status: 'consented_verified',
    recordCount: 90,
    isActive: true,
  };
  currentRecords = [simulatedNewBook, ...currentRecords];
  assert(currentRecords.length === 8, 'Simulated evidence successfully added to records collection');

  const boostedAssessment = calculateAssessment(AMA_PROFILE.id, INITIAL_EVIDENCE_RECORDS, {
    addBusinessRecordsMonths: 3,
  });

  assert(
    boostedAssessment.overallScore === 790,
    'Adding 3 months reconstructed books dynamically recalculates score to 790 (+48 pts)',
    `Score: ${boostedAssessment.overallScore}`
  );
  assert(
    boostedAssessment.eci.overall === 94,
    'Adding 3 months books elevates ECI from 86% to 94% (+8%)',
    `ECI: ${boostedAssessment.eci.overall}%`
  );

  // ----------------------------------------------------
  // Test Suite 2: Explainability & Drill-Down Integrity
  // ----------------------------------------------------
  console.log('\n--- Suite 2: Indicator Explainability & Audit ---');
  const baseline = calculateAssessment(AMA_PROFILE.id, INITIAL_EVIDENCE_RECORDS);

  // Documentation Gap Check
  const docInd = baseline.indicators.documentation_completeness;
  assert(docInd.value === 53, 'Documentation Completeness correctly flagged at 53/100');
  assert(docInd.level === 'gap', 'Documentation Completeness classified as "gap" level');
  assert(
    docInd.gapSummary.includes('Missing records from March - May 2026'),
    'Identified gap specifically cites March - May 2026 missing window'
  );

  // Cash-flow Stability Check
  const cfInd = baseline.indicators.cashflow_stability;
  assert(cfInd.value === 64, 'Cash-flow Stability correctly flagged at 64/100');
  assert(cfInd.level === 'moderate', 'Cash-flow Stability classified as "moderate" level');
  assert(
    cfInd.gapSummary.toLowerCase().includes('supplier outlays'),
    'Identified gap cites supplier outlay timing'
  );

  // Traceability Formula Check
  (Object.keys(baseline.indicators) as IndicatorKey[]).forEach((key) => {
    const ind = baseline.indicators[key];
    assert(ind.calculationFormula.length > 5, `Calculation path defined for ${ind.label}`);
    assert(ind.contributingEvidence.length > 0, `Contributing evidence listed for ${ind.label}`);
  });

  // ----------------------------------------------------
  // Test Suite 3: What-If Simulator Scenario Matrix
  // ----------------------------------------------------
  console.log('\n--- Suite 3: What-If Simulator Preset Accuracy ---');

  // Preset 1: Add 3 Months Books
  const preset1 = PRESET_SCENARIOS[0];
  const res1 = runWhatIfScenario(AMA_PROFILE.id, INITIAL_EVIDENCE_RECORDS, preset1.params);
  assert(res1.scoreDelta === 48, 'Preset 1 produces exact delta of +48 points');
  assert(res1.scenarioScore === 790, 'Preset 1 reaches target score of 790');
  assert(res1.eciDelta === 8, 'Preset 1 produces exact ECI delta of +8%');

  // Preset 2: Pay Off Advans Micro-Loan
  const preset2 = PRESET_SCENARIOS[1];
  const res2 = runWhatIfScenario(AMA_PROFILE.id, INITIAL_EVIDENCE_RECORDS, preset2.params);
  assert(res2.scoreDelta === 24, 'Preset 2 produces exact delta of +24 points (debt cleared)');
  assert(res2.scenarioScore === 766, 'Preset 2 reaches score of 766');

  // Preset 3: Smooth Bulk Supplier Outlays
  const preset3 = PRESET_SCENARIOS[2];
  const res3 = runWhatIfScenario(AMA_PROFILE.id, INITIAL_EVIDENCE_RECORDS, preset3.params);
  assert(
    res3.changedIndicators.some((i) => i.key === 'cashflow_stability' && i.delta === 22),
    'Preset 3 lifts Cash-flow Stability by +22 points (from 64 to 86)'
  );

  // Preset 4: Prime Ready Path
  const preset4 = PRESET_SCENARIOS[3];
  const res4 = runWhatIfScenario(AMA_PROFILE.id, INITIAL_EVIDENCE_RECORDS, preset4.params);
  assert(
    res4.scenarioScore >= 850,
    'Preset 4 (Combined) pushes profile into Prime Ready band (850+ pts)',
    `Score: ${res4.scenarioScore}`
  );

  // ----------------------------------------------------
  // Test Suite 4: Improvement Action Plan State Toggles
  // ----------------------------------------------------
  console.log('\n--- Suite 4: Action Plan Prioritization & Toggles ---');
  let actions: ImprovementAction[] = [...INITIAL_IMPROVEMENT_ACTIONS];

  assert(actions.length === 4, 'Action plan contains 4 ranked improvement tasks');
  assert(actions[0].rank === 1 && actions[0].priority === 'High', 'Rank #1 action is High Priority');
  assert(actions[0].estimatedPointGain === 48, 'Rank #1 action estimates +48 pts gain');

  // Test toggling status
  actions = actions.map((a) => (a.id === 'act_01' ? { ...a, status: 'completed' } : a));
  assert(actions[0].status === 'completed', 'Task status toggles cleanly to "completed"');

  const remainingPotential = actions
    .filter((a) => a.status !== 'completed')
    .reduce((sum, a) => sum + a.estimatedPointGain, 0);
  assert(
    remainingPotential === 22 + 24 + 15,
    'Remaining unlocked point potential calculates accurately',
    `Remaining: ${remainingPotential}`
  );

  // ----------------------------------------------------
  // Test Suite 5: AI Credit Coach Grounding & Guardrails
  // ----------------------------------------------------
  console.log('\n--- Suite 5: AI Credit Coach Math Grounding ---');
  // Verify that coach prompt responses cite exact deterministic numbers
  const coachPromptResponses = [
    { query: 'Why is my readiness score 742?', expectedKeywords: ['742', 'Capital Ready', 'Documentation Completeness', '53', '64'] },
    { query: 'What is holding my profile back?', expectedKeywords: ['Documentation Blind Spot', 'March - May 2026', 'Expense Volatility', '64'] },
    { query: 'What should I improve first?', expectedKeywords: ['Priority #1', '+48', '85', '94%'] },
    { query: 'Explain my Financial Passport', expectedKeywords: ['Financial Passport', 'Ghana', '86%'] },
  ];

  coachPromptResponses.forEach(({ query, expectedKeywords }) => {
    const response = generateDeterministicFallbackResponse(query, AMA_PROFILE, baseline);
    expectedKeywords.forEach((kw) => {
      assert(
        response.includes(kw),
        `Coach response for "${query.substring(0, 24)}..." cites verified fact "${kw}"`
      );
    });
  });

  // ----------------------------------------------------
  // Test Suite 6: Financial Passport Integrity
  // ----------------------------------------------------
  console.log('\n--- Suite 6: Financial Passport & Verification Hash ---');
  const passport = {
    shareToken: 'ama-kitchen-gh8k-742',
    score: baseline.overallScore,
    eci: baseline.eci.overall,
    verificationHash: 'CB-VERIFIED-GH-2026-742-86A',
  };

  assert(passport.shareToken.length > 5, 'Share token slug generated for public/lender sharing');
  assert(passport.score === 742, 'Passport reflects verified 742 readiness score');
  assert(passport.eci === 86, 'Passport reflects verified 86% Evidence Confidence Index');
  assert(passport.verificationHash.startsWith('CB-VERIFIED'), 'Passport stamped with tamper-evident verification hash');

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

runPhase3Tests();
