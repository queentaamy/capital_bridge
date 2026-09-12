import React, { useState } from 'react';
import {
  ShieldCheck,
  Copy,
  Check,
  Printer,
  Building,
  Calendar,
  Eye,
  EyeOff,
  ExternalLink,
  Download,
  QrCode,
  X,
} from 'lucide-react';
import type { FinancialPassport } from '../../types';

interface FinancialPassportViewProps {
  passport: FinancialPassport;
  onOpenLenderView?: (token: string) => void;
}

export const FinancialPassportView: React.FC<FinancialPassportViewProps> = ({
  passport,
  onOpenLenderView,
}) => {
  const [copied, setCopied] = useState(false);
  const [showRawBalances, setShowRawBalances] = useState(passport.privacySettings.showRawBalances);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  const shareUrl = `${window.location.origin}/?view=lender&token=${passport.shareToken}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCredentials = () => {
    const exportData = {
      title: 'CapitalBridge Financial Readiness Passport',
      issuedTo: passport.userName,
      businessName: passport.businessName,
      businessType: passport.businessType,
      readinessScore: passport.score,
      readinessBand: passport.readinessBand,
      evidenceConfidenceIndex: `${passport.eci}% (${passport.eciLevel})`,
      capitalGoal: {
        amount: showRawBalances ? `${passport.capitalGoal.currency} ${passport.capitalGoal.amount}` : 'MASKED',
        purpose: passport.capitalGoal.purpose,
      },
      verificationHash: passport.verificationHash,
      shareToken: passport.shareToken,
      verifiedSources: passport.verifiedEvidenceSummary,
      issuedAt: new Date().toISOString(),
      disclaimer: 'This certificate reflects verified historical financial activity. It is non-lending and non-guarantee.',
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `capitalbridge_passport_${passport.shareToken}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Verified Financial Passport</h2>
            <span className="text-[10px] uppercase font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2.5 py-0.5 rounded-full">
              Audited Snapshot
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            An institutional-grade readiness profile ready to share with lenders, MFIs, and grant programs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Privacy Toggle */}
          <button
            onClick={() => setShowRawBalances(!showRawBalances)}
            className="inline-flex items-center gap-1.5 text-xs text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200/80 px-3 py-2 rounded-xl transition shadow-xs font-semibold"
          >
            {showRawBalances ? <EyeOff className="w-3.5 h-3.5 text-slate-500" /> : <Eye className="w-3.5 h-3.5 text-slate-500" />}
            <span>{showRawBalances ? 'Mask Balances' : 'Show Balances'}</span>
          </button>

          {/* Copy Share Link */}
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 px-3.5 py-2 rounded-xl transition border border-slate-200/80 shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 font-bold" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copied ? 'Link Copied' : 'Share Link'}</span>
          </button>

          {/* Download JSON Credentials */}
          <button
            onClick={handleDownloadCredentials}
            className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 px-3.5 py-2 rounded-xl transition border border-slate-200/80 shadow-xs"
            title="Download credentials JSON"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Download</span>
          </button>

          {/* Print / Export */}
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl transition shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Export / Print</span>
          </button>
        </div>
      </div>

      {/* The Passport Card (Fintech Credential) */}
      <div className="bg-white border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.05)] relative overflow-hidden text-slate-800">
        {/* Decorative corner watermark */}
        <div className="absolute -top-16 -right-16 w-60 h-60 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

        {/* Passport Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-black text-2xl shadow-md shadow-emerald-500/20">
              CB
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">
                  CapitalBridge Passport
                </span>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xs text-slate-500 font-medium">
                Official Financial-Readiness Certificate
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                Ref: {passport.verificationHash}
              </div>
            </div>
          </div>

          <div className="flex sm:flex-col items-end justify-between sm:justify-start gap-1">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Valid Through</div>
            <div className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Oct 12, 2026</span>
            </div>
          </div>
        </div>

        {/* Privacy Shield Banner */}
        {!showRawBalances && (
          <div className="my-4 p-3.5 bg-emerald-50 border border-emerald-200/80 rounded-2xl flex items-center gap-2 text-xs text-emerald-900 font-medium">
            <EyeOff className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>
              <strong>Privacy Shield Active:</strong> Exact currency figures are masked. Institutional reviewers view only verified readiness scores, ECI reliability ratios, and audit provenance.
            </span>
          </div>
        )}

        {/* Borrower & Business Profile Box */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6 bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 text-xs">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Borrower / Founder</div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">{passport.userName}</div>
            <div className="text-[11px] text-slate-500 font-medium">{passport.businessType}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Enterprise</div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">{passport.businessName}</div>
            <div className="text-[11px] text-slate-500 font-medium">Makola Market, Accra</div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Capital Target</div>
            <div className="text-sm font-bold text-emerald-700 mt-0.5">
              {showRawBalances
                ? `${passport.capitalGoal.currency} ${passport.capitalGoal.amount.toLocaleString()}`
                : `${passport.capitalGoal.currency} •••••• (Tier 2 SME)`}
            </div>
            <div className="text-[11px] text-slate-500 truncate font-medium">{passport.capitalGoal.purpose}</div>
          </div>
        </div>

        {/* Key Scores & Verification Badges */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Readiness Score Box */}
          <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Financial Readiness Score
              </div>
              <div className="text-3xl font-black text-slate-900 tabular-nums tracking-tight mt-1">
                {passport.score}
                <span className="text-sm font-normal text-slate-400">/1000</span>
              </div>
              <div className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full mt-2">
                {passport.readinessBand}
              </div>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-center text-emerald-600 shadow-xs">
              <ShieldCheck className="w-8 h-8" />
            </div>
          </div>

          {/* ECI Box & Clickable QR Code */}
          <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Evidence Confidence Index (ECI)
              </div>
              <div className="text-3xl font-black text-emerald-800 tabular-nums tracking-tight mt-1">
                {passport.eci}%
              </div>
              <div className="text-[11px] text-emerald-700 font-bold mt-2">
                {passport.eciLevel}
              </div>
            </div>

            <button
              onClick={() => setIsQrModalOpen(true)}
              title="Click to view cryptographic QR proof"
              className="w-16 h-16 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/80 p-1.5 flex flex-col items-center justify-center relative group shadow-xs transition cursor-pointer"
            >
              <svg viewBox="0 0 32 32" className="w-11 h-11 text-slate-900 fill-current group-hover:scale-105 transition" aria-label="QR Verification Token">
                {/* Corner Squares */}
                <path d="M2 2h8v8H2zM4 4v4h4V4H4zM22 2h8v8h-8zM24 4v4h4V4h-4zM2 22h8v8H2zM4 24v4h4v-4H4z" />
                <rect x="5" y="5" width="2" height="2" />
                <rect x="25" y="5" width="2" height="2" />
                <rect x="5" y="25" width="2" height="2" />
                {/* Matrix Bits */}
                <rect x="12" y="2" width="2" height="2" />
                <rect x="18" y="2" width="2" height="2" />
                <rect x="14" y="6" width="4" height="2" />
                <rect x="12" y="10" width="2" height="4" />
                <rect x="18" y="10" width="2" height="4" />
                <rect x="6" y="14" width="4" height="2" />
                <rect x="22" y="14" width="4" height="2" />
                <rect x="14" y="14" width="4" height="4" />
                <rect x="12" y="20" width="2" height="4" />
                <rect x="18" y="20" width="2" height="4" />
                <rect x="22" y="22" width="2" height="2" />
                <rect x="28" y="22" width="2" height="4" />
                <rect x="24" y="26" width="4" height="2" />
                <rect x="14" y="26" width="4" height="2" />
              </svg>
              <div className="text-[7px] text-slate-400 font-mono tracking-tighter uppercase font-bold">
                SCAN VERIFY
              </div>
            </button>
          </div>
        </div>

        {/* Verified Indicators Grid */}
        <div className="mb-6">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Core Verified Financial Indicators
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
            {passport.keyIndicators.map((ind, i) => (
              <div
                key={i}
                className="bg-slate-50/80 border border-slate-200/70 p-3.5 rounded-2xl flex flex-col justify-between"
              >
                <div className="text-slate-500 text-[11px] truncate font-medium">{ind.label}</div>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-lg font-bold text-slate-900 tabular-nums">{ind.value}</span>
                  <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                    {ind.level === 'gap' ? 'Needs Polish' : 'Verified'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Supporting Evidence Traceability Table */}
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Verified Evidence Provenance
          </div>
          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden text-xs shadow-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200/80 text-[10px] uppercase text-slate-400 bg-slate-50/70 font-bold">
                  <th className="p-3.5">Evidence Category</th>
                  <th className="p-3.5">Verified Source</th>
                  <th className="p-3.5">Observation Window</th>
                  <th className="p-3.5 text-right">Audit Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {passport.verifiedEvidenceSummary.map((ev, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition">
                    <td className="p-3.5 font-bold text-slate-900">{ev.category}</td>
                    <td className="p-3.5 text-slate-600 font-medium">{ev.source}</td>
                    <td className="p-3.5 text-slate-500">{ev.monthsCovered} Months Continuous</td>
                    <td className="p-3.5 text-right">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>Verified</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Disclaimers */}
        <div className="mt-8 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] text-slate-400">
          <div>
            Built with CapitalBridge Ghana 2026. Non-lending financial-readiness passport.
          </div>
          <div className="font-mono font-medium">
            Verification Token: {passport.shareToken}
          </div>
        </div>
      </div>

      {/* Lender View Demo Callout */}
      {onOpenLenderView && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 flex items-center justify-between text-xs shadow-xs">
          <div className="flex items-center gap-2.5">
            <Building className="w-4 h-4 text-emerald-600" />
            <span className="text-slate-600 font-medium">
              Want to see how a loan officer or MFI views this passport?
            </span>
          </div>
          <button
            onClick={() => onOpenLenderView(passport.shareToken)}
            className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-bold bg-emerald-50 hover:bg-emerald-100 px-3.5 py-1.5 rounded-xl transition border border-emerald-200"
          >
            <span>Open Lender Review Screen</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Cryptographic QR Verification Modal */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl relative">
            <button
              onClick={() => setIsQrModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-3">
              <QrCode className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-slate-900">Cryptographic Verification Proof</h3>
            <p className="text-xs text-slate-500 mt-1">
              Tamper-evident verification token anchored to Ama Mensah's verified evidence snapshot.
            </p>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl my-4 text-left font-mono text-xs">
              <div className="text-[10px] uppercase font-bold text-slate-400 font-sans mb-1">
                Audit Token:
              </div>
              <div className="text-slate-800 font-bold break-all select-all">
                {passport.verificationHash}
              </div>
              <div className="mt-3 pt-3 border-t border-slate-200 text-[10px] text-slate-500 font-sans">
                Status: <strong className="text-emerald-700">Verified by CapitalBridge Ghana</strong>
              </div>
            </div>

            <button
              onClick={() => setIsQrModalOpen(false)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition"
            >
              Close Verification Proof
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
