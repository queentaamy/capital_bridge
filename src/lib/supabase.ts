import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://prruhfmekeskyzaaijar.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBycnVoZm1la2Vza3l6YWFpamFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxNjA0MjUsImV4cCI6MjEwNDczNjQyNX0.w2dbwWFAzZyvcdlrqMdul28eC-jI7f5KesjPq1NSfKs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
