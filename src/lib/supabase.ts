import { createClient } from '@supabase/supabase-js';

const getEnvVar = (key: string, fallback: string): string => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta && import.meta.env && import.meta.env[key]) {
      return import.meta.env[key];
    }
  } catch {
    // Ignored in non-vite environments
  }
  try {
    const g = globalThis as { process?: { env?: Record<string, string> } };
    if (g.process?.env?.[key]) {
      return g.process.env[key];
    }
  } catch {
    // Ignored
  }
  return fallback;
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL', 'https://prruhfmekeskyzaaijar.supabase.co');
const supabaseAnonKey = getEnvVar(
  'VITE_SUPABASE_ANON_KEY',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBycnVoZm1la2Vza3l6YWFpamFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxNjA0MjUsImV4cCI6MjEwNDczNjQyNX0.w2dbwWFAzZyvcdlrqMdul28eC-jI7f5KesjPq1NSfKs'
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
