import { SupabaseService } from '../services/supabaseService';
import { calculateAssessment } from '../services/assessmentEngine';
import { AMA_PROFILE } from '../data/seedData';

async function verify() {
  console.log('1. Checking fetchAllProfiles...');
  const profiles = await SupabaseService.fetchAllProfiles();
  console.log('Profiles found in Supabase:', profiles.map(p => `${p.name} (${p.id})`));
  if (profiles[0].id !== AMA_PROFILE.id) throw new Error('Ama is not benchmark at index 0');
  
  console.log('2. Checking Samuel Osarfo dynamic records...');
  const samuel = profiles.find(p => p.name === 'Samuel Osarfo');
  if (!samuel) throw new Error('Samuel Osarfo profile missing in Supabase');
  
  const samuelRecords = await SupabaseService.fetchEvidenceRecords(samuel.id);
  console.log('Samuel records count:', samuelRecords.length);
  samuelRecords.forEach(r => console.log(`  - [${r.category}] ${r.title} (Inflow: GH₵ ${r.totalInflow})`));
  if (samuelRecords.length !== 5) throw new Error('Expected 5 records for Samuel');
  
  const samuelActions = await SupabaseService.fetchImprovementActions(samuel.id);
  console.log('Samuel actions count:', samuelActions.length);
  samuelActions.forEach(a => console.log(`  - #${a.rank} ${a.title}`));
  
  const assessment = calculateAssessment(samuel.id, samuelRecords);
  console.log('Samuel assessment score:', assessment.overallScore, 'ECI:', assessment.eci.overall);
  if (assessment.overallScore !== 814) throw new Error('Unexpected score: ' + assessment.overallScore);
  
  console.log('3. Checking syncAssessment & indicators for Samuel...');
  const synced = await SupabaseService.syncAssessment(assessment, samuel.id);
  console.log('Assessment synced to Supabase:', synced);
  
  console.log('4. Checking unknown profile fallback isolation...');
  const unknownRecords = await SupabaseService.fetchEvidenceRecords('usr_completely_unknown_999');
  console.log('Unknown records count:', unknownRecords.length);
  if (unknownRecords.length !== 0) throw new Error('Unknown profile leaked static records!');

  const unknownActions = await SupabaseService.fetchImprovementActions('usr_completely_unknown_999');
  console.log('Unknown actions count:', unknownActions.length);
  if (unknownActions.length !== 0) throw new Error('Unknown profile leaked static actions!');
  
  console.log('✅ ALL DYNAMIC VERIFICATION CHECKS PASSED PERFECTLY!');
  process.exit(0);
}

verify().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
