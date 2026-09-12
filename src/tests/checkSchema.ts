import { supabase } from '../lib/supabase';

async function checkSchema() {
  const { data: cols } = await supabase.from('improvement_actions').select('*').limit(1);
  console.log('improvement_actions columns:', cols ? Object.keys(cols[0] || {}) : 'none');
  const { data: recCols } = await supabase.from('evidence_records').select('*').limit(1);
  console.log('evidence_records columns:', recCols ? Object.keys(recCols[0] || {}) : 'none');
  const { data: profCols } = await supabase.from('profiles').select('*').limit(1);
  console.log('profiles columns:', profCols ? Object.keys(profCols[0] || {}) : 'none');
}

checkSchema();
