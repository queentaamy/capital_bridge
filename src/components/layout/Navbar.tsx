import React, { useState, useRef, useEffect } from 'react';
import {
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Search,
  Calendar,
  Bell,
  Database,
  CloudOff,
  UserPlus,
  ChevronDown,
  Check,
  Building,
  LogIn,
  LogOut,
  RotateCcw,
  X,
} from 'lucide-react';
import type { UserProfile, ReadinessBand } from '../../types';

export type CloudSyncStatus = 'synced' | 'syncing' | 'offline';

export interface NavbarProps {
  profile: UserProfile;
  score: number;
  readinessBand: ReadinessBand;
  cloudSyncStatus?: CloudSyncStatus;
  profiles?: UserProfile[];
  sessionUser?: { id: string; email: string } | null;
  observationWindow?: string;
  onSelectObservationWindow?: (window: string) => void;
  onOpenSearch?: () => void;
  onOpenAuth?: (mode?: 'signin' | 'signup') => void;
  onSignOut?: () => void;
  onSelectProfile?: (profileId: string) => void;
  onOpenOnboarding?: () => void;
  onResetDemo: () => void;
  onOpenPassport: () => void;
  onOpenProfile?: () => void;
  onOpenLanding?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  profile,
  score,
  readinessBand,
  cloudSyncStatus = 'synced',
  profiles = [],
  sessionUser = null,
  observationWindow = '6-Month Audit',
  onSelectObservationWindow,
  onOpenSearch,
  onOpenAuth,
  onSignOut,
  onSelectProfile,
  onOpenOnboarding,
  onResetDemo,
  onOpenPassport,
  onOpenProfile,
  onOpenLanding,
}) => {
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const switcherRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (switcherRef.current && !switcherRef.current.contains(target)) {
        setIsSwitcherOpen(false);
      }
      if (calendarRef.current && !calendarRef.current.contains(target)) {
        setIsCalendarOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(target)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0].toUpperCase())
      .join('');
  };

  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 px-3 sm:px-4 lg:px-6 flex items-center justify-between transition-colors max-w-full overflow-visible">
      {/* Brand Logo */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <div
          className="flex items-center gap-2 sm:gap-2.5 cursor-pointer"
          onClick={onOpenLanding || onOpenProfile}
          title="Return to CapitalBridge Introduction"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#0B5738] flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
            <span className="font-black text-white text-sm tracking-tighter">CB</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 tracking-tight text-base">CapitalBridge</span>
            </div>
            <p className="text-[10px] text-slate-400 hidden 2xl:block font-medium">
              Explainable Financial-Readiness Platform
            </p>
          </div>
        </div>

        {/* Interactive Search Bar with ⌘K (Desktop) */}
        <button
          type="button"
          onClick={onOpenSearch}
          className="hidden lg:flex items-center gap-2 bg-slate-50 hover:bg-slate-100/90 border border-slate-200/80 rounded-xl px-3 py-1.5 w-44 xl:w-56 transition text-xs text-slate-400 cursor-pointer shadow-2xs"
          title="Search verified evidence, metrics, or views (Ctrl+K or ⌘K)"
        >
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="flex-1 text-slate-500 text-left truncate">Search...</span>
          <kbd className="bg-white border border-slate-200 text-slate-400 font-mono text-[10px] px-1.5 py-0.5 rounded-md shadow-2xs">
            ⌘K
          </kbd>
        </button>

        {/* Mobile Search Trigger Icon */}
        <button
          type="button"
          onClick={onOpenSearch}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
          title="Search metrics, evidence, or actions"
        >
          <Search className="w-4 h-4" />
        </button>
      </div>

      {/* Center/Right Context Items */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Supabase Cloud Sync Status Pill */}
        {cloudSyncStatus === 'synced' && (
          <div
            className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 bg-emerald-50/80 border border-emerald-200/70 px-2.5 py-1 rounded-xl shadow-2xs"
            title="Supabase Database: Cloud Synced"
          >
            <Database className="w-3 h-3 text-emerald-600" />
            <span className="hidden xl:inline">Synced</span>
          </div>
        )}
        {cloudSyncStatus === 'syncing' && (
          <div
            className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200/70 px-2.5 py-1 rounded-xl shadow-2xs"
            title="Supabase Database: Syncing..."
          >
            <RefreshCw className="w-3 h-3 text-amber-600 animate-spin" />
            <span className="hidden xl:inline">Syncing</span>
          </div>
        )}
        {cloudSyncStatus === 'offline' && (
          <div
            className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-xl shadow-2xs"
            title="Offline Cache active"
          >
            <CloudOff className="w-3 h-3 text-slate-500" />
            <span className="hidden xl:inline">Offline</span>
          </div>
        )}

        {/* Interactive Observation Window / Date Selector Pill */}
        <div className="relative hidden 2xl:block" ref={calendarRef}>
          <button
            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
            className="inline-flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-700 px-2.5 py-1 rounded-xl text-xs font-semibold transition cursor-pointer"
            title="Select evidence observation window"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{observationWindow}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isCalendarOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-xs">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                Observation Window
              </div>
              {[
                { id: '3-Month Window', label: '3-Month Recent (Jun–Aug 2026)' },
                { id: '6-Month Audit', label: '6-Month Full Audit (Mar–Aug 2026)' },
                { id: 'All Active Records', label: 'All Consented History' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    onSelectObservationWindow?.(opt.id);
                    setIsCalendarOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-50 transition ${
                    observationWindow === opt.id ? 'font-bold text-emerald-800 bg-emerald-50/50' : 'text-slate-700'
                  }`}
                >
                  <span>{opt.label}</span>
                  {observationWindow === opt.id && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Live Score Pill */}
        <div className="flex items-center gap-2 bg-emerald-50/70 border border-emerald-200/70 rounded-xl px-2.5 py-1.5 shadow-2xs">
          <div className="hidden sm:block text-right">
            <div className="text-[9px] uppercase tracking-wider text-emerald-800 font-bold leading-none">Readiness</div>
            <div className="text-[11px] font-bold text-emerald-700 leading-tight">{readinessBand}</div>
          </div>
          <div className="hidden sm:block h-5 w-[1px] bg-emerald-200" />
          <div className="text-sm sm:text-base font-black text-slate-900 tabular-nums tracking-tight">
            {score}
            <span className="text-[10px] font-normal text-slate-400">/1000</span>
          </div>
        </div>

        {/* Sign In Button (Shown when not authenticated) */}
        {!sessionUser && onOpenAuth && (
          <button
            onClick={() => onOpenAuth('signin')}
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-xl transition shadow-xs active:scale-95 cursor-pointer shrink-0"
            title="Sign in to your CapitalBridge account"
          >
            <LogIn className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sign In</span>
          </button>
        )}

        {/* Active Account Switcher Dropdown */}
        <div className="relative" ref={switcherRef}>
          <button
            onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
            title={`Active Profile: ${profile.name} (${profile.businessName}). Click to switch or view profile.`}
            className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl p-1 sm:px-2.5 sm:py-1.5 text-xs text-left transition cursor-pointer"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0 relative">
              {getInitials(profile.name)}
              {sessionUser && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 absolute -bottom-0.5 -right-0.5 ring-1.5 ring-white" />
              )}
            </div>
            <div className="hidden md:block max-w-[120px] lg:max-w-[140px]">
              <div className="font-bold text-slate-800 truncate leading-tight">
                {profile.name}
              </div>
              <div className="text-[11px] text-slate-400 truncate leading-tight">
                {profile.businessName}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>

          {/* Switcher Popover Menu */}
          {isSwitcherOpen && (
            <div className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-1.5rem)] bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3.5 py-2 border-b border-slate-100">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Switch Active Account
                </div>
              </div>

              <div className="max-h-56 overflow-y-auto py-1">
                {profiles.map((p) => {
                  const isActive = p.id === profile.id;
                  const isBenchmark = p.id === 'usr_ama_mensah_01';
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        onSelectProfile?.(p.id);
                        setIsSwitcherOpen(false);
                      }}
                      className={`w-full px-3.5 py-2.5 text-left text-xs flex items-center justify-between hover:bg-slate-50 transition cursor-pointer ${
                        isActive ? 'bg-emerald-50/60 font-bold' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 ${
                            isBenchmark ? 'bg-emerald-600' : 'bg-slate-700'
                          }`}
                        >
                          {getInitials(p.name)}
                        </div>
                        <div className="truncate">
                          <div className="text-slate-900 font-bold truncate flex items-center gap-1.5">
                            <span>{p.name}</span>
                            {isBenchmark && (
                              <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-semibold">
                                Benchmark
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">
                            {p.businessName}
                          </div>
                        </div>
                      </div>
                      {isActive && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              <div className="p-2 border-t border-slate-100 space-y-1">
                {onOpenOnboarding && (
                  <button
                    onClick={() => {
                      setIsSwitcherOpen(false);
                      onOpenOnboarding();
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50 rounded-xl transition flex items-center gap-2 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4 text-emerald-600" />
                    <span>Create New Account...</span>
                  </button>
                )}

                {!sessionUser && onOpenAuth && (
                  <button
                    onClick={() => {
                      setIsSwitcherOpen(false);
                      onOpenAuth('signin');
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl transition flex items-center gap-2 cursor-pointer"
                  >
                    <LogIn className="w-4 h-4 text-slate-500" />
                    <span>Sign In to Account...</span>
                  </button>
                )}

                {onOpenProfile && (
                  <button
                    onClick={() => {
                      setIsSwitcherOpen(false);
                      onOpenProfile();
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 rounded-xl transition flex items-center gap-2 cursor-pointer"
                  >
                    <Building className="w-4 h-4 text-slate-400" />
                    <span>View Profile & Consent</span>
                  </button>
                )}

                {sessionUser && onSignOut && (
                  <button
                    onClick={() => {
                      setIsSwitcherOpen(false);
                      onSignOut();
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span className="truncate">Sign Out ({sessionUser.email})</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Quick Action: Export / View Passport */}
        <button
          onClick={onOpenPassport}
          className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-2xl transition shadow-sm active:scale-95 cursor-pointer"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Passport</span>
          <ExternalLink className="w-3 h-3 opacity-60 ml-0.5" />
        </button>

        {/* Notification Bell Center */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            title="Audit and activity verification center"
            className="p-2 rounded-2xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition relative cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-2 right-2 ring-2 ring-white" />
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 max-w-[calc(100vw-1.5rem)] bg-white rounded-3xl shadow-2xl border border-slate-200/90 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-bold text-slate-900">Verification & Activity Feed</span>
                </div>
                <button
                  onClick={() => setIsNotificationsOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {/* Notification Item 1: Live Engine */}
                <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-2xl">
                  <div className="flex items-center justify-between font-bold text-emerald-950 mb-1">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Readiness Engine Active</span>
                    </span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded font-mono">
                      {score}/1000
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-800/80">
                    Live deterministic score evaluating {profile.name}&apos;s profile across all 6 verified indicators ({readinessBand}).
                  </p>
                </div>

                {/* Notification Item 2: Cloud Sync */}
                <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-2xl">
                  <div className="flex items-center justify-between font-semibold text-slate-800 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Supabase Sync Status</span>
                    </span>
                    <span className="text-[10px] text-slate-500">Just now</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {cloudSyncStatus === 'synced'
                      ? 'Bi-directional cloud sync active. Local state persisted.'
                      : 'Working in offline cache mode with local persistence.'}
                  </p>
                </div>

                {/* Notification Item 3: Active Profile */}
                <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-2xl">
                  <div className="flex items-center justify-between font-semibold text-slate-800 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Active Workspace</span>
                    </span>
                    <span className="text-[10px] text-slate-500 truncate max-w-[100px]">{profile.businessName}</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Capital goal set to {profile.currency} {profile.capitalGoalAmount.toLocaleString()} ({profile.capitalGoalPurpose}).
                  </p>
                </div>
              </div>

              {/* Reset to Ama Mensah demo baseline */}
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => {
                    setIsNotificationsOpen(false);
                    onResetDemo();
                  }}
                  className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-xl transition flex items-center justify-center gap-1.5 text-xs cursor-pointer border border-slate-200/80"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Reset to Ama Mensah Baseline</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
