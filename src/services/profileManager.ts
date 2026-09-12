// ============================================================================
// CapitalBridge Profile Manager & Onboarding Generator
// Specification: GirlCode Hackathon Ghana 2026
// ============================================================================

import type {
  UserProfile,
  EvidenceRecord,
  ImprovementAction,
} from '../types';
import {
  AMA_PROFILE,
  INITIAL_EVIDENCE_RECORDS,
  INITIAL_IMPROVEMENT_ACTIONS,
} from '../data/seedData';

export interface OnboardingInput {
  name: string;
  businessName: string;
  businessType: string;
  businessLocation: string;
  email: string;
  phone: string;
  capitalGoalAmount: number;
  capitalGoalPurpose: string;
  currency?: string;
  evidenceStreams: {
    hasMomo: boolean;
    momoInflowEstimate?: number;
    hasBank: boolean;
    bankName?: string;
    hasSusu: boolean;
    susuWeeklyAmount?: number;
    hasSalesLedger: boolean;
    salesMonthsCount?: number;
    hasStatutoryKyc: boolean;
    hasActiveLoan: boolean;
    monthlyLoanInstallment?: number;
  };
}

const STORAGE_KEYS = {
  PROFILES: 'capitalbridge_profiles',
  ACTIVE_PROFILE_ID: 'capitalbridge_active_profile_id',
  RECORDS_PREFIX: 'capitalbridge_records_',
  ACTIONS_PREFIX: 'capitalbridge_actions_',
};

const inMemoryStore: Record<string, string> = {
  [STORAGE_KEYS.PROFILES]: JSON.stringify([AMA_PROFILE]),
  [STORAGE_KEYS.ACTIVE_PROFILE_ID]: AMA_PROFILE.id,
};

function safeGetItem(key: string): string | null {
  try {
    if (typeof localStorage !== 'undefined' && localStorage.getItem) {
      const val = localStorage.getItem(key);
      if (val !== null) return val;
    }
  } catch {}
  return inMemoryStore[key] ?? null;
}

function safeSetItem(key: string, value: string): void {
  inMemoryStore[key] = value;
  try {
    if (typeof localStorage !== 'undefined' && localStorage.setItem) {
      localStorage.setItem(key, value);
    }
  } catch {}
}

export class ProfileManager {
  /**
   * Generates a fully formed UserProfile and corresponding initial evidence and actions
   */
  static createProfileFromOnboarding(input: OnboardingInput): {
    profile: UserProfile;
    records: EvidenceRecord[];
    actions: ImprovementAction[];
  } {
    const slug = input.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .slice(0, 15);
    const profileId = `usr_${slug}_${Date.now().toString().slice(-4)}`;

    const profile: UserProfile = {
      id: profileId,
      name: input.name.trim(),
      email: input.email.trim(),
      phone: input.phone.trim(),
      businessName: input.businessName.trim(),
      businessType: input.businessType.trim(),
      businessLocation: input.businessLocation.trim(),
      capitalGoalAmount: Number(input.capitalGoalAmount) || 5000,
      capitalGoalPurpose: input.capitalGoalPurpose.trim() || 'Working capital and inventory growth',
      createdAt: new Date().toISOString(),
      currency: input.currency || 'GH₵',
    };

    const records: EvidenceRecord[] = [];
    const streams = input.evidenceStreams;

    // 1. Mobile Money Record
    if (streams.hasMomo) {
      const inflow = streams.momoInflowEstimate || Math.round(profile.capitalGoalAmount * 4.5);
      records.push({
        id: `ev_momo_${profileId}`,
        category: 'transactions',
        sourceName: 'MTN Mobile Money Merchant Statement',
        title: '6-Month MoMo Merchant Inflows',
        dateRange: { start: '2026-03-01', end: '2026-08-31' },
        totalInflow: inflow,
        totalOutflow: Math.round(inflow * 0.72),
        balance: Math.round(inflow * 0.08),
        status: 'consented_verified',
        recordCount: 142,
        traceabilityHash: `sha256-momo-${profileId.slice(-6)}`,
        notes: `Automated merchant MoMo statement verified via telecom partner API. Total inflows GH₵ ${inflow.toLocaleString()}.`,
        isActive: true,
      });
    }

    // 2. Commercial Bank Statement
    if (streams.hasBank) {
      const bankName = streams.bankName || 'Ecobank Ghana';
      const inflow = Math.round(profile.capitalGoalAmount * 2.8);
      records.push({
        id: `ev_bank_${profileId}`,
        category: 'transactions',
        sourceName: `${bankName} (SME Commercial Account)`,
        title: '6-Month Commercial Bank Statement',
        dateRange: { start: '2026-03-01', end: '2026-08-31' },
        totalInflow: inflow,
        totalOutflow: Math.round(inflow * 0.75),
        balance: Math.round(inflow * 0.15),
        status: 'consented_verified',
        recordCount: 68,
        traceabilityHash: `sha256-bank-${profileId.slice(-6)}`,
        notes: `Direct open-banking read statement via GhIPSS proxy. Clean monthly operating balance.`,
        isActive: true,
      });
    }

    // 3. Susu Thrift Savings
    if (streams.hasSusu) {
      const weekly = streams.susuWeeklyAmount || 250;
      const totalSusu = weekly * 20;
      records.push({
        id: `ev_susu_${profileId}`,
        category: 'savings',
        sourceName: 'Local Market Susu Association',
        title: 'Susu Thrift Collector Passbook',
        dateRange: { start: '2026-04-01', end: '2026-08-31' },
        totalInflow: totalSusu,
        totalOutflow: 0,
        balance: totalSusu,
        status: 'consented_verified',
        recordCount: 20,
        traceabilityHash: `sha256-susu-${profileId.slice(-6)}`,
        notes: `Verified physical passbook with market collector stamps. 20 unbroken weekly deposits.`,
        isActive: true,
      });
    }

    // 4. Daily Sales Ledgers
    if (streams.hasSalesLedger) {
      const months = streams.salesMonthsCount || 3;
      const totalSales = Math.round(profile.capitalGoalAmount * (months === 6 ? 6.2 : 3.4));
      records.push({
        id: `ev_biz_${profileId}`,
        category: 'business',
        sourceName: 'Enterprise Daily Sales Book',
        title: `Verified Sales Ledger (${months} Months)`,
        dateRange: {
          start: months === 6 ? '2026-03-01' : '2026-06-01',
          end: '2026-08-31',
        },
        totalInflow: totalSales,
        totalOutflow: 0,
        balance: totalSales,
        status: 'consented_verified',
        recordCount: months * 30,
        traceabilityHash: `sha256-ledger-${profileId.slice(-6)}`,
        notes: `Audited sales receipts and daybooks with consistent daily trade entries.`,
        isActive: true,
      });
    }

    // 5. Statutory KYC & Business Documents
    if (streams.hasStatutoryKyc) {
      records.push({
        id: `ev_doc_${profileId}`,
        category: 'documents',
        sourceName: 'Ghana Registrar General & Municipal Assembly',
        title: 'Business Registration & Local Operating Permit',
        dateRange: { start: '2024-01-15', end: '2027-01-14' },
        status: 'consented_verified',
        recordCount: 2,
        traceabilityHash: `sha256-kyc-${profileId.slice(-6)}`,
        notes: `Official Registrar General Department Certificate of Registration and current year local assembly permit.`,
        isActive: true,
      });
    }

    // 6. Existing Loan / Debt Obligation
    if (streams.hasActiveLoan) {
      const monthlyPayment = streams.monthlyLoanInstallment || 450;
      records.push({
        id: `ev_loan_${profileId}`,
        category: 'obligations',
        sourceName: 'Licensed Microfinance Institution',
        title: 'Active Micro-Enterprise Equipment Loan',
        dateRange: { start: '2026-01-01', end: '2026-10-31' },
        totalOutflow: monthlyPayment * 8,
        balance: monthlyPayment * 2,
        status: 'consented_verified',
        recordCount: 8,
        traceabilityHash: `sha256-loan-${profileId.slice(-6)}`,
        notes: `Monthly installment GH₵ ${monthlyPayment}. 8 installments paid on time; 2 remaining.`,
        isActive: true,
      });
    }

    // Fallback: If user didn't check any streams, seed at least 1 basic MoMo stream so app has data
    if (records.length === 0) {
      records.push({
        id: `ev_momo_${profileId}`,
        category: 'transactions',
        sourceName: 'MTN Mobile Money Wallet',
        title: '3-Month Basic MoMo Statement',
        dateRange: { start: '2026-06-01', end: '2026-08-31' },
        totalInflow: Math.round(profile.capitalGoalAmount * 1.8),
        totalOutflow: Math.round(profile.capitalGoalAmount * 1.4),
        balance: Math.round(profile.capitalGoalAmount * 0.4),
        status: 'consented_verified',
        recordCount: 45,
        traceabilityHash: `sha256-starter-${profileId.slice(-6)}`,
        notes: 'Initial subscriber mobile money statement submitted during onboarding.',
        isActive: true,
      });
    }

    // Build Tailored Improvement Actions
    const actions: ImprovementAction[] = [];
    let rank = 1;

    // Action: Add missing sales ledger if less than 6 months
    if (!streams.hasSalesLedger || (streams.salesMonthsCount || 0) < 6) {
      actions.push({
        id: `act_${profileId}_docs`,
        rank: rank++,
        priority: 'High',
        title: 'Upload 3 Additional Months of Daily Sales Ledgers',
        rationale:
          'Your documentation completeness will jump from 53% to 85% by closing the March–May observation gap.',
        estimatedPointGain: 48,
        category: 'business',
        status: 'not_started',
        actionType: 'upload_document',
      });
    }

    // Action: Pay down active loan if active
    if (streams.hasActiveLoan) {
      actions.push({
        id: `act_${profileId}_debt`,
        rank: rank++,
        priority: 'Medium',
        title: 'Complete Final Installments on Existing Micro-loan',
        rationale:
          'Clearing current micro-loan obligations eliminates debt burden overhang, unlocking max debt service coverage.',
        estimatedPointGain: 24,
        category: 'obligations',
        status: 'not_started',
        actionType: 'reduce_debt',
      });
    }

    // Action: Start or expand Susu savings
    if (!streams.hasSusu) {
      actions.push({
        id: `act_${profileId}_susu`,
        rank: rank++,
        priority: 'Medium',
        title: 'Begin Weekly Market Susu Savings Routine',
        rationale:
          'Consistent weekly savings demonstrates reserve discipline to lenders and elevates your Savings Behaviour metric.',
        estimatedPointGain: 35,
        category: 'savings',
        status: 'not_started',
        actionType: 'consistent_savings',
      });
    }

    // Action: Statutory registration if missing
    if (!streams.hasStatutoryKyc) {
      actions.push({
        id: `act_${profileId}_kyc`,
        rank: rank++,
        priority: 'Medium',
        title: 'Register Business with Registrar General Department',
        rationale:
          'Formal registration and municipal operating permits boost institutional trust and elevate documentation points.',
        estimatedPointGain: 22,
        category: 'documents',
        status: 'not_started',
        actionType: 'upload_document',
      });
    }

    // Action: Bank SME statement if missing
    if (!streams.hasBank) {
      actions.push({
        id: `act_${profileId}_bank`,
        rank: rank++,
        priority: 'Low',
        title: 'Open Commercial SME Bank Account',
        rationale:
          'Routing 25%+ of receipts through a commercial bank account demonstrates formal banking relationships.',
        estimatedPointGain: 18,
        category: 'transactions',
        status: 'not_started',
        actionType: 'record_sales',
      });
    }

    // Action: Expense smoothing
    actions.push({
      id: `act_${profileId}_smooth`,
      rank: rank++,
      priority: 'Low',
      title: 'Stagger Bulk Inventory Restocking Across Bi-Weekly Cycles',
      rationale:
        'Avoiding single-day large cash outlays stabilizes weekly operating cashflow and boosts Cash-flow Stability.',
      estimatedPointGain: 22,
      category: 'transactions',
      status: 'not_started',
      actionType: 'record_sales',
    });

    return { profile, records, actions };
  }

  /**
   * Retrieves all profiles stored locally, always guaranteeing Ama Mensah exists at index 0
   */
  static getStoredProfiles(): UserProfile[] {
    try {
      const raw = safeGetItem(STORAGE_KEYS.PROFILES);
      if (!raw) return [AMA_PROFILE];
      const parsed: UserProfile[] = JSON.parse(raw);
      // Ensure Ama Mensah is always present as the reference benchmark at index 0
      const filtered = parsed.filter((p) => p.id !== AMA_PROFILE.id);
      return [AMA_PROFILE, ...filtered];
    } catch {
      return [AMA_PROFILE];
    }
  }

  /**
   * Persists a newly created profile into localStorage
   */
  static saveProfile(profile: UserProfile): void {
    try {
      const existing = this.getStoredProfiles();
      const filtered = existing.filter((p) => p.id !== profile.id && p.id !== AMA_PROFILE.id);
      const updated = [AMA_PROFILE, profile, ...filtered];
      safeSetItem(STORAGE_KEYS.PROFILES, JSON.stringify(updated));
    } catch {
      // Storage error fallback
    }
  }

  /**
   * Retrieves active profile ID from localStorage
   */
  static getActiveProfileId(): string {
    try {
      const id = safeGetItem(STORAGE_KEYS.ACTIVE_PROFILE_ID);
      if (!id) return AMA_PROFILE.id;
      const profiles = this.getStoredProfiles();
      if (!profiles.some((p) => p.id === id)) {
        return AMA_PROFILE.id;
      }
      return id;
    } catch {
      return AMA_PROFILE.id;
    }
  }

  /**
   * Sets active profile ID in localStorage
   */
  static setActiveProfileId(id: string): void {
    try {
      safeSetItem(STORAGE_KEYS.ACTIVE_PROFILE_ID, id);
    } catch {
      // Storage error fallback
    }
  }

  /**
   * Retrieves records for a specific profile ID
   */
  static getRecordsForProfile(profileId: string): EvidenceRecord[] {
    if (profileId === AMA_PROFILE.id) {
      try {
        const raw = safeGetItem(`${STORAGE_KEYS.RECORDS_PREFIX}${profileId}`);
        if (raw) return JSON.parse(raw);
      } catch {}
      return INITIAL_EVIDENCE_RECORDS;
    }
    try {
      const raw = safeGetItem(`${STORAGE_KEYS.RECORDS_PREFIX}${profileId}`);
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  }

  /**
   * Persists records for a specific profile ID
   */
  static saveRecordsForProfile(profileId: string, records: EvidenceRecord[]): void {
    try {
      safeSetItem(
        `${STORAGE_KEYS.RECORDS_PREFIX}${profileId}`,
        JSON.stringify(records)
      );
    } catch {}
  }

  /**
   * Retrieves improvement actions for a specific profile ID
   */
  static getActionsForProfile(profileId: string): ImprovementAction[] {
    if (profileId === AMA_PROFILE.id) {
      try {
        const raw = safeGetItem(`${STORAGE_KEYS.ACTIONS_PREFIX}${profileId}`);
        if (raw) return JSON.parse(raw);
      } catch {}
      return INITIAL_IMPROVEMENT_ACTIONS;
    }
    try {
      const raw = safeGetItem(`${STORAGE_KEYS.ACTIONS_PREFIX}${profileId}`);
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  }

  /**
   * Persists improvement actions for a specific profile ID
   */
  static saveActionsForProfile(profileId: string, actions: ImprovementAction[]): void {
    try {
      safeSetItem(
        `${STORAGE_KEYS.ACTIONS_PREFIX}${profileId}`,
        JSON.stringify(actions)
      );
    } catch {}
  }
}
