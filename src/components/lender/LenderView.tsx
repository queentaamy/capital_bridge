import React, { useState } from 'react';
import {
  Building2,
  ShieldCheck,
  CheckCircle2,
  Send,
  FileSpreadsheet,
} from 'lucide-react';
import type { FinancialPassport } from '../../types';

interface LenderViewProps {
  passport: FinancialPassport;
  onBackToApp?: () => void;
}

export const LenderView: React.FC<LenderViewProps> = ({
  passport,
  onBackToApp,
}) => {
  const [requestedDoc, setRequestedDoc] = useState(false);

  const handleSendRequest = () => {
    setRequestedDoc(true);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Lender Portal Nav */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-sm">CapitalBridge Institutional Reviewer</h3>
              <span className="text-[10px] uppercase font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full">
                MFI / Bank Mode
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Verified Readiness Passport for Underwriting Assessment
            </p>
          </div>
        </div>

        {onBackToApp && (
          <button
            onClick={onBackToApp}
            className="text-xs text-slate-400 hover:text-white bg-slate-800 px-3 py-1.5 rounded-xl transition"
          >
            ← Return to Borrower Dashboard
          </button>
        )}
      </div>

      {/* Reviewer Overview Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Applicant</span>
            <h2 className="text-xl font-bold text-white">{passport.userName}</h2>
            <div className="text-xs text-slate-400">{passport.businessName} • {passport.businessType}</div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-slate-400">Readiness Score</div>
              <div className="text-2xl font-black text-white tabular-nums">
                {passport.score}
                <span className="text-xs font-normal text-slate-400">/1000</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-slate-400">Evidence Confidence</div>
              <div className="text-2xl font-black text-emerald-400 tabular-nums">
                {passport.eci}%
              </div>
            </div>
          </div>
        </div>

        {/* Capital Request Box */}
        <div className="my-6 bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <div className="text-slate-400">Requested Financing</div>
            <div className="text-lg font-bold text-emerald-400">
              {passport.capitalGoal.currency} {passport.capitalGoal.amount.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-slate-400">Declared Commercial Purpose</div>
            <div className="text-slate-200 font-medium">{passport.capitalGoal.purpose}</div>
          </div>
          <div className="shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Criteria Met</span>
            </span>
          </div>
        </div>

        {/* Action: Request Additional Evidence CTA */}
        <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-2 flex items-center gap-1.5">
            <FileSpreadsheet className="w-4 h-4 text-blue-400" />
            <span>Underwriter Action: Request Targeted Evidence</span>
          </h4>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            Need more verification before approving the inventory advance? One-click request sends a secure notification to the applicant's CapitalBridge portal.
          </p>

          {requestedDoc ? (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3.5 flex items-center gap-2 text-xs text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Evidence request dispatched to Ama Mensah via SMS and in-app action item.
              </span>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs text-slate-300 bg-slate-900 border border-slate-800 px-3 py-2 rounded-lg flex-1">
                Requested: <strong>3 Additional Months of Daily Sales Books (March - May 2026)</strong>
              </div>
              <button
                onClick={handleSendRequest}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-md shadow-blue-500/20 active:scale-95 shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Request Targeted Evidence</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
