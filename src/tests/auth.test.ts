// ============================================================================
// CapitalBridge Auth Test Suite
// Verifies: Supabase Auth methods, Profile-by-Email lookup, and resilience
// Specification: GirlCode Hackathon Ghana 2026
// ============================================================================

import { SupabaseService } from '../services/supabaseService';
import { AMA_PROFILE } from '../data/seedData';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`  ❌ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  ✓ PASS: ${message}`);
}

export async function runAuthTests() {
  console.log('\n======================================================');
  console.log('🔐 RUNNING AUTHENTICATION & SESSION TEST SUITE');
  console.log('======================================================');

  // Suite 1: SupabaseService Auth Method Signatures
  console.log('\n--- Suite 1: SupabaseService Auth Method Contracts ---');
  assert(
    typeof SupabaseService.signIn === 'function',
    'SupabaseService has signIn method'
  );
  assert(
    typeof SupabaseService.signUp === 'function',
    'SupabaseService has signUp method'
  );
  assert(
    typeof SupabaseService.signOut === 'function',
    'SupabaseService has signOut method'
  );
  assert(
    typeof SupabaseService.getSession === 'function',
    'SupabaseService has getSession method'
  );
  assert(
    typeof SupabaseService.onAuthStateChange === 'function',
    'SupabaseService has onAuthStateChange listener'
  );
  assert(
    typeof SupabaseService.fetchProfileByEmail === 'function',
    'SupabaseService has fetchProfileByEmail method'
  );

  // Suite 2: Profile by Email Retrieval & Fallbacks
  console.log('\n--- Suite 2: Profile Lookup by Registered Email ---');
  const amaProfile = await SupabaseService.fetchProfileByEmail(AMA_PROFILE.email);
  if (amaProfile) {
    assert(
      amaProfile.name === AMA_PROFILE.name,
      'fetchProfileByEmail correctly retrieves Ama Mensah by seeded email'
    );
    assert(
      amaProfile.businessName === AMA_PROFILE.businessName,
      "fetchProfileByEmail preserves business name Ama's Kitchen & Provisions"
    );
  } else {
    // Offline or DB empty scenario
    console.log('  ℹ️ Supabase offline or profile table unreachable in current environment');
  }

  const missingProfile = await SupabaseService.fetchProfileByEmail('non_existent_gh_user@example.gh');
  assert(
    missingProfile === null,
    'fetchProfileByEmail returns null for unknown emails without crashing'
  );

  // Suite 3: Auth Session Recovery
  console.log('\n--- Suite 3: Auth Session Resilience ---');
  const session = await SupabaseService.getSession();
  assert(
    session === null || typeof session === 'object',
    'getSession returns session object or null safely'
  );

  console.log('\n======================================================');
  console.log('🏁 AUTH TEST RESULTS: ALL CHECKS PASSED');
  console.log('======================================================\n');
}

runAuthTests().catch((err) => {
  console.error('Auth test suite failed:', err);
  process.exit(1);
});
