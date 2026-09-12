import { supabase } from '../lib/supabase';

async function test() {
  try {
    const { data: profiles } = await supabase.from('profiles').select('*');
    console.log('Profiles in Supabase:', profiles?.length, profiles);
    const { data: evidence } = await supabase.from('evidence_records').select('*');
    console.log('Evidence records in Supabase:', evidence?.length);
    const { data: actions } = await supabase.from('improvement_actions').select('*');
    console.log('Actions in Supabase:', actions?.length);
  } catch (err) {
    console.error('Error querying Supabase:', err);
  }
}

test();
