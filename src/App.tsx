import { useState, useMemo } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, type TabType } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { ReadinessGauge } from './components/assessment/ReadinessGauge';
import { ECIBadge } from './components/assessment/ECIBadge';
import { IndicatorCard } from './components/assessment/IndicatorCard';
import { ExplainabilityModal } from './components/assessment/ExplainabilityModal';
import { EvidenceManager } from './components/evidence/EvidenceManager';
import { WhatIfSimulator } from './components/simulator/WhatIfSimulator';
import { CreditCoach } from './components/ai/CreditCoach';
import { ImprovementPlan } from './components/actions/ImprovementPlan';
import { FinancialPassportView } from './components/passport/FinancialPassportView';
import { LenderView } from './components/lender/LenderView';

import {
  AMA_PROFILE,
  INITIAL_EVIDENCE_RECORDS,
  INITIAL_IMPROVEMENT_ACTIONS,
  SEEDED_FINANCIAL_PASSPORT,
} from './data/seedData';
import { calculateAssessment } from './services/assessmentEngine';
import type {
  EvidenceRecord,
  ImprovementAction,
  IndicatorResult,
  IndicatorKey,
} from './types';

import {
  Sparkles,
  ArrowRight,
  SlidersHorizontal,
  Bot,
  ListTodo,
  FileCheck2,
} from 'lucide-react';

export function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [profile] = useState(AMA_PROFILE);
  const [records, setRecords] = useState<EvidenceRecord[]>(INITIAL_EVIDENCE_RECORDS);
  const [actions, setActions] = useState<ImprovementAction[]>(INITIAL_IMPROVEMENT_ACTIONS);
  const [inspectingIndicator, setInspectingIndicator] = useState<IndicatorResult | null>(null);

  // Deterministically compute live assessment from active records
  const assessment = useMemo(() => {
    return calculateAssessment(profile.id, records);
  }, [profile.id, records]);

  // Handle toggling an evidence record on/off
  const handleToggleRecord = (recordId: string) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === recordId ? { ...r, isActive: !r.isActive } : r))
    );
  };

  // Handle adding new simulated evidence
  const handleAddRecord = (newRecord: Omit<EvidenceRecord, 'id' | 'isActive'>) => {
    const created: EvidenceRecord = {
      ...newRecord,
      id: `ev_${Date.now()}`,
      isActive: true,
    };
    setRecords((prev) => [created, ...prev]);
  };

  // Handle action plan status toggle
  const handleToggleActionStatus = (actionId: string) => {
    setActions((prev) =>
      prev.map((a) => {
        if (a.id !== actionId) return a;
        const nextStatus =
          a.status === 'not_started'
            ? 'in_progress'
            : a.status === 'in_progress'
            ? 'completed'
            : 'not_started';
        return { ...a, status: nextStatus };
      })
    );
  };

  // Reset to Ama Mensah baseline
  const handleResetDemo = () => {
    setRecords(INITIAL_EVIDENCE_RECORDS);
    setActions(INITIAL_IMPROVEMENT_ACTIONS);
    setCurrentTab('dashboard');
  };

  const openTasksCount = actions.filter((a) => a.status !== 'completed').length;
  const activeRecordsCount = records.filter((r) => r.isActive).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased pb-16 lg:pb-0">
      {/* Top Navigation */}
      <Navbar
        profile={profile}
        score={assessment.overallScore}
        readinessBand={assessment.readinessBand}
        onResetDemo={handleResetDemo}
        onOpenPassport={() => setCurrentTab('passport')}
      />

      <div className="flex-1 flex w-full max-w-[1600px] mx-auto">
        {/* Desktop Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          evidenceCount={activeRecordsCount}
          openTasksCount={openTasksCount}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {/* 1. DASHBOARD / OVERVIEW */}
          {currentTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Persona Welcome & Capital Goal Banner */}
              <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-emerald-950/30 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
                    <Sparkles className="w-4 h-4" />
                    <span>Evidence-Based Readiness Profile</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Welcome back, {profile.name}
                  </h1>
                  <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                    Your financial records are compiled into a transparent readiness profile. You are currently{' '}
                    <strong className="text-emerald-400">{assessment.readinessBand}</strong> for your{' '}
                    <strong>{profile.currency} {profile.capitalGoalAmount.toLocaleString()}</strong> working capital goal.
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                  <button
                    onClick={() => setCurrentTab('simulator')}
                    className="inline-flex items-center gap-2 text-xs font-bold bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 px-4 py-2.5 rounded-xl transition"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    <span>Run What-If Test</span>
                  </button>

                  <button
                    onClick={() => setCurrentTab('coach')}
                    className="inline-flex items-center gap-2 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2.5 rounded-xl transition shadow-md shadow-emerald-500/20"
                  >
                    <Bot className="w-4 h-4" />
                    <span>Ask AI Coach</span>
                  </button>
                </div>
              </div>

              {/* Core Meters: Readiness Gauge (742) + ECI (86%) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ReadinessGauge
                  score={assessment.overallScore}
                  band={assessment.readinessBand}
                  bandDescription={assessment.bandDescription}
                  methodologyVersion={assessment.methodologyVersion}
                />
                <ECIBadge eci={assessment.eci} />
              </div>

              {/* Indicator Cards Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-white text-base">The 6 Deterministic Indicators</h3>
                    <p className="text-xs text-slate-400">
                      Click any indicator to view its exact calculation formula, contributing evidence, and gaps.
                    </p>
                  </div>
                  <button
                    onClick={() => setCurrentTab('indicators')}
                    className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    <span>View All Metrics</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(Object.keys(assessment.indicators) as IndicatorKey[]).map((key) => (
                    <IndicatorCard
                      key={key}
                      indicator={assessment.indicators[key]}
                      onInspect={(ind) => setInspectingIndicator(ind)}
                    />
                  ))}
                </div>
              </div>

              {/* Quick Jump Callout Banners */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                {/* Evidence Center Teaser */}
                <div
                  onClick={() => setCurrentTab('evidence')}
                  className="bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 rounded-2xl p-5 cursor-pointer transition group"
                >
                  <div className="flex items-center gap-2.5 text-xs font-bold text-teal-400 uppercase tracking-wider mb-2">
                    <FileCheck2 className="w-4 h-4" />
                    <span>Evidence Center</span>
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-teal-300 transition mb-1">
                    {activeRecordsCount} Verified Sources Loaded
                  </h4>
                  <p className="text-xs text-slate-400">
                    Add new bookkeeping records or mobile money statements to boost your Evidence Confidence.
                  </p>
                </div>

                {/* What-If Simulator Teaser */}
                <div
                  onClick={() => setCurrentTab('simulator')}
                  className="bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 rounded-2xl p-5 cursor-pointer transition group"
                >
                  <div className="flex items-center gap-2.5 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
                    <SlidersHorizontal className="w-4 h-4" />
                    <span>What-If Simulator</span>
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition mb-1">
                    Test +3 Months Bookkeeping
                  </h4>
                  <p className="text-xs text-slate-400">
                    See how adding missing sales logs deterministically lifts your score from 742 to 790 (+48 pts).
                  </p>
                </div>

                {/* Action Plan Teaser */}
                <div
                  onClick={() => setCurrentTab('actions')}
                  className="bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 rounded-2xl p-5 cursor-pointer transition group"
                >
                  <div className="flex items-center gap-2.5 text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                    <ListTodo className="w-4 h-4" />
                    <span>Improvement Plan</span>
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition mb-1">
                    {openTasksCount} Prioritized Actions
                  </h4>
                  <p className="text-xs text-slate-400">
                    Follow ranked tasks to smoothly bridge remaining gaps and unlock institutional capital.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 2. EVIDENCE CENTER */}
          {currentTab === 'evidence' && (
            <EvidenceManager
              records={records}
              onToggleRecord={handleToggleRecord}
              onAddRecord={handleAddRecord}
            />
          )}

          {/* 3. READINESS METRICS & INDICATORS */}
          {currentTab === 'indicators' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Readiness Metrics Breakdown</h2>
                <p className="text-xs text-slate-400 mt-1">
                  All 6 normalized indicators weighted on a 0–1000 scale. Click any card to inspect the trace.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(Object.keys(assessment.indicators) as IndicatorKey[]).map((key) => (
                  <IndicatorCard
                    key={key}
                    indicator={assessment.indicators[key]}
                    onInspect={(ind) => setInspectingIndicator(ind)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 4. WHAT-IF SIMULATOR */}
          {currentTab === 'simulator' && (
            <WhatIfSimulator profileId={profile.id} records={records} />
          )}

          {/* 5. AI CREDIT COACH */}
          {currentTab === 'coach' && (
            <CreditCoach
              profile={profile}
              assessment={assessment}
              onNavigateToSimulator={() => setCurrentTab('simulator')}
              onNavigateToPassport={() => setCurrentTab('passport')}
              onNavigateToActions={() => setCurrentTab('actions')}
            />
          )}

          {/* 6. IMPROVEMENT ACTION PLAN */}
          {currentTab === 'actions' && (
            <ImprovementPlan
              actions={actions}
              onToggleStatus={handleToggleActionStatus}
              onNavigateToSimulator={() => setCurrentTab('simulator')}
            />
          )}

          {/* 7. FINANCIAL PASSPORT */}
          {currentTab === 'passport' && (
            <FinancialPassportView
              passport={{
                ...SEEDED_FINANCIAL_PASSPORT,
                score: assessment.overallScore,
                readinessBand: assessment.readinessBand,
                eci: assessment.eci.overall,
              }}
              onOpenLenderView={() => setCurrentTab('lender')}
            />
          )}

          {/* 8. LENDER VIEW (P1) */}
          {currentTab === 'lender' && (
            <LenderView
              passport={{
                ...SEEDED_FINANCIAL_PASSPORT,
                score: assessment.overallScore,
                readinessBand: assessment.readinessBand,
                eci: assessment.eci.overall,
              }}
              onBackToApp={() => setCurrentTab('dashboard')}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav currentTab={currentTab} onSelectTab={setCurrentTab} />

      {/* Explainability Drill-Down Modal */}
      <ExplainabilityModal
        indicator={inspectingIndicator}
        onClose={() => setInspectingIndicator(null)}
        onRunScenario={() => setCurrentTab('simulator')}
      />
    </div>
  );
}

export default App;
