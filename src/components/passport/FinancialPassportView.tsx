import React, { useState } from 'react';
import {
  ShieldCheck,
  Copy,
  Check,
  Printer,
  QrCode,
  Building,
  Calendar,
  Eye,
  EyeOff,
  ExternalLink,
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

  const shareUrl = `${window.location.origin}/?view=lender&token=${passport.shareToken}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">Verified Financial Passport</h2>
            <span className="text-[10px] uppercase font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              Audited Snapshot
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            An institutional-grade readiness profile ready to share with lenders, MFIs, and grant programs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Privacy Toggle */}
          <button
            onClick={() => setShowRawBalances(!showRawBalances)}
            className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-xl transition"
          >
            {showRawBalances ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showRawBalances ? 'Mask Balances' : 'Show Balances'}</span>
          </button>

          {/* Copy Share Link */}
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 rounded-xl transition border border-slate-700"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Link Copied' : 'Share Link'}</span>
          </button>

          {/* Print / Download */}
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 rounded-xl transition shadow-md shadow-emerald-500/20"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Export / Print</span>
          </button>
        </div>
      </div>

      {/* The Passport Card (Fintech Credential) */}
      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden text-slate-200">
        {/* Decorative corner watermark */}
        <div className="absolute -top-16 -right-16 w-60 h-60 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

        {/* Passport Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black text-2xl shadow-lg shadow-emerald-500/30">
              CB
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white tracking-tight">
                  CapitalBridge Passport
                </span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-xs text-slate-400">
                Official Financial-Readiness Certificate
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                Ref: {passport.verificationHash}
              </div>
            </div>
          </div>

          <div className="flex sm:flex-col items-end justify-between sm:justify-start gap-1">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Valid Through</div>
            <div className="text-xs font-semibold text-slate-200 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Oct 12, 2026</span>
            </div>
          </div>
        </div>

        {/* Borrower & Business Profile Box */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6 bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 text-xs">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Borrower / Founder</div>
            <div className="text-sm font-bold text-white mt-0.5">{passport.userName}</div>
            <div className="text-[11px] text-slate-400">{passport.businessType}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Enterprise</div>
            <div className="text-sm font-bold text-white mt-0.5">{passport.businessName}</div>
            <div className="text-[11px] text-slate-400">Makola Market, Accra</div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Capital Target</div>
            <div className="text-sm font-bold text-emerald-400 mt-0.5">
              {passport.capitalGoal.currency} {passport.capitalGoal.amount.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 truncate">{passport.capitalGoal.purpose}</div>
          </div>
        </div>

        {/* Key Scores & Verification Badges */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Readiness Score Box */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Financial Readiness Score
              </div>
              <div className="text-3xl font-black text-white tabular-nums tracking-tight mt-1">
                {passport.score}
                <span className="text-sm font-normal text-slate-400">/1000</span>
              </div>
              <div className="inline-block text-[10px] font-bold text-teal-400 bg-teal-500/10 border border-teal-500/30 px-2.5 py-0.5 rounded-full mt-2">
                {passport.readinessBand}
              </div>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-teal-400">
              <ShieldCheck className="w-8 h-8" />
            </div>
          </div>

          {/* ECI Box */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Evidence Confidence Index (ECI)
              </div>
              <div className="text-3xl font-black text-emerald-300 tabular-nums tracking-tight mt-1">
                {passport.eci}%
              </div>
              <div className="text-[11px] text-emerald-400 font-medium mt-2">
                {passport.eciLevel}
              </div>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400">
              <QrCode className="w-8 h-8 opacity-80" />
            </div>
          </div>
        </div>

        {/* Verified Indicators Grid */}
        <div className="mb-6">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Core Verified Financial Indicators
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
            {passport.keyIndicators.map((ind, i) => (
              <div
                key={i}
                className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl flex flex-col justify-between"
              >
                <div className="text-slate-400 text-[11px] truncate">{ind.label}</div>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-lg font-bold text-white tabular-nums">{ind.value}</span>
                  <span className="text-[10px] uppercase font-semibold text-emerald-400">
                    {ind.level === 'gap' ? 'Needs Polish' : 'Verified'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Supporting Evidence Traceability Table */}
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Verified Evidence Provenance
          </div>
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] uppercase text-slate-400 bg-slate-900/50">
                  <th className="p-3">Evidence Category</th>
                  <th className="p-3">Verified Source</th>
                  <th className="p-3">Observation Window</th>
                  <th className="p-3 text-right">Audit Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {passport.verifiedEvidenceSummary.map((ev, i) => (
                  <tr key={i} className="hover:bg-slate-900/30 transition">
                    <td className="p-3 font-semibold text-white">{ev.category}</td>
                    <td className="p-3 text-slate-300">{ev.source}</td>
                    <td className="p-3 text-slate-400">{ev.monthsCovered} Months Continuous</td>
                    <td className="p-3 text-right">
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        <ShieldCheck className="w-3 h-3" />
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
        <div className="mt-8 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] text-slate-500">
          <div>
            Built with CapitalBridge Ghana 2026. Non-lending financial-readiness passport.
          </div>
          <div className="font-mono">
            Verification Token: {passport.shareToken}
          </div>
        </div>
      </div>

      {/* Lender View Demo Callout */}
      {onOpenLenderView && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <Building className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-300">
              Want to see how a loan officer or MFI views this passport?
            </span>
          </div>
          <button
            onClick={() => onOpenLenderView(passport.shareToken)}
            className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-bold"
          >
            <span>Open Lender Review Screen</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
