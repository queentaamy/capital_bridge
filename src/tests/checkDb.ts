import { supabase } from '../lib/supabase';

async function test() {
  const { data: evidence } = await supabase.from('evidence_records').select('id, profile_id, title');
  console.log('Evidence records profile IDs:', evidence);
  const { data: actions } = await supabase.from('improvement_actions').select('id, profile_id, title');
  console.log('Actions profile IDs:', actions);
}

test();
