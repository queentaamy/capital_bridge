// ============================================================================
// CapitalBridge First-Time Visitor Landing Hero
// Specification: GirlCode Hackathon Ghana 2026
// ============================================================================

import React from 'react';
import { ArrowRight, ShieldCheck, FileCheck2, Gauge } from 'lucide-react';
import type { UserProfile } from '../../types';

interface LandingHeroProps {
  onStartDemo: () => void;
  onBuildProfile: () => void;
  onSignIn: () => void;
  profiles?: UserProfile[];
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onStartDemo,
  onBuildProfile,
  onSignIn,
}) => {
  return (
    <div className="min-h-screen bg-[#FBFBFA] text-slate-900 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Minimal Navigation Bar (matching screenshot) */}
      <header className="w-full max-w-6xl mx-auto px-6 sm:px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={onStartDemo}>
          <div className="w-9 h-9 rounded-xl bg-[#0B5738] flex items-center justify-center text-white font-black text-sm shadow-xs">
            CB
          </div>
          <span className="font-bold text-slate-900 text-lg tracking-tight">
            CapitalBridge
          </span>
        </div>

        <button
          onClick={onSignIn}
          className="text-sm font-semibold text-slate-700 hover:text-slate-950 transition cursor-pointer px-4 py-2 rounded-xl hover:bg-slate-100/80 border border-transparent hover:border-slate-200"
        >
          Sign in
        </button>
      </header>

      {/* Hero Section (Matching exact typography and spacing of screenshot) */}
      <main className="flex-1 max-w-6xl mx-auto px-6 sm:px-8 pt-16 sm:pt-24 pb-20 flex flex-col justify-start">
        <div className="max-w-3xl space-y-6">
          {/* Eyebrow */}
          <div className="text-xs font-mono font-bold tracking-[0.2em] text-[#0B5738] uppercase">
            Financial Readiness Infrastructure
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl font-black text-slate-950 tracking-tight leading-[1.08]">
            You may be financially active. But can you prove it?
          </h1>

          {/* Subtitle / Explainer */}
          <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-2xl pt-2">
            Millions of traders, informal workers and small business owners earn, save and repay every month — and stay invisible to finance. CapitalBridge turns that scattered activity into an explainable readiness profile you can understand, improve and share.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3.5 pt-4">
            <button
              onClick={onStartDemo}
              className="inline-flex items-center gap-2 bg-[#0B5738] hover:bg-[#08452c] text-white text-sm font-semibold px-6 py-3.5 rounded-xl shadow-xs transition hover:shadow-md cursor-pointer active:scale-[0.99]"
            >
              <span>Start with Ama&apos;s demo</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onBuildProfile}
              className="inline-flex items-center justify-center bg-white hover:bg-slate-50 text-slate-800 text-sm font-semibold px-6 py-3.5 rounded-xl border border-slate-200 shadow-2xs transition cursor-pointer active:scale-[0.99]"
            >
              Build my own profile
            </button>
          </div>
        </div>

        {/* Feature Cards below fold */}
        <div className="mt-24 pt-12 border-t border-slate-200/60 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/70 shadow-2xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#0B5738] flex items-center justify-center font-bold text-xs">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Evidence Collection</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Aggregate mobile money statements, bank receipts, Susu thrift passbooks, and handwritten paper ledgers into verified trails.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/70 shadow-2xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#0B5738] flex items-center justify-center font-bold text-xs">
              <Gauge className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Deterministic Readiness</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              A transparent 0–1000 readiness score across 6 indicators with audited formulas, eliminating black-box algorithms.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/70 shadow-2xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#0B5738] flex items-center justify-center font-bold text-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Financial Passport</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Export an institutional-ready dossier with cryptographic QR verification for microfinance institutions and loan committees.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto px-6 sm:px-8 py-6 border-t border-slate-200/60 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3">
        <span>GirlCode Hackathon Ghana 2026 • CapitalBridge Infrastructure</span>
        <div className="flex items-center gap-4">
          <button onClick={onStartDemo} className="hover:text-emerald-800 transition cursor-pointer">
            Explore Ama Mensah (742 PTS)
          </button>
          <span>•</span>
          <button onClick={onBuildProfile} className="hover:text-emerald-800 transition cursor-pointer">
            Onboard New Profile
          </button>
        </div>
      </footer>
    </div>
  );
};
