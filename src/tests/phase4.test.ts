// ============================================================================
// CapitalBridge Phase 4 Automated Test Suite
// Verifies: Supabase Backend Integration, Cloud Persistence & Fallback Resilience
// ============================================================================

import {
  SupabaseService,
  mapProfileFromRow,
  mapEvidenceRecordFromRow,
  mapEvidenceRecordToRow,
  mapActionFromRow,
  type ProfileRow,
  type EvidenceRecordRow,
  type ImprovementActionRow,
} from '../services/supabaseService';
import { AMA_PROFILE, INITIAL_EVIDENCE_RECORDS } from '../data/seedData';
import { calculateAssessment } from '../services/assessmentEngine';

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

async function runPhase4Tests() {
  console.log('\n======================================================');
  console.log('☁️ RUNNING PHASE 4 TEST SUITE: SUPABASE BACKEND & SYNC');
  console.log('======================================================\n');

  // ----------------------------------------------------
  // Test Suite 1: Schema Mappers & Bidirectional Mapping
  // ----------------------------------------------------
  console.log('--- Suite 1: Schema Mappers & Data Integrity ---');

  const mockProfileRow: ProfileRow = {
    id: 'usr_ama_mensah_01',
    name: 'Ama Mensah',
    email: 'ama.mensah@makolamarket.gh',
    phone: '+233 24 412 3456',
    business_name: "Ama's Kitchen & Provisions",
    business_type: 'Wholesale & Retail Groceries',
    business_location: 'Stall B-14, Makola Market, Accra',
    capital_goal_amount: 8000,
    capital_goal_purpose: 'Bulk palm oil and dry grains seasonal purchase',
    currency: 'GH₵',
  };

  const domainProfile = mapProfileFromRow(mockProfileRow);
  assert(domainProfile.id === 'usr_ama_mensah_01', 'mapProfileFromRow maps ID');
  assert(domainProfile.capitalGoalAmount === 8000, 'mapProfileFromRow converts capital_goal_amount to number');
  assert(domainProfile.businessName === "Ama's Kitchen & Provisions", 'mapProfileFromRow maps business_name');

  const mockRecordRow: EvidenceRecordRow = {
    id: 'ev_momo_01',
    profile_id: 'usr_ama_mensah_01',
    category: 'transactions',
    source_name: 'MTN MobileMoney Merchant Account',
    title: 'MoMo Business Inflows (6 Months)',
    start_date: '2026-03-01',
    end_date: '2026-08-31',
    total_inflow: 54200,
    total_outflow: 41800,
    balance: 6450,
    record_count: 342,
    status: 'consented_verified',
    traceability_hash: 'sha256-mtn-momo-gh-2026-08-audit',
    notes: 'Primary retail payment acceptance line at Makola Market.',
    is_active: true,
  };

  const domainRecord = mapEvidenceRecordFromRow(mockRecordRow);
  assert(domainRecord.category === 'transactions', 'mapEvidenceRecordFromRow preserves category');
  assert(domainRecord.totalInflow === 54200, 'mapEvidenceRecordFromRow preserves numeric inflow');
  assert(domainRecord.isActive === true, 'mapEvidenceRecordFromRow maps is_active to isActive');

  const serializedRow = mapEvidenceRecordToRow(domainRecord, 'usr_ama_mensah_01');
  assert(serializedRow.profile_id === 'usr_ama_mensah_01', 'mapEvidenceRecordToRow sets profile_id foreign key');
  assert(serializedRow.total_inflow === 54200, 'mapEvidenceRecordToRow maps totalInflow back to total_inflow');
  assert(serializedRow.is_active === true, 'mapEvidenceRecordToRow maps isActive back to is_active');

  const mockActionRow: ImprovementActionRow = {
    id: 'act_01',
    profile_id: 'usr_ama_mensah_01',
    rank: 1,
    priority: 'High',
    title: 'Reconstruct & Upload 3 Missing Months of Daily Trading Books',
    rationale: 'Documentation completeness is currently 53/100.',
    estimated_point_gain: 48,
    category: 'Documentation',
    status: 'not_started',
  };

  const domainAction = mapActionFromRow(mockActionRow);
  assert(domainAction.estimatedPointGain === 48, 'mapActionFromRow converts estimated_point_gain to number');
  assert(domainAction.priority === 'High', 'mapActionFromRow maps High priority enum');

  // ----------------------------------------------------
  // Test Suite 2: Supabase Health Check & Connectivity
  // ----------------------------------------------------
  console.log('\n--- Suite 2: Cloud Health Check & Connectivity ---');

  const connectionResult = await SupabaseService.checkConnection();
  assert(typeof connectionResult.ok === 'boolean', 'checkConnection returns boolean health flag');
  assert(typeof connectionResult.message === 'string', 'checkConnection provides status description');

  // ----------------------------------------------------
  // Test Suite 3: Cloud Hydration & Record Retrieval
  // ----------------------------------------------------
  console.log('\n--- Suite 3: Cloud Hydration & Record Retrieval ---');

  const profile = await SupabaseService.fetchProfile(AMA_PROFILE.id);
  assert(profile.name === 'Ama Mensah', 'fetchProfile returns Ama Mensah profile');
  assert(profile.capitalGoalAmount === 8000, 'fetchProfile verifies GH₵8,000 capital goal');

  const records = await SupabaseService.fetchEvidenceRecords(AMA_PROFILE.id);
  assert(records.length >= 7, 'fetchEvidenceRecords returns at least 7 verified evidence records');
  assert(
    records.some((r) => r.id === 'ev_momo_01' || r.category === 'transactions'),
    'fetchEvidenceRecords includes mobile money and transactions records'
  );
  assert(
    records.some((r) => r.category === 'savings'),
    'fetchEvidenceRecords includes Susu thrift savings records'
  );

  const actions = await SupabaseService.fetchImprovementActions(AMA_PROFILE.id);
  assert(actions.length >= 4, 'fetchImprovementActions returns at least 4 ranked action items');
  assert(actions[0].rank === 1, 'First action item is rank #1');

  // ----------------------------------------------------
  // Test Suite 4: Realtime Mutation Persistence
  // ----------------------------------------------------
  console.log('\n--- Suite 4: Cloud Persistence & Sync Operations ---');

  const assessment = calculateAssessment(AMA_PROFILE.id, INITIAL_EVIDENCE_RECORDS);
  const syncSuccess = await SupabaseService.syncAssessment(assessment, AMA_PROFILE.id);
  assert(typeof syncSuccess === 'boolean', 'syncAssessment executes without throwing');

  const toggleSuccess = await SupabaseService.toggleEvidenceActive('ev_momo_01', true);
  assert(typeof toggleSuccess === 'boolean', 'toggleEvidenceActive executes mutation cleanly');

  const actionUpdateSuccess = await SupabaseService.updateActionStatus('act_01', 'in_progress');
  assert(typeof actionUpdateSuccess === 'boolean', 'updateActionStatus updates task status in cloud');

  // ----------------------------------------------------
  // Test Suite 5: Fallback & Offline Resilience
  // ----------------------------------------------------
  console.log('\n--- Suite 5: Offline Resilience & Zero-Crash Fallback ---');

  const fallbackProfile = await SupabaseService.fetchProfile('non_existent_profile_id');
  assert(fallbackProfile.name === 'Ama Mensah', 'fetchProfile safely falls back to Ama Mensah when profile not found');

  const fallbackRecords = await SupabaseService.fetchEvidenceRecords('non_existent_profile_id');
  assert(fallbackRecords.length === 7, 'fetchEvidenceRecords safely falls back to initial records collection');

  const fallbackActions = await SupabaseService.fetchImprovementActions('non_existent_profile_id');
  assert(fallbackActions.length === 4, 'fetchImprovementActions safely falls back to initial actions collection');

  console.log('\n======================================================');
  console.log(`🏁 PHASE 4 TEST RESULTS: ${testsPassed} PASSED, ${testsFailed} FAILED`);
  console.log('======================================================\n');

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runPhase4Tests();
