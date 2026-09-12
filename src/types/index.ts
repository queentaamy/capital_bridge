// ==========================================
// CapitalBridge Domain Types & Data Contracts
// Specification: GirlCode Hackathon Ghana 2026
// ==========================================

export type EvidenceCategory =
  | 'transactions'
  | 'savings'
  | 'business'
  | 'obligations'
  | 'documents';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  businessName: string;
  businessType: string;
  businessLocation: string;
  capitalGoalAmount: number; // e.g. 8000 for GH₵8,000
  capitalGoalPurpose: string; // e.g. "Inventory & bulk purchase for food kiosk"
  createdAt: string;
  currency: string; // 'GHS' (GH₵)
}

export interface EvidenceRecord {
  id: string;
  category: EvidenceCategory;
  sourceName: string; // e.g. "MTN Mobile Money", "Ecobank SME Account", "Daily Paper Ledger"
  title: string;
  dateRange: {
    start: string;
    end: string;
  };
  totalInflow?: number;
  totalOutflow?: number;
  balance?: number;
  status: 'consented_verified' | 'pending_verification' | 'simulated_demo';
  recordCount: number;
  traceabilityHash?: string;
  notes?: string;
  isActive: boolean; // can toggle to test removing evidence
}

export type IndicatorKey =
  | 'income_consistency'
  | 'cashflow_stability'
  | 'savings_behaviour'
  | 'debt_burden'
  | 'business_activity'
  | 'documentation_completeness';

export type IndicatorLevel = 'excellent' | 'good' | 'moderate' | 'gap';

export interface IndicatorResult {
  key: IndicatorKey;
  label: string;
  description: string;
  value: number; // 0 - 100 normalized score
  weight: number; // fraction of 1000 total (e.g. 0.20 = 200 pts max)
  pointsEarned: number; // value * weight * 10
  maxPoints: number; // weight * 1000
  level: IndicatorLevel;
  contributingEvidence: string[];
  gapSummary: string;
  calculationFormula: string;
  strengths: string[];
  recommendations: string[];
}

export interface EvidenceConfidenceIndex {
  overall: number; // percentage (e.g. 86%)
  completeness: number; // percentage (e.g. 88%)
  consistency: number; // percentage (e.g. 85%)
  traceability: number; // percentage (e.g. 85%)
  level: 'High' | 'Moderate' | 'Low';
  label: string; // "High confidence in available evidence"
  explanation: string;
  missingDataWarnings: string[];
}

export type ReadinessBand =
  | 'Prime Ready' // 850 - 1000
  | 'Capital Ready' // 700 - 849
  | 'Near Ready' // 550 - 699
  | 'Building Readiness'; // 0 - 549

export interface AssessmentResult {
  id: string;
  profileId: string;
  overallScore: number; // 0 - 1000 scale (e.g. 742)
  readinessBand: ReadinessBand;
  bandDescription: string;
  methodologyVersion: string; // e.g. "v1.0-prototype-ghana"
  calculatedAt: string;
  indicators: Record<IndicatorKey, IndicatorResult>;
  eci: EvidenceConfidenceIndex;
  topStrengths: string[];
  topGaps: string[];
}

export interface WhatIfScenarioInput {
  addBusinessRecordsMonths: number; // e.g. 3 months
  reduceMonthlyDebtAmount: number; // e.g. 500 GH₵
  improveSavingsConsistency: boolean;
  reduceExpenseVolatility: boolean;
  disableMissingDocs: boolean;
}

export interface WhatIfScenarioResult {
  baseScore: number;
  scenarioScore: number;
  scoreDelta: number;
  baseECI: number;
  scenarioECI: number;
  eciDelta: number;
  changedIndicators: Array<{
    key: IndicatorKey;
    label: string;
    beforeValue: number;
    afterValue: number;
    delta: number;
  }>;
  explanation: string;
  keyDrivers: string[];
}

export interface ImprovementAction {
  id: string;
  priority: 'High' | 'Medium' | 'Low';
  rank: number;
  title: string;
  rationale: string;
  estimatedPointGain: number; // e.g. +35 pts
  category: EvidenceCategory;
  status: 'not_started' | 'in_progress' | 'completed';
  actionType: 'upload_document' | 'reduce_debt' | 'consistent_savings' | 'record_sales';
}

export interface FinancialPassport {
  id: string;
  profileId: string;
  assessmentId: string;
  shareToken: string; // URL slug e.g. "cb-ama-742-inv"
  userName: string;
  businessName: string;
  businessType: string;
  capitalGoal: {
    amount: number;
    currency: string;
    purpose: string;
  };
  score: number;
  readinessBand: ReadinessBand;
  eci: number;
  eciLevel: string;
  verificationHash: string;
  keyIndicators: Array<{
    label: string;
    value: number;
    level: IndicatorLevel;
  }>;
  verifiedEvidenceSummary: Array<{
    category: string;
    source: string;
    monthsCovered: number;
    verified: boolean;
  }>;
  privacySettings: {
    showRawBalances: boolean;
    showTransactionDetails: boolean;
    showObligationDetails: boolean;
  };
  expiresAt: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'coach';
  text: string;
  timestamp: string;
  suggestedPrompts?: string[];
  relatedIndicator?: IndicatorKey;
}
