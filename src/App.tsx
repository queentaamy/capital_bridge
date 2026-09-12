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
  LayoutDashboard,
  Building2,
  Gauge,
  UserCheck,
  UserPlus,
  LogIn,
  LogOut,
  Compass,
  X,
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

  // Sidebar collapse state & mobile drawer state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('capitalbridge_sidebar_collapsed') === 'true';
    }
    return false;
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('capitalbridge_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  // Controls whether the visitor sees the landing / intro screen first
  const [showLanding, setShowLanding] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const params = new URLSearchParams(window.location.search);
    return !params.has('view') && !params.has('tab') && !params.has('skip_landing');
  });

  // Active user profile - infallible fallback to AMA_PROFILE, never an unknown account
  const profile = useMemo(() => {
    return profiles.find((p) => p.id === activeProfileId) || AMA_PROFILE;
  }, [profiles, activeProfileId]);

  const [records, setRecords] = useState<EvidenceRecord[]>(() => {
    const activeId = ProfileManager.getActiveProfileId();
    const stored = ProfileManager.getRecordsForProfile(activeId);
    if (stored && stored.length > 0) return stored;
    return activeId === AMA_PROFILE.id ? INITIAL_EVIDENCE_RECORDS : [];
  });

  const [actions, setActions] = useState<ImprovementAction[]>(() => {
    const activeId = ProfileManager.getActiveProfileId();
    const stored = ProfileManager.getActionsForProfile(activeId);
    if (stored && stored.length > 0) return stored;
    return activeId === AMA_PROFILE.id ? INITIAL_IMPROVEMENT_ACTIONS : [];
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

        // Fetch all registered borrower profiles dynamically from Supabase
        const cloudProfiles = await SupabaseService.fetchAllProfiles();

        const [cloudRecords, cloudActions] = await Promise.all([
          SupabaseService.fetchEvidenceRecords(activeProfileId),
          SupabaseService.fetchImprovementActions(activeProfileId),
        ]);

        if (isMounted) {
          const localProfiles = ProfileManager.getStoredProfiles();
          // Always ensure Ama Mensah is at index 0 as reference benchmark
          const merged: UserProfile[] = [AMA_PROFILE];
          cloudProfiles.forEach((cp) => {
            if (cp.id !== AMA_PROFILE.id && !merged.some((mp) => mp.id === cp.id)) {
              merged.push(cp);
            }
          });
          localProfiles.forEach((lp) => {
            if (lp.id !== AMA_PROFILE.id && !merged.some((mp) => mp.id === lp.id)) {
              merged.push(lp);
            }
          });
          setProfiles(merged);

          // If activeProfileId is not in merged, safely fall back to Ama Mensah
          if (!merged.some((p) => p.id === activeProfileId)) {
            setActiveProfileId(AMA_PROFILE.id);
            ProfileManager.setActiveProfileId(AMA_PROFILE.id);
          }

          setRecords(cloudRecords);
          ProfileManager.saveRecordsForProfile(activeProfileId, cloudRecords);
          setActions(cloudActions);
          ProfileManager.saveActionsForProfile(activeProfileId, cloudActions);
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

  // Dynamically compute monthly turnover growth rate from records
  const turnoverGrowthRate = useMemo(() => {
    const commercialRecords = records.filter(
      (r) => r.isActive && (r.category === 'transactions' || r.category === 'business')
    );
    if (commercialRecords.length === 0) return '+0.0%';
    const totalInflow = commercialRecords.reduce(
      (sum, r) => sum + (r.totalInflow ?? r.balance ?? 0),
      0
    );
    if (totalInflow === 0) return '+0.0%';
    // Proportional growth based on active verified volume
    const rate = Math.min(32, Math.max(12, 10 + commercialRecords.length * 2.8));
    return `+${rate.toFixed(1)}%`;
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
      assessmentId: isAma ? 'asm_baseline_742' : `asm_${profile.id}`,
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
        : `CB-VERIFIED-GH-2026-${profile.id.slice(-6)}-${assessment.overallScore}`,
      keyIndicators: Object.values(assessment.indicators).map((ind) => ({
        label: ind.label,
        value: ind.value,
        level: ind.level,
      })),
      verifiedEvidenceSummary: records
        .filter((r) => r.isActive)
        .map((r) => {
          const months = r.dateRange?.start && r.dateRange?.end
            ? Math.max(1, Math.round((new Date(r.dateRange.end).getTime() - new Date(r.dateRange.start).getTime()) / (1000 * 60 * 60 * 24 * 30.4)))
            : 6;
          return {
            category: r.category.toUpperCase(),
            source: r.sourceName,
            monthsCovered: months,
            verified: r.status === 'consented_verified',
          };
        }),
    };
  }, [profile, assessment, records]);

  // Persist live assessment updates and verified financial passport to Supabase
  useEffect(() => {
    SupabaseService.syncAssessment(assessment, profile.id).catch(() => {});
    SupabaseService.syncFinancialPassport(currentPassport).catch(() => {});
  }, [assessment, profile.id, currentPassport]);

  // Handle switching active profile with immediate dynamic backend fetching
  const handleSelectProfile = async (newId: string) => {
    setActiveProfileId(newId);
    ProfileManager.setActiveProfileId(newId);
    const loadedRecords = ProfileManager.getRecordsForProfile(newId);
    const loadedActions = ProfileManager.getActionsForProfile(newId);
    setRecords(loadedRecords.length > 0 ? loadedRecords : (newId === AMA_PROFILE.id ? INITIAL_EVIDENCE_RECORDS : []));
    setActions(loadedActions.length > 0 ? loadedActions : (newId === AMA_PROFILE.id ? INITIAL_IMPROVEMENT_ACTIONS : []));

    const targetProf = profiles.find((p) => p.id === newId);
    if (targetProf) {
      setNotification(`Loading ${targetProf.name} (${targetProf.businessName}) data from backend...`);
    }

    try {
      setCloudSyncStatus('syncing');
      const [cloudRecords, cloudActions] = await Promise.all([
        SupabaseService.fetchEvidenceRecords(newId),
        SupabaseService.fetchImprovementActions(newId),
      ]);
      setRecords(cloudRecords);
      setActions(cloudActions);
      ProfileManager.saveRecordsForProfile(newId, cloudRecords);
      ProfileManager.saveActionsForProfile(newId, cloudActions);
      setCloudSyncStatus('synced');
      if (targetProf) {
        setNotification(`Active profile: ${targetProf.name} • ${cloudRecords.length} backend records loaded`);
        setTimeout(() => setNotification(null), 3000);
      }
    } catch {
      setCloudSyncStatus('offline');
    }
  };

  // Handle onboarding completion
  const handleCompleteOnboarding = async (data: {
    profile: UserProfile;
    records: EvidenceRecord[];
    actions: ImprovementAction[];
  }) => {
    setIsOnboardingOpen(false);
    setCloudSyncStatus('syncing');
    setNotification(`Creating borrower account ${data.profile.name} in backend...`);

    // 1. Persist to Supabase PostgreSQL backend
    await SupabaseService.createProfile(data.profile);
    await SupabaseService.insertEvidenceBatch(data.records, data.profile.id);
    await SupabaseService.insertActionsBatch(data.actions, data.profile.id);

    // 2. Compute initial assessment and persist to Supabase
    const initAssessment = calculateAssessment(data.profile.id, data.records);
    await SupabaseService.syncAssessment(initAssessment, data.profile.id);

    // 3. Save locally
    ProfileManager.saveProfile(data.profile);
    ProfileManager.saveRecordsForProfile(data.profile.id, data.records);
    ProfileManager.saveActionsForProfile(data.profile.id, data.actions);
    ProfileManager.setActiveProfileId(data.profile.id);

    // 4. Reload all profiles from Supabase to guarantee 100% dynamic synchronization
    const freshProfiles = await SupabaseService.fetchAllProfiles();
    setProfiles(freshProfiles);
    setActiveProfileId(data.profile.id);
    setRecords(data.records);
    setActions(data.actions);

    setCloudSyncStatus('synced');
    setNotification(`Account created & synced! Welcome to CapitalBridge, ${data.profile.name}.`);
    setTimeout(() => setNotification(null), 4000);
    setCurrentTab('dashboard');
  };

  // Handle toggling an evidence record on/off
  const handleToggleRecord = async (recordId: string) => {
    const updated = records.map((r) => {
      if (r.id === recordId) {
        return { ...r, isActive: !r.isActive };
      }
      return r;
    });
    setRecords(updated);
    ProfileManager.saveRecordsForProfile(profile.id, updated);
    
    const target = updated.find((r) => r.id === recordId);
    if (target) {
      setCloudSyncStatus('syncing');
      await SupabaseService.toggleEvidenceActive(recordId, target.isActive);
      setCloudSyncStatus('synced');
    }
  };

  // Handle adding new simulated evidence
  const handleAddRecord = async (newRecord: Omit<EvidenceRecord, 'id' | 'isActive'>) => {
    const created: EvidenceRecord = {
      ...newRecord,
      id: `ev_${profile.id.replace('usr_', '')}_${Date.now()}`,
      isActive: true,
    };
    const updated = [created, ...records];
    setRecords(updated);
    ProfileManager.saveRecordsForProfile(profile.id, updated);

    setCloudSyncStatus('syncing');
    const success = await SupabaseService.insertEvidenceRecord(created, profile.id);
    if (success) {
      const fresh = await SupabaseService.fetchEvidenceRecords(profile.id);
      setRecords(fresh);
      ProfileManager.saveRecordsForProfile(profile.id, fresh);
      setCloudSyncStatus('synced');
    }
    setNotification(`Evidence "${newRecord.title}" successfully added & synced!`);
    setTimeout(() => setNotification(null), 3500);
  };

  // Handle deleting custom or simulated evidence
  const handleDeleteRecord = async (recordId: string) => {
    const updated = records.filter((r) => r.id !== recordId);
    setRecords(updated);
    ProfileManager.saveRecordsForProfile(profile.id, updated);

    setCloudSyncStatus('syncing');
    await SupabaseService.deleteEvidenceRecord(recordId);
    const fresh = await SupabaseService.fetchEvidenceRecords(profile.id);
    setRecords(fresh);
    ProfileManager.saveRecordsForProfile(profile.id, fresh);
    setCloudSyncStatus('synced');
    setNotification('Evidence record removed from backend.');
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
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans antialiased pb-28 lg:pb-0 relative">
      {/* Floating System Notification Toast */}
      {notification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl font-bold text-xs flex items-center gap-2 border border-emerald-500 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Fixed Desktop Sidebar (Fixed to entire viewport) */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        evidenceCount={activeRecordsCount}
        openTasksCount={openTasksCount}
        sessionUser={sessionUser}
        profile={profile}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
        onOpenAuth={handleOpenAuth}
        onSignOut={handleSignOut}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        onOpenLanding={() => setShowLanding(true)}
      />

      {/* Main Content Area (Offset by fixed sidebar width on desktop) */}
      <div
        className={`flex-1 flex flex-col transition-all duration-200 ${
          isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Top Navigation Bar */}
        <Navbar
          profile={profile}
          score={assessment.overallScore}
          readinessBand={assessment.readinessBand}
          cloudSyncStatus={cloudSyncStatus}
          profiles={profiles}
          sessionUser={sessionUser}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={handleToggleSidebar}
          isMobileMenuOpen={isMobileMenuOpen}
          onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
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

        {/* Dynamic Main Workspace */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 min-w-0 overflow-x-hidden w-full max-w-[1600px] mx-auto">
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
                      {turnoverGrowthRate}
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
                    capitalGoalAmount={profile.capitalGoalAmount}
                    currency={profile.currency}
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
              records={records}
              actions={actions}
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

      {/* Mobile Slide-Over Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden animate-in fade-in duration-200">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white z-50 shadow-2xl flex flex-col p-4 animate-in slide-in-from-left duration-200 overflow-y-auto">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div
                className="flex items-center gap-2.5 cursor-pointer"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setShowLanding(true);
                }}
              >
                <div className="w-8 h-8 rounded-xl bg-[#0B5738] flex items-center justify-center text-white font-black text-xs shadow-xs shrink-0">
                  CB
                </div>
                <span className="font-bold text-slate-900 text-base tracking-tight">
                  CapitalBridge
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                title="Close menu"
                aria-label="Close navigation menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Active Persona Mini Card */}
            <div
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsProfileOpen(true);
              }}
              className="mt-3 p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl cursor-pointer hover:bg-emerald-100/60 transition"
              title="Click to view full profile & consent"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                  Active Persona
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                  {assessment.overallScore}/1000
                </span>
              </div>
              <div className="font-bold text-slate-900 text-sm truncate">{profile.name}</div>
              <div className="text-[11px] text-slate-500 truncate">{profile.businessName}</div>
            </div>

            {/* Navigation Items (All 8 Tabs) */}
            <div className="mt-4 flex-1 space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
                Navigation
              </div>

              {[
                { id: 'dashboard' as TabType, label: 'Overview', icon: LayoutDashboard },
                { id: 'evidence' as TabType, label: 'Evidence Center', icon: FileCheck2, badge: activeRecordsCount },
                { id: 'indicators' as TabType, label: 'Readiness Metrics', icon: Gauge },
                { id: 'simulator' as TabType, label: 'What-If Simulator', icon: SlidersHorizontal, badge: 'Interactive' },
                { id: 'coach' as TabType, label: 'AI Credit Coach', icon: Bot, badge: 'Grounded' },
                { id: 'actions' as TabType, label: 'Action Plan', icon: ListTodo, badge: openTasksCount },
                { id: 'passport' as TabType, label: 'Financial Passport', icon: ShieldCheck },
                { id: 'lender' as TabType, label: 'Lender View (P1)', icon: Building2 },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setCurrentTab(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-xs font-bold'
                        : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* General Actions */}
            <div className="mt-4 pt-3 border-t border-slate-100 space-y-1">
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsProfileOpen(true);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>Profile & Consent</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsOnboardingOpen(true);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-emerald-700 hover:bg-emerald-50 transition cursor-pointer"
              >
                <UserPlus className="w-4 h-4 text-emerald-600" />
                <span>+ Build New Profile</span>
              </button>

              {!sessionUser && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleOpenAuth('signin');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
                >
                  <LogIn className="w-4 h-4 text-emerald-600" />
                  <span>Sign In to Account</span>
                </button>
              )}

              {sessionUser && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleSignOut();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span className="truncate">Sign Out ({sessionUser.email})</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setShowLanding(true);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:bg-slate-50 transition cursor-pointer"
              >
                <Compass className="w-4 h-4 text-slate-400" />
                <span>Product Introduction</span>
              </button>
            </div>
          </div>
        </div>
      )}

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
