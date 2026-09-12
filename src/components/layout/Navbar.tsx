import React from 'react';
import { ShieldCheck, Target, RefreshCw, ExternalLink } from 'lucide-react';
import type { UserProfile, ReadinessBand } from '../../types';

interface NavbarProps {
  profile: UserProfile;
  score: number;
  readinessBand: ReadinessBand;
  onResetDemo: () => void;
  onOpenPassport: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  profile,
  score,
  readinessBand,
  onResetDemo,
  onOpenPassport,
}) => {
  return (
    <header className="h-16 bg-slate-900/90 backdrop-blur border-b border-slate-800 sticky top-0 z-40 px-4 lg:px-8 flex items-center justify-between">
      {/* Brand & Demo Pill */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <span className="font-black text-slate-950 text-base tracking-tighter">CB</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white tracking-tight text-lg">CapitalBridge</span>
              <span className="text-[10px] uppercase font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                Prototype v1.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Financial-Readiness & Evidence Engine
            </p>
          </div>
        </div>
      </div>

      {/* Center/Right Profile Context */}
      <div className="flex items-center gap-3">
        {/* Active Demo Persona Pill */}
        <div className="hidden md:flex items-center gap-3 bg-slate-800/80 border border-slate-700/60 rounded-xl px-3.5 py-1.5 text-xs">
          <div className="w-7 h-7 rounded-lg bg-emerald-950 text-emerald-300 font-semibold flex items-center justify-center border border-emerald-500/30">
            AM
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-slate-200">{profile.name}</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400 truncate max-w-[140px]">{profile.businessName}</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-400">
              <Target className="w-3 h-3" />
              <span>Goal: {profile.currency} {profile.capitalGoalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Live Score Pill */}
        <div className="flex items-center gap-2 bg-slate-800/50 border border-slate-700/50 rounded-xl px-3 py-1.5">
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Readiness</div>
            <div className="text-xs font-bold text-emerald-400">{readinessBand}</div>
          </div>
          <div className="h-6 w-[1px] bg-slate-700" />
          <div className="text-lg font-black text-white tabular-nums tracking-tight">
            {score}
            <span className="text-xs font-normal text-slate-400">/1000</span>
          </div>
        </div>

        {/* Share Passport CTA */}
        <button
          onClick={onOpenPassport}
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3.5 py-2 rounded-xl transition shadow-md shadow-emerald-500/20 active:scale-95"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Passport</span>
          <ExternalLink className="w-3 h-3 opacity-60" />
        </button>

        {/* Reset Demo Button */}
        <button
          onClick={onResetDemo}
          title="Reset to Ama Mensah baseline (742 Score / 86% ECI)"
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
