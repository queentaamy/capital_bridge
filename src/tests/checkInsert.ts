import { supabase } from '../lib/supabase';
import { ProfileManager } from '../services/profileManager';
import { mapEvidenceRecordToRow, mapActionToRow } from '../services/supabaseService';

async function testInsert() {
  const profileId = 'usr_samuel_osarfo_1671';
  const newProfile = ProfileManager.createProfileFromOnboarding({
    name: 'Samuel Osarfo',
    businessName: 'Unbx8 Studio',
    businessType: 'Retail Trade & General Merchandise',
    businessLocation: 'Makola Market, Accra',
    email: 'smlosafo@gmail.com',
    phone: '',
    capitalGoalAmount: 10000,
    capitalGoalPurpose: 'Working capital and inventory growth',
    evidenceStreams: {
      hasMomo: true,
      momoInflowEstimate: 40000,
      hasBank: true,
      hasSusu: true,
      susuWeeklyAmount: 250,
      hasSalesLedger: true,
      salesMonthsCount: 3,
      hasStatutoryKyc: true,
      hasActiveLoan: false,
    },
  });

  const rows = newProfile.records.map(r => mapEvidenceRecordToRow(r, profileId));
  console.log('Inserting rows:', rows.length);
  const { data: eData, error: eError } = await supabase.from('evidence_records').upsert(rows);
  console.log('Evidence insert result:', { eData, eError });

  const aRows = newProfile.actions.map(a => mapActionToRow(a, profileId));
  const { data: aData, error: aError } = await supabase.from('improvement_actions').upsert(aRows);
  console.log('Actions insert result:', { aData, aError });
}

testInsert();
