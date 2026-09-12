import React from 'react';
import { ShieldCheck, HelpCircle } from 'lucide-react';
import type { EvidenceConfidenceIndex } from '../../types';

interface ECIBadgeProps {
  eci: EvidenceConfidenceIndex;
}

export const ECIBadge: React.FC<ECIBadgeProps> = ({ eci }) => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 relative overflow-hidden shadow-[0_4px_24px_-4px_rgba(0,0,0,0.03)] transition">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-base tracking-tight">Evidence Confidence Index (ECI)</h3>
            <span className="text-[10px] uppercase font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2 py-0.5 rounded-full">
              {eci.level} Confidence
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Integrity, completeness & cross-source consistency of submitted records
          </p>
        </div>

        {/* Overall Percentage Pill */}
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200/80 rounded-2xl px-3.5 py-1.5">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <span className="text-2xl font-black text-emerald-700 tabular-nums">
            {eci.overall}%
          </span>
        </div>
      </div>

      {/* Main explanation badge */}
      <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-4 mb-4">
        <p className="text-xs text-slate-700 leading-relaxed">
          <strong className="text-emerald-700 font-bold">{eci.label}:</strong> {eci.explanation}
        </p>
      </div>

      {/* ECI 3 Dimensions Breakdown */}
      <div className="space-y-3.5">
        {/* Completeness */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-700 font-semibold">1. Completeness (Time Coverage)</span>
            <span className="text-slate-900 font-bold tabular-nums">{eci.completeness}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-700"
              style={{ width: `${eci.completeness}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Covers 6 mos Mobile Money & Susu thrift records (sales book spans 3 mos).
          </p>
        </div>

        {/* Consistency */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-700 font-semibold">2. Cross-Source Consistency</span>
            <span className="text-slate-900 font-bold tabular-nums">{eci.consistency}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-700"
              style={{ width: `${eci.consistency}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Daily meal order ledger cross-checks within 92% of MoMo merchant inflows.
          </p>
        </div>

        {/* Traceability */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-700 font-semibold">3. Reliability & Provenance</span>
            <span className="text-slate-900 font-bold tabular-nums">{eci.traceability}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-teal-600 h-full rounded-full transition-all duration-700"
              style={{ width: `${eci.traceability}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Verified with registered telecom merchant hash and statutory agency licenses.
          </p>
        </div>
      </div>

      {/* Strict Compliance Alert */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
        <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span>
          <strong>Rule of Transparency:</strong> ECI measures evidence quality, not a statistical default prediction.
        </span>
      </div>
    </div>
  );
};
