import { useState, useMemo, useEffect } from 'react';
import { Navbar, type CloudSyncStatus } from './components/layout/Navbar';
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
import { ProfileDrawer } from './components/ui/ProfileDrawer';
import { TurnoverChart } from './components/dashboard/TurnoverChart';
import { SearchPalette } from './components/layout/SearchPalette';
import { OnboardingWizard } from './components/onboarding/OnboardingWizard';
import { AuthModal } from './components/auth/AuthModal';
import { LandingHero } from './components/landing/LandingHero';
import { SupabaseService } from './services/supabaseService';
import { ProfileManager } from './services/profileManager';

import {
  AMA_PROFILE,
  INITIAL_EVIDENCE_RECORDS,
  INITIAL_IMPROVEMENT_ACTIONS,
  SEEDED_FINANCIAL_PASSPORT,
} from './data/seedData';
import { calculateAssessment } from './services/assessmentEngine';
import { runWhatIfScenario, type ScenarioAdjustmentParams } from './services/scenarioEngine';
import type {
  EvidenceRecord,
  ImprovementAction,
  IndicatorResult,
  IndicatorKey,
  UserProfile,
  FinancialPassport,
} from './types';

import {
  Sparkles,
  ArrowRight,
  SlidersHorizontal,
  Bot,
  ListTodo,
  FileCheck2,
  CheckCircle2,
  TrendingUp,
  CreditCard,
  ShieldCheck,
  Target,
  ArrowUpRight,
  Filter,
} from 'lucide-react';

export function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [profiles, setProfiles] = useState<UserProfile[]>(() => ProfileManager.getStoredProfiles());
  const [activeProfileId, setActiveProfileId] = useState<string>(() => ProfileManager.getActiveProfileId());
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [sessionUser, setSessionUser] = useState<{ id: string; email: string } | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [observationWindow, setObservationWindow] = useState('6-Month Audit');
  const [tableCategoryFilter, setTableCategoryFilter] = useState<string>('all');

  // Controls whether the visitor sees the landing / intro screen first
  const [showLanding, setShowLanding] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const params = new URLSearchParams(window.location.search);
    return !params.has('view') && !params.has('tab') && !params.has('skip_landing');
  });

  // Active user profile
  const profile = useMemo(() => {
    return profiles.find((p) => p.id === activeProfileId) || profiles[0] || AMA_PROFILE;
  }, [profiles, activeProfileId]);

  const [records, setRecords] = useState<EvidenceRecord[]>(() => {
    const activeId = ProfileManager.getActiveProfileId();
    const stored = ProfileManager.getRecordsForProfile(activeId);
    return stored && stored.length > 0 ? stored : INITIAL_EVIDENCE_RECORDS;
  });

  const [actions, setActions] = useState<ImprovementAction[]>(() => {
    const activeId = ProfileManager.getActiveProfileId();
    const stored = ProfileManager.getActionsForProfile(activeId);
    return stored && stored.length > 0 ? stored : INITIAL_IMPROVEMENT_ACTIONS;
  });

  const [inspectingIndicator, setInspectingIndicator] = useState<IndicatorResult | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<CloudSyncStatus>('synced');

  // Hydrate initial state from Supabase on mount with offline fallback
  useEffect(() => {
    let isMounted = true;
    const hydrateCloudData = async () => {
      try {
        setCloudSyncStatus('syncing');
        const health = await SupabaseService.checkConnection();
        if (!health.ok) {
          if (isMounted) setCloudSyncStatus('offline');
          return;
        }

        const [cloudProfiles, cloudRecords, cloudActions] = await Promise.all([
          SupabaseService.fetchAllProfiles(),
          SupabaseService.fetchEvidenceRecords(activeProfileId),
          SupabaseService.fetchImprovementActions(activeProfileId),
        ]);

        if (isMounted) {
          if (cloudProfiles && cloudProfiles.length > 0) {
            const localProfiles = ProfileManager.getStoredProfiles();
            const merged = [...cloudProfiles];
            localProfiles.forEach((lp) => {
              if (!merged.some((mp) => mp.id === lp.id)) {
                merged.push(lp);
              }
            });
            setProfiles(merged);
          }
          if (cloudRecords && cloudRecords.length > 0) {
            setRecords(cloudRecords);
            ProfileManager.saveRecordsForProfile(activeProfileId, cloudRecords);
          }
          if (cloudActions && cloudActions.length > 0) {
            setActions(cloudActions);
            ProfileManager.saveActionsForProfile(activeProfileId, cloudActions);
          }
          setCloudSyncStatus('synced');
        }
      } catch {
        if (isMounted) setCloudSyncStatus('offline');
      }
    };

    hydrateCloudData();
    return () => {
      isMounted = false;
    };
  }, [activeProfileId]);

  // Deterministically compute live assessment from active records
  const assessment = useMemo(() => {
    return calculateAssessment(profile.id, records);
  }, [profile.id, records]);

  // Persist live assessment updates to Supabase
  useEffect(() => {
    SupabaseService.syncAssessment(assessment, profile.id).catch(() => {});
  }, [assessment, profile.id]);

  // Check active Supabase Auth session on mount and subscribe to changes
  useEffect(() => {
    let isMounted = true;
    SupabaseService.getSession().then((session) => {
      if (isMounted && session?.user?.email) {
        setSessionUser({
          id: session.user.id,
          email: session.user.email,
        });
      }
    });

    const { data: authListener } = SupabaseService.onAuthStateChange(
      async (_event, session) => {
        if (!isMounted) return;
        if (session?.user?.email) {
          setSessionUser({
            id: session.user.id,
            email: session.user.email,
          });
        } else {
          setSessionUser(null);
        }
      }
    );

    return () => {
      isMounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Handle opening authentication modal
  const handleOpenAuth = (mode: 'signin' | 'signup' = 'signin') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  // Handle user sign out
  const handleSignOut = async () => {
    await SupabaseService.signOut();
    setSessionUser(null);
    handleSelectProfile(AMA_PROFILE.id);
    setNotification('Signed out. Reset active view to Ama Mensah demo profile.');
    setTimeout(() => setNotification(null), 3500);
  };

  // Handle successful login or account registration
  const handleAuthSuccess = (
    user: { id: string; email: string },
    linkedProfile?: UserProfile
  ) => {
    setSessionUser(user);
    if (linkedProfile) {
      setProfiles((prev) => [
        linkedProfile,
        ...prev.filter((p) => p.id !== linkedProfile.id),
      ]);
      handleSelectProfile(linkedProfile.id);
      setNotification(`Welcome back, ${linkedProfile.name}!`);
    } else {
      setNotification(`Signed in as ${user.email}. Complete your business details below.`);
      setIsOnboardingOpen(true);
    }
    setTimeout(() => setNotification(null), 4000);
  };

  // Global keyboard shortcut to open Search & Action Palette (⌘K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Dynamically compute monthly commercial turnover from verified records
  const monthlyTurnover = useMemo(() => {
    const bizRecord = records.find((r) => r.isActive && r.category === 'business');
    if (bizRecord && bizRecord.totalInflow) {
      return Math.round(bizRecord.totalInflow / 3);
    }
    const commercialRecords = records.filter(
      (r) => r.isActive && (r.category === 'transactions' || r.category === 'business')
    );
    if (commercialRecords.length === 0) return 0;
    const totalInflow = commercialRecords.reduce(
      (sum, r) => sum + (r.totalInflow ?? r.balance ?? 0),
      0
    );
    return Math.round(totalInflow / 6);
  }, [records]);

  // Dynamically compute simulator preview lift for dashboard teaser
  const simLift = useMemo(() => {
    return runWhatIfScenario(profile.id, records, {
      addBusinessRecordsMonths: 3,
      reduceMonthlyDebtAmount: 0,
      smoothExpenseVolatility: false,
      maintainSavingsWeeks: 0,
    });
  }, [profile.id, records]);

  // Construct dynamic financial passport reflecting active profile & live assessment
  const currentPassport: FinancialPassport = useMemo(() => {
    const isAma = profile.id === AMA_PROFILE.id;
    return {
      ...SEEDED_FINANCIAL_PASSPORT,
      id: isAma ? SEEDED_FINANCIAL_PASSPORT.id : `pass_${profile.id}`,
      profileId: profile.id,
      shareToken: isAma
        ? SEEDED_FINANCIAL_PASSPORT.shareToken
        : `cb-${profile.id.replace('usr_', '')}-${assessment.overallScore}`,
      userName: profile.name,
      businessName: profile.businessName,
      businessType: profile.businessType,
      businessLocation: profile.businessLocation,
      capitalGoal: {
        amount: profile.capitalGoalAmount,
        currency: profile.currency,
        purpose: profile.capitalGoalPurpose,
      },
      score: assessment.overallScore,
      readinessBand: assessment.readinessBand,
      eci: assessment.eci.overall,
      eciLevel: assessment.eci.level,
      verificationHash: isAma
        ? SEEDED_FINANCIAL_PASSPORT.verificationHash
        : `sha256-gh2026-${profile.id.slice(-6)}-${assessment.overallScore}`,
      keyIndicators: Object.values(assessment.indicators).map((ind) => ({
        label: ind.label,
        value: ind.value,
        level: ind.level,
      })),
      verifiedEvidenceSummary: records
        .filter((r) => r.isActive)
        .map((r) => ({
          category: r.category.toUpperCase(),
          source: r.sourceName,
          monthsCovered: 6,
          verified: r.status === 'consented_verified',
        })),
    };
  }, [profile, assessment, records]);

  // Handle switching active profile
  const handleSelectProfile = (newId: string) => {
    setActiveProfileId(newId);
    ProfileManager.setActiveProfileId(newId);
    const loadedRecords = ProfileManager.getRecordsForProfile(newId);
    const loadedActions = ProfileManager.getActionsForProfile(newId);
    setRecords(loadedRecords.length > 0 ? loadedRecords : (newId === AMA_PROFILE.id ? INITIAL_EVIDENCE_RECORDS : []));
    setActions(loadedActions.length > 0 ? loadedActions : (newId === AMA_PROFILE.id ? INITIAL_IMPROVEMENT_ACTIONS : []));

    const targetProf = profiles.find((p) => p.id === newId);
    if (targetProf) {
      setNotification(`Switched active profile to ${targetProf.name} (${targetProf.businessName})`);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // Handle onboarding completion
  const handleCompleteOnboarding = (data: {
    profile: UserProfile;
    records: EvidenceRecord[];
    actions: ImprovementAction[];
  }) => {
    ProfileManager.saveProfile(data.profile);
    ProfileManager.saveRecordsForProfile(data.profile.id, data.records);
    ProfileManager.saveActionsForProfile(data.profile.id, data.actions);
    ProfileManager.setActiveProfileId(data.profile.id);

    setProfiles((prev) => [data.profile, ...prev.filter((p) => p.id !== data.profile.id)]);
    setActiveProfileId(data.profile.id);
    setRecords(data.records);
    setActions(data.actions);
    setIsOnboardingOpen(false);

    // Sync to Supabase in background
    SupabaseService.createProfile(data.profile).catch(() => {});
    SupabaseService.insertEvidenceBatch(data.records, data.profile.id).catch(() => {});
    SupabaseService.insertActionsBatch(data.actions, data.profile.id).catch(() => {});

    setNotification(`Account created! Welcome to CapitalBridge, ${data.profile.name}.`);
    setTimeout(() => setNotification(null), 4000);
    setCurrentTab('dashboard');
  };

  // Handle toggling an evidence record on/off
  const handleToggleRecord = (recordId: string) => {
    setRecords((prev) => {
      const updated = prev.map((r) => {
        if (r.id === recordId) {
          const nextActive = !r.isActive;
          SupabaseService.toggleEvidenceActive(recordId, nextActive).catch(() => {});
          return { ...r, isActive: nextActive };
        }
        return r;
      });
      ProfileManager.saveRecordsForProfile(profile.id, updated);
      return updated;
    });
  };

  // Handle adding new simulated evidence
  const handleAddRecord = (newRecord: Omit<EvidenceRecord, 'id' | 'isActive'>) => {
    const created: EvidenceRecord = {
      ...newRecord,
      id: `ev_${Date.now()}`,
      isActive: true,
    };
    setRecords((prev) => {
      const updated = [created, ...prev];
      ProfileManager.saveRecordsForProfile(profile.id, updated);
      return updated;
    });
    SupabaseService.insertEvidenceRecord(created, profile.id).catch(() => {});
    setNotification(`Evidence "${newRecord.title}" successfully added!`);
    setTimeout(() => setNotification(null), 3500);
  };

  // Handle deleting custom or simulated evidence
  const handleDeleteRecord = (recordId: string) => {
    setRecords((prev) => {
      const updated = prev.filter((r) => r.id !== recordId);
      ProfileManager.saveRecordsForProfile(profile.id, updated);
      return updated;
    });
    SupabaseService.deleteEvidenceRecord(recordId).catch(() => {});
    setNotification('Evidence record removed.');
    setTimeout(() => setNotification(null), 3000);
  };

  // Handle applying a simulated scenario directly to active state
  const handleApplyScenario = (params: ScenarioAdjustmentParams) => {
    let nextRecords = [...records];
    let nextActions = [...actions];

    if (params.addBusinessRecordsMonths > 0) {
      const exists = nextRecords.some((r) => r.id === 'ev_sim_books_01');
      if (!exists) {
        const simulatedBook: EvidenceRecord = {
          id: 'ev_sim_books_01',
          category: 'business',
          sourceName: 'Market Advisory & Reconstructed Ledger',
          title: 'Verified Sales Books (March - May 2026)',
          dateRange: { start: '2026-03-01', end: '2026-05-31' },
          totalInflow: 26500,
          totalOutflow: 0,
          balance: 26500,
          status: 'consented_verified',
          recordCount: 92,
          traceabilityHash: 'sha256-reconstructed-books-m3',
          notes: 'Reconstructed 3 months of daily trading ledgers to close documentation gap.',
          isActive: true,
        };
        nextRecords = [simulatedBook, ...nextRecords];
      }
      nextActions = nextActions.map((a) => (a.id === 'act_01' ? { ...a, status: 'completed' } : a));
    }

    if (params.reduceMonthlyDebtAmount >= 500) {
      nextRecords = nextRecords.map((r) =>
        r.category === 'obligations' ? { ...r, isActive: false } : r
      );
      nextActions = nextActions.map((a) => (a.id === 'act_03' ? { ...a, status: 'completed' } : a));
    }

    setRecords(nextRecords);
    setActions(nextActions);
    ProfileManager.saveRecordsForProfile(profile.id, nextRecords);
    ProfileManager.saveActionsForProfile(profile.id, nextActions);

    setNotification(
      'Simulated improvements applied to active profile! Your Readiness Score has updated.'
    );
    setTimeout(() => setNotification(null), 4000);
    setCurrentTab('dashboard');
  };

  // Handle action plan status toggle
  const handleToggleActionStatus = (actionId: string) => {
    setActions((prev) => {
      const updated = prev.map((a): ImprovementAction => {
        if (a.id !== actionId) return a;
        const nextStatus: ImprovementAction['status'] =
          a.status === 'not_started'
            ? 'in_progress'
            : a.status === 'in_progress'
            ? 'completed'
            : 'not_started';
        SupabaseService.updateActionStatus(actionId, nextStatus).catch(() => {});
        return { ...a, status: nextStatus };
      });
      ProfileManager.saveActionsForProfile(profile.id, updated);
      return updated;
    });
  };

  // Reset to Ama Mensah baseline
  const handleResetDemo = () => {
    handleSelectProfile(AMA_PROFILE.id);
    setRecords(INITIAL_EVIDENCE_RECORDS);
    setActions(INITIAL_IMPROVEMENT_ACTIONS);
    ProfileManager.saveRecordsForProfile(AMA_PROFILE.id, INITIAL_EVIDENCE_RECORDS);
    ProfileManager.saveActionsForProfile(AMA_PROFILE.id, INITIAL_IMPROVEMENT_ACTIONS);
    setCurrentTab('dashboard');
    setNotification('Demo reset to initial Ama Mensah baseline (Score: 742, ECI: 86%).');
    setTimeout(() => setNotification(null), 3500);
  };

  const openTasksCount = actions.filter((a) => a.status !== 'completed').length;
  const activeRecordsCount = records.filter((r) => r.isActive).length;

  // 0. LANDING HERO (INITIAL ENTRY VIEW)
  if (showLanding) {
    return (
      <div className="min-h-screen bg-[#FBFBFA]">
        {/* Floating System Notification Toast */}
        {notification && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl font-bold text-xs flex items-center gap-2 border border-emerald-500 animate-in fade-in slide-in-from-top-4 duration-300">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{notification}</span>
          </div>
        )}

        <LandingHero
          onStartDemo={() => {
            handleSelectProfile(AMA_PROFILE.id);
            setShowLanding(false);
            setCurrentTab('dashboard');
          }}
          onBuildProfile={() => {
            setIsOnboardingOpen(true);
          }}
          onSignIn={() => {
            handleOpenAuth('signin');
          }}
          profiles={profiles}
        />

        {/* Onboarding Wizard Modal */}
        <OnboardingWizard
          isOpen={isOnboardingOpen}
          onClose={() => setIsOnboardingOpen(false)}
          onComplete={(data) => {
            handleCompleteOnboarding(data);
            setShowLanding(false);
          }}
          onSelectAmaBenchmark={() => {
            setIsOnboardingOpen(false);
            handleSelectProfile(AMA_PROFILE.id);
            setShowLanding(false);
          }}
        />

        {/* Supabase Authentication Modal */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          initialMode={authModalMode}
          onSuccess={(user, linkedProfile) => {
            handleAuthSuccess(user, linkedProfile);
            setShowLanding(false);
          }}
          onQuickDemoLogin={() => {
            handleSelectProfile(AMA_PROFILE.id);
            setShowLanding(false);
            setNotification('Switched to Ama Mensah demo profile.');
            setTimeout(() => setNotification(null), 3000);
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans antialiased pb-16 lg:pb-0 relative">
      {/* Floating System Notification Toast */}
      {notification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl font-bold text-xs flex items-center gap-2 border border-emerald-500 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Navigation Bar */}
      <Navbar
        profile={profile}
        score={assessment.overallScore}
        readinessBand={assessment.readinessBand}
        cloudSyncStatus={cloudSyncStatus}
        profiles={profiles}
        sessionUser={sessionUser}
        onOpenAuth={handleOpenAuth}
        onSignOut={handleSignOut}
        onSelectProfile={handleSelectProfile}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        onResetDemo={handleResetDemo}
        onOpenPassport={() => setCurrentTab('passport')}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenLanding={() => setShowLanding(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        observationWindow={observationWindow}
        onSelectObservationWindow={setObservationWindow}
      />

      <div className="flex-1 flex w-full max-w-[1600px] mx-auto">
        {/* Desktop Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          evidenceCount={activeRecordsCount}
          openTasksCount={openTasksCount}
          sessionUser={sessionUser}
          onOpenAuth={handleOpenAuth}
          onSignOut={handleSignOut}
          onOpenProfile={() => setIsProfileOpen(true)}
          onOpenOnboarding={() => setIsOnboardingOpen(true)}
          onOpenLanding={() => setShowLanding(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 min-w-0 overflow-x-hidden overflow-y-auto">
          {/* 1. DASHBOARD / OVERVIEW */}
          {currentTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Persona Welcome Header (Matching Oripio & Modulix) */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>Evidence-Based Financial Readiness Profile</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    Welcome back, {profile.name} 👋
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl font-medium">
                    Monitor and control what happens with your capital readiness today for financial health.
                  </p>
                </div>

                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setCurrentTab('simulator')}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 px-3.5 sm:px-4 py-2.5 rounded-2xl transition shadow-xs"
                  >
                    <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
                    <span>Run What-If Test</span>
                  </button>

                  <button
                    onClick={() => setCurrentTab('coach')}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 sm:px-4 py-2.5 rounded-2xl transition shadow-sm"
                  >
                    <Bot className="w-4 h-4" />
                    <span>Ask AI Coach</span>
                  </button>
                </div>
              </div>

              {/* Top 4 Stat Cards (Styled directly from Oripio & Quixotic & Modulix) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {/* Stat 1: Monthly Inflow / Turnover */}
                <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-md transition">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span className="font-bold uppercase tracking-wider text-[11px]">Monthly Turnover</span>
                    <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                      <TrendingUp className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums tracking-tight">
                    {profile.currency} {monthlyTurnover.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 text-xs">
                    <span className="inline-flex items-center gap-0.5 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md text-[11px]">
                      <ArrowUpRight className="w-3 h-3" />
                      +18.4%
                    </span>
                    <span className="text-slate-400">vs 6-mo baseline</span>
                  </div>
                </div>

                {/* Stat 2: Readiness Score */}
                <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-md transition">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span className="font-bold uppercase tracking-wider text-[11px]">Readiness Score</span>
                    <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                      <ShieldCheck className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums tracking-tight">
                    {assessment.overallScore}
                    <span className="text-sm font-normal text-slate-400">/1000</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 text-xs">
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md text-[11px]">
                      {assessment.readinessBand}
                    </span>
                    <span className="text-slate-400">
                      {assessment.overallScore >= 700 ? 'Tier 2 Ready' : 'Under Review'}
                    </span>
                  </div>
                </div>

                {/* Stat 3: Capital Target */}
                <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-md transition">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span className="font-bold uppercase tracking-wider text-[11px]">Target Capital Goal</span>
                    <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                      <Target className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums tracking-tight">
                    {profile.currency} {profile.capitalGoalAmount.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500 truncate font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="truncate">{profile.capitalGoalPurpose}</span>
                  </div>
                </div>

                {/* Stat 4: Evidence Confidence */}
                <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-md transition">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span className="font-bold uppercase tracking-wider text-[11px]">Evidence Confidence (ECI)</span>
                    <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                      <CreditCard className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-700 tabular-nums tracking-tight">
                    {assessment.eci.overall}%
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 text-xs">
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md text-[11px]">
                      High Confidence
                    </span>
                    <span className="text-slate-400">{activeRecordsCount} Verified Sources</span>
                  </div>
                </div>
              </div>

              {/* Chart & Live Gauge Section (Matching Oripio & Quixotic) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <TurnoverChart
                    records={records}
                    currency={profile.currency}
                    profile={profile}
                  />
                </div>
                <div className="lg:col-span-1">
                  <ReadinessGauge
                    score={assessment.overallScore}
                    band={assessment.readinessBand}
                    bandDescription={assessment.bandDescription}
                    methodologyVersion={assessment.methodologyVersion}
                  />
                </div>
              </div>

              {/* ECI Reliability & Quick Action Teasers */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <ECIBadge eci={assessment.eci} />
                </div>

                {/* Quick Action Navigation Cards (Oripio style) */}
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Evidence Center Teaser */}
                  <div
                    onClick={() => setCurrentTab('evidence')}
                    className="bg-white hover:bg-slate-50/80 border border-slate-200/80 rounded-3xl p-5 cursor-pointer transition shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">
                        <FileCheck2 className="w-4 h-4 text-emerald-600" />
                        <span>Evidence Center</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition mb-1">
                        {activeRecordsCount} Verified Sources
                      </h4>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">
                        Add new bookkeeping records or mobile money statements to boost your Evidence Confidence.
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
                      <span>Manage Evidence</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                    </div>
                  </div>

                  {/* What-If Simulator Teaser */}
                  <div
                    onClick={() => setCurrentTab('simulator')}
                    className="bg-white hover:bg-slate-50/80 border border-slate-200/80 rounded-3xl p-5 cursor-pointer transition shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">
                        <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
                        <span>What-If Simulator</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition mb-1">
                        Test +3 Months Books
                      </h4>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">
                        See how adding missing sales logs deterministically lifts your score from {assessment.overallScore} to {simLift.scenarioScore} (+{simLift.scoreDelta} pts).
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
                      <span>Run Scenario</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                    </div>
                  </div>

                  {/* Action Plan Teaser */}
                  <div
                    onClick={() => setCurrentTab('actions')}
                    className="bg-white hover:bg-slate-50/80 border border-slate-200/80 rounded-3xl p-5 cursor-pointer transition shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">
                        <ListTodo className="w-4 h-4 text-amber-600" />
                        <span>Improvement Plan</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-amber-700 transition mb-1">
                        {openTasksCount} Ranked Actions
                      </h4>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">
                        Follow ranked tasks to systematically bridge remaining gaps and reach Prime Ready.
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-700">
                      <span>View Tasks</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Indicator Cards Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">The 6 Deterministic Indicators</h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Click any indicator to view its exact calculation formula, contributing evidence, and gaps.
                    </p>
                  </div>
                  <button
                    onClick={() => setCurrentTab('indicators')}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 transition"
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

              {/* Recent Verified Evidence Table (Styled directly after Oripio & Modulix tables) */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.03)]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base tracking-tight">
                      Recent Verified Financial Evidence
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Consent-granted records contributing to your live {assessment.overallScore} readiness score.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <select
                        value={tableCategoryFilter}
                        onChange={(e) => setTableCategoryFilter(e.target.value)}
                        className="text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 pl-3 pr-8 py-1.5 rounded-xl transition cursor-pointer appearance-none"
                      >
                        <option value="all">All Categories</option>
                        <option value="transactions">Transactions</option>
                        <option value="savings">Savings</option>
                        <option value="business">Business</option>
                        <option value="obligations">Obligations</option>
                        <option value="statutory">Statutory</option>
                      </select>
                      <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    <button
                      onClick={() => setCurrentTab('evidence')}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl transition"
                    >
                      Manage All ({records.length})
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[580px] text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                        <th className="py-3 px-4 rounded-l-xl">Evidence Source</th>
                        <th className="py-3 px-4">Observation Window</th>
                        <th className="py-3 px-4">Total Volume / Balance</th>
                        <th className="py-3 px-4">Audit Provenance</th>
                        <th className="py-3 px-4 text-right rounded-r-xl">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {records
                        .filter((r) => tableCategoryFilter === 'all' || r.category === tableCategoryFilter)
                        .slice(0, 5)
                        .map((rec) => (
                          <tr key={rec.id} className="hover:bg-slate-50/50 transition">
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-slate-900">{rec.title}</div>
                              <div className="text-[11px] text-slate-400 font-medium">{rec.sourceName}</div>
                            </td>
                            <td className="py-3.5 px-4 text-slate-600 font-medium">
                              {rec.dateRange.start} → {rec.dateRange.end}
                            </td>
                            <td className="py-3.5 px-4 font-bold text-slate-900 tabular-nums">
                              {profile.currency} {((rec.totalInflow ?? rec.balance) ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="font-mono text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                                {rec.traceabilityHash?.slice(0, 14)}...
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              {rec.isActive ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full">
                                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                  <span>Verified</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full">
                                  <span>Excluded</span>
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
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
              onDeleteRecord={handleDeleteRecord}
            />
          )}

          {/* 3. READINESS METRICS & INDICATORS */}
          {currentTab === 'indicators' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Readiness Metrics Breakdown</h2>
                <p className="text-xs text-slate-500 mt-1 font-medium">
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
            <WhatIfSimulator
              profileId={profile.id}
              records={records}
              onApplyScenario={handleApplyScenario}
              profile={profile}
            />
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
              passport={currentPassport}
              onOpenLenderView={() => setCurrentTab('lender')}
            />
          )}

          {/* 8. LENDER VIEW (P1) */}
          {currentTab === 'lender' && (
            <LenderView
              passport={currentPassport}
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

      {/* Profile & Consent Drawer */}
      <ProfileDrawer
        profile={profile}
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onResetDemo={handleResetDemo}
        profiles={profiles}
        onSelectProfile={handleSelectProfile}
        onOpenOnboarding={() => {
          setIsProfileOpen(false);
          setIsOnboardingOpen(true);
        }}
        records={records}
        onToggleRecord={handleToggleRecord}
      />

      {/* Onboarding Wizard Modal */}
      <OnboardingWizard
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onComplete={handleCompleteOnboarding}
        onSelectAmaBenchmark={() => {
          setIsOnboardingOpen(false);
          handleSelectProfile(AMA_PROFILE.id);
        }}
      />

      {/* Supabase Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
        onSuccess={handleAuthSuccess}
        onQuickDemoLogin={() => {
          handleSelectProfile(AMA_PROFILE.id);
          setNotification('Switched to Ama Mensah demo profile.');
          setTimeout(() => setNotification(null), 3000);
        }}
      />

      {/* ⌘K / Ctrl+K Search and Action Command Palette */}
      <SearchPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        records={records}
        actions={actions}
        onSelectTab={setCurrentTab}
      />
    </div>
  );
}

export default App;
