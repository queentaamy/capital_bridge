import React, { useState } from 'react';
import {
  Building2,
  ShieldCheck,
  CheckCircle2,
  Send,
  Printer,
  Download,
  Coins,
  FileText,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import type { FinancialPassport } from '../../types';

interface LenderViewProps {
  passport: FinancialPassport;
  onBackToApp?: () => void;
}

export type UnderwritingDecision =
  | 'pending'
  | 'approved'
  | 'conditional'
  | 'evidence_requested';

export const LenderView: React.FC<LenderViewProps> = ({
  passport,
  onBackToApp,
}) => {
  const [decision, setDecision] = useState<UnderwritingDecision>('pending');
  const [checklist, setChecklist] = useState({
    turnover: true,
    susuSavings: true,
    statutoryKyc: true,
    documentationDepth: false,
  });
  const [officerNotes, setOfficerNotes] = useState(
    'Borrower demonstrates continuous daily liquidity in Makola Market. Recommend advance with weekly Susu collection sweep.'
  );

  const toggleChecklist = (key: keyof typeof checklist) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePrintDossier = () => {
    window.print();
  };

  const handleDownloadDossier = () => {
    const data = {
      applicant: passport.userName,
      business: passport.businessName,
      score: passport.score,
      eci: passport.eci,
      requestedFacility: `${passport.capitalGoal.currency} ${passport.capitalGoal.amount}`,
      purpose: passport.capitalGoal.purpose,
      decision,
      officerNotes,
      verificationHash: passport.verificationHash,
      timestamp: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `underwriting_dossier_${passport.shareToken}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Lender Portal Nav */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-700 shadow-xs">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                CapitalBridge Institutional Reviewer
              </h3>
              <span className="text-[10px] uppercase font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2.5 py-0.5 rounded-full">
                MFI Underwriting Mode
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Verified Readiness Passport for Loan Committee & Credit Evaluation
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleDownloadDossier}
            className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3.5 py-2 rounded-xl transition shadow-xs"
            title="Download JSON audit dossier"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Dossier</span>
          </button>

          <button
            onClick={handlePrintDossier}
            className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3.5 py-2 rounded-xl transition shadow-xs"
            title="Print memorandum"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print Memo</span>
          </button>

          {onBackToApp && (
            <button
              onClick={onBackToApp}
              className="text-xs text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 font-bold px-3.5 py-2 rounded-xl transition sm:ml-1"
            >
              ← Borrower Dashboard
            </button>
          )}
        </div>
      </div>

      {/* Reviewer Overview Card */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-4 sm:p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
        {/* Header Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Verified Applicant Portfolio
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              {passport.userName}
            </h2>
            <div className="text-xs text-slate-500 font-medium">
              {passport.businessName} • {passport.businessType} • Makola Market, Accra
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 w-full sm:w-auto">
            <div className="text-left sm:text-right">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Readiness Score</div>
              <div className="text-3xl font-black text-slate-900 tabular-nums tracking-tight">
                {passport.score}
                <span className="text-xs font-normal text-slate-400">/1000</span>
              </div>
              <div className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block mt-0.5">
                {passport.readinessBand}
              </div>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Evidence Confidence</div>
              <div className="text-3xl font-black text-emerald-700 tabular-nums tracking-tight">
                {passport.eci}%
              </div>
              <div className="text-[10px] font-bold text-emerald-700 mt-0.5">
                Reliable Evidence
              </div>
            </div>
          </div>
        </div>

        {/* 4 Financial Underwriting Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
          <div className="bg-slate-50/80 border border-slate-200/70 p-4 rounded-2xl">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Debt Service Coverage (DSCR)
            </div>
            <div className="text-2xl font-black text-slate-900 tabular-nums mt-1">2.4x</div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
              ✓ Surpasses 1.25x MFI target
            </div>
          </div>

          <div className="bg-slate-50/80 border border-slate-200/70 p-4 rounded-2xl">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Monthly Free Cash Flow
            </div>
            <div className="text-2xl font-black text-slate-900 tabular-nums mt-1">GH₵ 2,100</div>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5">
              After GH₵500 Advans debt service
            </div>
          </div>

          <div className="bg-slate-50/80 border border-slate-200/70 p-4 rounded-2xl">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Target Capital Advance
            </div>
            <div className="text-2xl font-black text-emerald-700 tabular-nums mt-1">
              GH₵ {passport.capitalGoal.amount.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5">
              Working capital inventory purchase
            </div>
          </div>

          <div className="bg-slate-50/80 border border-slate-200/70 p-4 rounded-2xl">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Underwriting Risk Rating
            </div>
            <div className="text-2xl font-black text-emerald-700 mt-1">Low Risk</div>
            <div className="text-[11px] text-emerald-800 font-semibold mt-0.5">
              Tier 2 Pre-Approved Window
            </div>
          </div>
        </div>

        {/* Institutional Due-Diligence Audit Checklist */}
        <div className="mb-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>Underwriter Due-Diligence Checklist</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div
              onClick={() => toggleChecklist('turnover')}
              className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                checklist.turnover
                  ? 'bg-emerald-50/70 border-emerald-200/80 text-emerald-900'
                  : 'bg-white border-slate-200 text-slate-600'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-xs ${checklist.turnover ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  ✓
                </span>
                <div>
                  <div className="font-bold">Commercial Turnover Verified</div>
                  <div className="text-[11px] text-slate-500">6 months continuous MoMo & Bank inflows</div>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase text-emerald-700">Verified</span>
            </div>

            <div
              onClick={() => toggleChecklist('susuSavings')}
              className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                checklist.susuSavings
                  ? 'bg-emerald-50/70 border-emerald-200/80 text-emerald-900'
                  : 'bg-white border-slate-200 text-slate-600'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-xs ${checklist.susuSavings ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  ✓
                </span>
                <div>
                  <div className="font-bold">Susu Savings Consistency</div>
                  <div className="text-[11px] text-slate-500">24 unbroken weekly deposits (GH₵300/wk)</div>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase text-emerald-700">Verified</span>
            </div>

            <div
              onClick={() => toggleChecklist('statutoryKyc')}
              className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                checklist.statutoryKyc
                  ? 'bg-emerald-50/70 border-emerald-200/80 text-emerald-900'
                  : 'bg-white border-slate-200 text-slate-600'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-xs ${checklist.statutoryKyc ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  ✓
                </span>
                <div>
                  <div className="font-bold">Statutory & Municipal KYC</div>
                  <div className="text-[11px] text-slate-500">Registrar General & AMA Health Inspection active</div>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase text-emerald-700">Valid</span>
            </div>

            <div
              onClick={() => toggleChecklist('documentationDepth')}
              className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                checklist.documentationDepth
                  ? 'bg-emerald-50/70 border-emerald-200/80 text-emerald-900'
                  : 'bg-amber-50/70 border-amber-200/80 text-amber-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-xs ${checklist.documentationDepth ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white font-bold'}`}>
                  {checklist.documentationDepth ? '✓' : '!'}
                </span>
                <div>
                  <div className="font-bold">Documentation Depth (6 Months)</div>
                  <div className="text-[11px] text-amber-800/80">3 months missing sales books (March-May 2026)</div>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase text-amber-700">
                {checklist.documentationDepth ? 'Verified' : 'Actionable'}
              </span>
            </div>
          </div>
        </div>

        {/* Underwriting Decision Workspace */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 sm:p-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2 flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-emerald-600" />
            <span>Loan Officer Credit Determination</span>
          </h4>
          <p className="text-xs text-slate-500 mb-4 leading-relaxed font-medium">
            Make an official underwriting determination or dispatch targeted evidence requests to Ama's portal.
          </p>

          {/* Underwriter Notes Input */}
          <div className="mb-4">
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              Underwriting Memorandum Notes:
            </label>
            <textarea
              value={officerNotes}
              onChange={(e) => setOfficerNotes(e.target.value)}
              rows={2}
              className="w-full text-xs p-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-slate-800 font-medium"
            />
          </div>

          {/* Decision Outcome Displays */}
          {decision === 'approved' && (
            <div className="mb-4 p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-3 text-xs text-emerald-950">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <strong className="block font-bold">Credit Facility Approved: GH₵ 8,000.00</strong>
                <span className="text-emerald-800 font-medium">
                  Audit Ref: MFI-ACC-2026-09-842 • Ready for disbursement to Ecobank SME Account.
                </span>
              </div>
            </div>
          )}

          {decision === 'conditional' && (
            <div className="mb-4 p-4 bg-amber-50 border border-amber-300 rounded-2xl flex items-center gap-3 text-xs text-amber-950">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <strong className="block font-bold">Conditional Approval Granted</strong>
                <span className="text-amber-800 font-medium">
                  Facility approval contingent upon submitting 3 months reconstructed paper ledgers.
                </span>
              </div>
            </div>
          )}

          {decision === 'evidence_requested' && (
            <div className="mb-4 p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-3 text-xs text-emerald-950">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <strong className="block font-bold">Targeted Evidence Request Dispatched</strong>
                <span className="text-emerald-800 font-medium">
                  SMS & in-app action request sent to Ama Mensah to close the March-May 2026 gap.
                </span>
              </div>
            </div>
          )}

          {/* Decision Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => setDecision('approved')}
              className={`inline-flex items-center justify-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-xs ${
                decision === 'approved'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Approve Advance (GH₵8,000)</span>
            </button>

            <button
              onClick={() => setDecision('conditional')}
              className={`inline-flex items-center justify-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl transition border shadow-xs ${
                decision === 'conditional'
                  ? 'bg-amber-600 text-white border-amber-600'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Conditional Approval</span>
            </button>

            <button
              onClick={() => setDecision('evidence_requested')}
              className="inline-flex items-center justify-center gap-2 text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80 px-4 py-2.5 rounded-xl transition shadow-xs sm:ml-auto"
            >
              <Send className="w-3.5 h-3.5 text-emerald-600" />
              <span>Request Targeted Evidence</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
