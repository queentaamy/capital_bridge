import { supabase } from '../lib/supabase';
import type {
  UserProfile,
  EvidenceRecord,
  ImprovementAction,
  AssessmentResult,
  EvidenceCategory,
  FinancialPassport,
} from '../types';
import {
  AMA_PROFILE,
  INITIAL_EVIDENCE_RECORDS,
  INITIAL_IMPROVEMENT_ACTIONS,
} from '../data/seedData';

// ----------------------------------------------------------------------------
// Database Row Type Definitions
// ----------------------------------------------------------------------------
export interface ProfileRow {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  business_name: string;
  business_type: string;
  business_location: string;
  capital_goal_amount: number;
  capital_goal_purpose: string;
  currency: string;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface EvidenceRecordRow {
  id: string;
  profile_id: string;
  category: string;
  source_name: string;
  title: string;
  start_date: string | null;
  end_date: string | null;
  total_inflow: number;
  total_outflow: number;
  balance: number;
  record_count: number;
  status: string;
  traceability_hash: string | null;
  notes: string | null;
  is_active: boolean;
}

export interface ImprovementActionRow {
  id: string;
  profile_id: string;
  rank: number;
  priority: string;
  title: string;
  rationale: string;
  estimated_point_gain: number;
  category: string;
  status: string;
}

export interface AssessmentRow {
  id: string;
  profile_id: string;
  overall_score: number;
  readiness_band: string;
  methodology_version: string;
  eci_overall: number;
  eci_completeness: number;
  eci_consistency: number;
  eci_traceability: number;
}

// ----------------------------------------------------------------------------
// Model Mappers (snake_case <-> camelCase)
// ----------------------------------------------------------------------------
export function mapProfileFromRow(row: ProfileRow): UserProfile {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone || (row.id === AMA_PROFILE.id ? AMA_PROFILE.phone : ''),
    businessName: row.business_name,
    businessType: row.business_type,
    businessLocation: row.business_location,
    capitalGoalAmount: Number(row.capital_goal_amount),
    capitalGoalPurpose: row.capital_goal_purpose,
    createdAt: row.created_at || (row.id === AMA_PROFILE.id ? AMA_PROFILE.createdAt : new Date().toISOString()),
    currency: row.currency,
  };
}

export function mapEvidenceRecordFromRow(row: EvidenceRecordRow): EvidenceRecord {
  return {
    id: row.id,
    category: row.category as EvidenceCategory,
    sourceName: row.source_name,
    title: row.title,
    dateRange: {
      start: row.start_date || '2026-03-01',
      end: row.end_date || '2026-08-31',
    },
    totalInflow: Number(row.total_inflow || 0),
    totalOutflow: Number(row.total_outflow || 0),
    balance: Number(row.balance || 0),
    recordCount: Number(row.record_count || 0),
    status: (row.status || 'consented_verified') as
      | 'consented_verified'
      | 'pending_verification'
      | 'simulated_demo',
    traceabilityHash: row.traceability_hash || undefined,
    notes: row.notes || undefined,
    isActive: row.is_active !== false,
  };
}

export function mapEvidenceRecordToRow(
  record: EvidenceRecord,
  profileId: string
): EvidenceRecordRow {
  return {
    id: record.id,
    profile_id: profileId,
    category: record.category,
    source_name: record.sourceName,
    title: record.title,
    start_date: record.dateRange.start,
    end_date: record.dateRange.end,
    total_inflow: record.totalInflow ?? 0,
    total_outflow: record.totalOutflow ?? 0,
    balance: record.balance ?? 0,
    record_count: record.recordCount,
    status: record.status,
    traceability_hash: record.traceabilityHash || null,
    notes: record.notes || null,
    is_active: record.isActive,
  };
}

export function mapActionFromRow(row: ImprovementActionRow): ImprovementAction {
  const seedAction = INITIAL_IMPROVEMENT_ACTIONS.find((a) => a.id === row.id);
  const category = (row.category as EvidenceCategory) || seedAction?.category || 'business';

  // Intelligently infer actionType if not in initial seed actions
  let actionType: ImprovementAction['actionType'] = seedAction?.actionType || 'upload_document';
  if (!seedAction) {
    if (category === 'obligations') actionType = 'reduce_debt';
    else if (category === 'savings') actionType = 'consistent_savings';
    else if (category === 'transactions') actionType = 'record_sales';
    else actionType = 'upload_document';
  }

  return {
    id: row.id,
    rank: row.rank,
    priority: row.priority as 'High' | 'Medium' | 'Low',
    title: row.title,
    rationale: row.rationale,
    estimatedPointGain: Number(row.estimated_point_gain),
    category,
    status: row.status as 'not_started' | 'in_progress' | 'completed',
    actionType,
  };
}

export function mapProfileToRow(profile: UserProfile): ProfileRow {
  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    business_name: profile.businessName,
    business_type: profile.businessType,
    business_location: profile.businessLocation,
    capital_goal_amount: profile.capitalGoalAmount,
    capital_goal_purpose: profile.capitalGoalPurpose,
    currency: profile.currency,
  };
}

export function mapActionToRow(
  action: ImprovementAction,
  profileId: string
): ImprovementActionRow {
  return {
    id: action.id,
    profile_id: profileId,
    rank: action.rank,
    priority: action.priority,
    title: action.title,
    rationale: action.rationale,
    estimated_point_gain: action.estimatedPointGain,
    category: action.category,
    status: action.status,
  };
}

// ----------------------------------------------------------------------------
// Supabase Data Service Operations
// ----------------------------------------------------------------------------
export class SupabaseService {
  /**
   * Health check to test live connectivity to Supabase
   */
  static async checkConnection(): Promise<{ ok: boolean; message: string }> {
    try {
      const { error } = await supabase.from('profiles').select('id').limit(1);
      if (error) {
        return { ok: false, message: error.message };
      }
      return { ok: true, message: 'Connected to Supabase PostgreSQL' };
    } catch (err: any) {
      return { ok: false, message: err?.message || 'Connection failed' };
    }
  }

  /**
   * Fetches all registered user profiles from Supabase, guaranteeing Ama Mensah at index 0 as benchmark
   */
  static async fetchAllProfiles(): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        return [AMA_PROFILE];
      }
      const profiles = data.map((row: any) => mapProfileFromRow(row as ProfileRow));
      const ama = profiles.find((p) => p.id === AMA_PROFILE.id) || AMA_PROFILE;
      const nonAma = profiles.filter((p) => p.id !== AMA_PROFILE.id);
      return [ama, ...nonAma];
    } catch {
      return [AMA_PROFILE];
    }
  }

  /**
   * Fetches only user profiles matching an email address, guaranteeing Ama Mensah at index 0 as benchmark
   */
  static async fetchProfilesForEmail(email?: string | null): Promise<UserProfile[]> {
    if (!email) {
      return [AMA_PROFILE];
    }
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        return [AMA_PROFILE];
      }
      const profiles = data.map((row: any) => mapProfileFromRow(row as ProfileRow));
      const ama = profiles.find((p) => p.id === AMA_PROFILE.id) || AMA_PROFILE;
      const nonAma = profiles.filter((p) => p.id !== AMA_PROFILE.id);
      return [ama, ...nonAma];
    } catch {
      return [AMA_PROFILE];
    }
  }

  /**
   * Creates and persists a new user profile in Supabase
   */
  static async createProfile(profile: UserProfile): Promise<boolean> {
    try {
      const row = mapProfileToRow(profile);
      const { error } = await supabase.from('profiles').upsert([row], { onConflict: 'id' });
      return !error;
    } catch {
      return false;
    }
  }

  /**
   * Hydrates user profile by ID with fallback to benchmark demo profile only for Ama Mensah
   */
  static async fetchProfile(profileId: string = AMA_PROFILE.id): Promise<UserProfile | null> {
    if (profileId === AMA_PROFILE.id) {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', profileId)
          .single();
        if (data) return mapProfileFromRow(data as ProfileRow);
      } catch {}
      return AMA_PROFILE;
    }
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .single();

      if (error || !data) {
        return null;
      }
      return mapProfileFromRow(data as ProfileRow);
    } catch {
      return null;
    }
  }

  /**
   * Fetches all evidence records for a profile from Supabase.
   * Only Ama Mensah profile falls back to initial benchmark records;
   * all other profiles strictly load dynamic records from the backend.
   */
  static async fetchEvidenceRecords(
    profileId: string = AMA_PROFILE.id
  ): Promise<EvidenceRecord[]> {
    try {
      const { data, error } = await supabase
        .from('evidence_records')
        .select('*')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        return profileId === AMA_PROFILE.id ? INITIAL_EVIDENCE_RECORDS : [];
      }
      return data.map((row: any) => mapEvidenceRecordFromRow(row as EvidenceRecordRow));
    } catch {
      return profileId === AMA_PROFILE.id ? INITIAL_EVIDENCE_RECORDS : [];
    }
  }

  /**
   * Fetches improvement actions from Supabase.
   * Only Ama Mensah profile falls back to initial benchmark actions;
   * all other profiles strictly load dynamic actions from the backend.
   */
  static async fetchImprovementActions(
    profileId: string = AMA_PROFILE.id
  ): Promise<ImprovementAction[]> {
    try {
      const { data, error } = await supabase
        .from('improvement_actions')
        .select('*')
        .eq('profile_id', profileId)
        .order('rank', { ascending: true });

      if (error || !data || data.length === 0) {
        return profileId === AMA_PROFILE.id ? INITIAL_IMPROVEMENT_ACTIONS : [];
      }
      return data.map((row: any) => mapActionFromRow(row as ImprovementActionRow));
    } catch {
      return profileId === AMA_PROFILE.id ? INITIAL_IMPROVEMENT_ACTIONS : [];
    }
  }

  /**
   * Persists a newly added evidence record to Supabase
   */
  static async insertEvidenceRecord(
    record: EvidenceRecord,
    profileId: string = AMA_PROFILE.id
  ): Promise<boolean> {
    try {
      const row = mapEvidenceRecordToRow(record, profileId);
      const { error } = await supabase.from('evidence_records').insert([row]);
      return !error;
    } catch {
      return false;
    }
  }

  /**
   * Persists multiple evidence records in batch
   */
  static async insertEvidenceBatch(
    records: EvidenceRecord[],
    profileId: string
  ): Promise<boolean> {
    try {
      const rows = records.map((r) => mapEvidenceRecordToRow(r, profileId));
      const { error } = await supabase.from('evidence_records').upsert(rows, { onConflict: 'id' });
      return !error;
    } catch {
      return false;
    }
  }

  /**
   * Persists multiple improvement actions in batch
   */
  static async insertActionsBatch(
    actions: ImprovementAction[],
    profileId: string
  ): Promise<boolean> {
    try {
      const rows = actions.map((a) => mapActionToRow(a, profileId));
      const { error } = await supabase.from('improvement_actions').upsert(rows, { onConflict: 'id' });
      return !error;
    } catch {
      return false;
    }
  }

  /**
   * Updates an evidence record's active status (is_active)
   */
  static async toggleEvidenceActive(
    recordId: string,
    isActive: boolean
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('evidence_records')
        .update({ is_active: isActive })
        .eq('id', recordId);
      return !error;
    } catch {
      return false;
    }
  }

  /**
   * Deletes an evidence record by ID
   */
  static async deleteEvidenceRecord(recordId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('evidence_records')
        .delete()
        .eq('id', recordId);
      return !error;
    } catch {
      return false;
    }
  }

  /**
   * Updates an improvement action's status
   */
  static async updateActionStatus(
    actionId: string,
    status: 'not_started' | 'in_progress' | 'completed'
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('improvement_actions')
        .update({ status })
        .eq('id', actionId);
      return !error;
    } catch {
      return false;
    }
  }

  /**
   * Persists the live assessment result to Supabase, including all 6 normalized indicators
   */
  static async syncAssessment(
    assessment: AssessmentResult,
    profileId: string = AMA_PROFILE.id
  ): Promise<boolean> {
    try {
      const assessmentId = profileId === AMA_PROFILE.id ? 'asm_baseline_742' : `asm_${profileId}`;
      const assessmentRow = {
        id: assessmentId,
        profile_id: profileId,
        overall_score: assessment.overallScore,
        readiness_band: assessment.readinessBand,
        methodology_version: assessment.methodologyVersion,
        eci_overall: assessment.eci.overall,
        eci_completeness: assessment.eci.completeness,
        eci_consistency: assessment.eci.consistency,
        eci_traceability: assessment.eci.traceability,
      };

      const { error } = await supabase
        .from('assessments')
        .upsert([assessmentRow], { onConflict: 'id' });

      if (error) return false;

      // Upsert the 6 indicators into assessment_indicators table
      if (assessment.indicators) {
        const amaIndicatorIdMap: Record<string, string> = {
          income_consistency: 'ind_income_01',
          business_activity: 'ind_biz_01',
          savings_behaviour: 'ind_savings_01',
          debt_burden: 'ind_debt_01',
          cashflow_stability: 'ind_cashflow_01',
          documentation_completeness: 'ind_doc_01',
        };

        const indicatorRows = Object.values(assessment.indicators).map((ind) => ({
          id:
            profileId === AMA_PROFILE.id && amaIndicatorIdMap[ind.key]
              ? amaIndicatorIdMap[ind.key]
              : `ind_${profileId}_${ind.key}`,
          assessment_id: assessmentId,
          indicator_key: ind.key,
          value: ind.value,
          weight: ind.weight,
          level: ind.level,
          gap_summary: ind.gapSummary || null,
        }));

        await supabase
          .from('assessment_indicators')
          .upsert(indicatorRows, { onConflict: 'id' });
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Persists the live verified financial passport to Supabase
   */
  static async syncFinancialPassport(passport: FinancialPassport): Promise<boolean> {
    try {
      const passportRow = {
        id: passport.id,
        profile_id: passport.profileId,
        assessment_id: passport.assessmentId || (passport.profileId === AMA_PROFILE.id ? 'asm_baseline_742' : `asm_${passport.profileId}`),
        share_token: passport.shareToken,
        score: passport.score,
        readiness_band: passport.readinessBand,
        eci: passport.eci,
        verification_hash: passport.verificationHash,
        expires_at: passport.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const { error } = await supabase
        .from('financial_passports')
        .upsert([passportRow], { onConflict: 'id' });

      return !error;
    } catch {
      return false;
    }
  }

  /**
   * Fetches the persisted financial passport from Supabase
   */
  static async fetchFinancialPassport(profileId: string): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('financial_passports')
        .select('*')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !data) return null;
      return data;
    } catch {
      return null;
    }
  }

  // --------------------------------------------------------------------------
  // Supabase Auth Integration
  // --------------------------------------------------------------------------

  /**
   * Signs in an existing user with email and password
   */
  static async signIn(email: string, password: string) {
    return await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
  }

  /**
   * Signs up a new user with email and password, passing optional profile metadata
   */
  static async signUp(
    email: string,
    password: string,
    metadata?: { name?: string; businessName?: string }
  ) {
    return await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: metadata || {},
      },
    });
  }

  /**
   * Signs out the currently authenticated user
   */
  static async signOut() {
    return await supabase.auth.signOut();
  }

  /**
   * Retrieves the current Supabase Auth session
   */
  static async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) return null;
      return data.session;
    } catch {
      return null;
    }
  }

  /**
   * Subscribes to Supabase Auth state changes
   */
  static onAuthStateChange(
    callback: (event: string, session: any) => void
  ) {
    return supabase.auth.onAuthStateChange(callback);
  }

  /**
   * Fetches a borrower profile by registered email
   */
  static async fetchProfileByEmail(email: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email.trim().toLowerCase())
        .limit(1)
        .maybeSingle();

      if (error || !data) {
        return null;
      }
      return mapProfileFromRow(data as ProfileRow);
    } catch {
      return null;
    }
  }
}

