// ============================================================================
// CAPITALBRIDGE ONBOARDING & MULTI-ACCOUNT TEST SUITE
// Tests account creation, dynamic evidence generation, and multi-profile switching
// ============================================================================

import { ProfileManager, type OnboardingInput } from '../services/profileManager';
import { calculateAssessment } from '../services/assessmentEngine';
import { AMA_PROFILE } from '../data/seedData';
import { SupabaseService } from '../services/supabaseService';

console.log('\n======================================================');
console.log('🚀 RUNNING ONBOARDING & DYNAMIC PROFILE TEST SUITE');
console.log('======================================================\n');

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    failedTests++;
  }
}

// ----------------------------------------------------------------------------
// Suite 1: Onboarding Input & Profile Creation
// ----------------------------------------------------------------------------
console.log('--- Suite 1: Custom Account Creation & Evidence Calibration ---');

const kofiInput: OnboardingInput = {
  name: 'Kofi Boateng',
  businessName: 'Boateng Auto Spares & Hardware',
  businessType: 'Auto Spares & Hardware',
  businessLocation: 'Kumasi Central Market',
  email: 'kofi.boateng@gmail.com',
  phone: '0244 892 104',
  capitalGoalAmount: 15000,
  capitalGoalPurpose: 'Bulk purchase of brake pads and suspension parts',
  currency: 'GH₵',
  evidenceStreams: {
    hasMomo: true,
    momoInflowEstimate: 68000,
    hasBank: true,
    bankName: 'GCB Bank Ghana',
    hasSusu: true,
    susuWeeklyAmount: 400,
    hasSalesLedger: true,
    salesMonthsCount: 6,
    hasStatutoryKyc: true,
    hasActiveLoan: false,
  },
};

const kofiData = ProfileManager.createProfileFromOnboarding(kofiInput);

assert(kofiData.profile.name === 'Kofi Boateng', 'Profile stores full name accurately');
assert(kofiData.profile.businessName === 'Boateng Auto Spares & Hardware', 'Profile stores business name');
assert(kofiData.profile.capitalGoalAmount === 15000, 'Profile sets capital goal to GH₵15,000');
assert(kofiData.records.length >= 5, 'Generates comprehensive evidence records for selected streams');
assert(
  kofiData.records.some((r) => r.category === 'transactions' && r.sourceName.includes('GCB Bank')),
  'Custom bank statement created for GCB Bank Ghana'
);
assert(
  kofiData.records.some((r) => r.category === 'savings' && r.sourceName.includes('Susu')),
  'Susu passbook records generated for thrift savings'
);
assert(
  kofiData.records.some((r) => r.category === 'documents'),
  'Statutory KYC records generated for registrar general & permit'
);

// ----------------------------------------------------------------------------
// Suite 2: Dynamic Assessment Calculation for Custom Profile
// ----------------------------------------------------------------------------
console.log('\n--- Suite 2: Dynamic Assessment for Custom Profile ---');

const kofiAssessment = calculateAssessment(kofiData.profile.id, kofiData.records);

assert(
  kofiAssessment.overallScore > 700,
  `Well-documented profile achieves Capital Ready band (Score: ${kofiAssessment.overallScore})`
);
assert(
  kofiAssessment.eci.overall >= 80,
  `Evidence confidence index evaluates to High (ECI: ${kofiAssessment.eci.overall}%)`
);
assert(
  kofiAssessment.indicators.income_consistency.value >= 80,
  'Dual MoMo and Bank revenue yields strong income consistency'
);
assert(
  kofiAssessment.indicators.debt_burden.value >= 90,
  'Debt-free status yields optimal debt burden score'
);

// ----------------------------------------------------------------------------
// Suite 3: Micro-Entrepreneur with Document Gaps (Informal Trader)
// ----------------------------------------------------------------------------
console.log('\n--- Suite 3: Informal Trader with Record Gaps ---');

const abenaInput: OnboardingInput = {
  name: 'Abena Osei',
  businessName: 'Abena Fresh Farm Produce',
  businessType: 'Agribusiness & Produce Wholesale',
  businessLocation: 'Madina Market, Accra',
  email: 'abena.osei@gmail.com',
  phone: '0555 123 456',
  capitalGoalAmount: 4000,
  capitalGoalPurpose: 'Cold storage iceboxes and farm produce inventory',
  currency: 'GH₵',
  evidenceStreams: {
    hasMomo: true,
    momoInflowEstimate: 18000,
    hasBank: false,
    hasSusu: true,
    susuWeeklyAmount: 150,
    hasSalesLedger: false,
    hasStatutoryKyc: false,
    hasActiveLoan: true,
    monthlyLoanInstallment: 350,
  },
};

const abenaData = ProfileManager.createProfileFromOnboarding(abenaInput);
const abenaAssessment = calculateAssessment(abenaData.profile.id, abenaData.records);

assert(
  abenaAssessment.overallScore < kofiAssessment.overallScore,
  `Informal trader with gaps scores lower than prime SME (${abenaAssessment.overallScore} vs ${kofiAssessment.overallScore})`
);
assert(
  abenaData.actions.some((a) => a.title.includes('Sales Ledgers')),
  'Tailored action plan recommends uploading sales ledgers'
);
assert(
  abenaData.actions.some((a) => a.title.includes('Registrar General')),
  'Tailored action plan recommends formal registration'
);

// ----------------------------------------------------------------------------
// Suite 4: Multi-Account Management & Switching
// ----------------------------------------------------------------------------
console.log('\n--- Suite 4: Account Persistence & Switching ---');

// Test ProfileManager profiles list
const initialList = ProfileManager.getStoredProfiles();
assert(
  initialList.some((p) => p.id === AMA_PROFILE.id),
  'Profile list always preserves Ama Mensah as benchmark profile'
);

// Test saving and retrieving a profile
ProfileManager.saveProfile(kofiData.profile);
const updatedList = ProfileManager.getStoredProfiles();
assert(
  updatedList.some((p) => p.id === kofiData.profile.id),
  'New profile persisted in storage list'
);

// Test switching active profile ID
ProfileManager.setActiveProfileId(kofiData.profile.id);
assert(
  ProfileManager.getActiveProfileId() === kofiData.profile.id,
  'Active profile ID switches to newly created user'
);

// Switch back to Ama
ProfileManager.setActiveProfileId(AMA_PROFILE.id);
assert(
  ProfileManager.getActiveProfileId() === AMA_PROFILE.id,
  'Active profile ID can switch back to Ama Mensah demo profile'
);

// ----------------------------------------------------------------------------
// Suite 5: Supabase Multi-Profile Persistence Methods
// ----------------------------------------------------------------------------
console.log('\n--- Suite 5: Supabase Multi-Profile Operations ---');

assert(
  typeof SupabaseService.fetchAllProfiles === 'function',
  'SupabaseService has fetchAllProfiles method'
);
assert(
  typeof SupabaseService.createProfile === 'function',
  'SupabaseService has createProfile method'
);
assert(
  typeof SupabaseService.insertEvidenceBatch === 'function',
  'SupabaseService has insertEvidenceBatch method'
);
assert(
  typeof SupabaseService.insertActionsBatch === 'function',
  'SupabaseService has insertActionsBatch method'
);

console.log('\n======================================================');
console.log(`🏁 ONBOARDING TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
console.log('======================================================\n');

if (failedTests > 0) {
  process.exit(1);
}
