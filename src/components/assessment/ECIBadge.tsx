import React from 'react';
import { ShieldCheck, HelpCircle } from 'lucide-react';
import type { EvidenceConfidenceIndex } from '../../types';

interface ECIBadgeProps {
  eci: EvidenceConfidenceIndex;
}

export const ECIBadge: React.FC<ECIBadgeProps> = ({ eci }) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-white text-base">Evidence Confidence Index (ECI)</h3>
            <span className="text-[10px] uppercase font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              {eci.level} Confidence
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Integrity, completeness & cross-source consistency of submitted records
          </p>
        </div>

        {/* Overall Percentage Pill */}
        <div className="flex items-center gap-2 bg-emerald-950/60 border border-emerald-500/40 rounded-xl px-3 py-1.5">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span className="text-2xl font-black text-emerald-300 tabular-nums">
            {eci.overall}%
          </span>
        </div>
      </div>

      {/* Main explanation badge */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 mb-4">
        <p className="text-xs text-slate-300 leading-relaxed">
          <strong className="text-emerald-400">{eci.label}:</strong> {eci.explanation}
        </p>
      </div>

      {/* ECI 3 Dimensions Breakdown */}
      <div className="space-y-3">
        {/* Completeness */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-300 font-medium">1. Completeness (Time Coverage)</span>
            <span className="text-white font-bold tabular-nums">{eci.completeness}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-teal-500 h-full rounded-full transition-all duration-700"
              style={{ width: `${eci.completeness}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Covers 6 mos Mobile Money & Susu thrift records (sales book spans 3 mos).
          </p>
        </div>

        {/* Consistency */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-300 font-medium">2. Cross-Source Consistency</span>
            <span className="text-white font-bold tabular-nums">{eci.consistency}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-700"
              style={{ width: `${eci.consistency}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Daily meal order ledger cross-checks within 92% of MoMo merchant inflows.
          </p>
        </div>

        {/* Traceability */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-300 font-medium">3. Reliability & Provenance</span>
            <span className="text-white font-bold tabular-nums">{eci.traceability}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-cyan-500 h-full rounded-full transition-all duration-700"
              style={{ width: `${eci.traceability}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Verified with registered telecom merchant hash and statutory agency licenses.
          </p>
        </div>
      </div>

      {/* Strict Compliance Alert */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-2 text-[11px] text-slate-400">
        <HelpCircle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        <span>
          <strong>Rule of Transparency:</strong> ECI measures evidence quality, not a statistical default prediction.
        </span>
      </div>
    </div>
  );
};
