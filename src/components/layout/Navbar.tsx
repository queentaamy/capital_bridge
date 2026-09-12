import React, { useState, useRef, useEffect } from 'react';
import {
  ShieldCheck,
  Target,
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
} from 'lucide-react';
import type { UserProfile, ReadinessBand } from '../../types';

export type CloudSyncStatus = 'synced' | 'syncing' | 'offline';

interface NavbarProps {
  profile: UserProfile;
  score: number;
  readinessBand: ReadinessBand;
  cloudSyncStatus?: CloudSyncStatus;
  profiles?: UserProfile[];
  sessionUser?: { id: string; email: string } | null;
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
  const switcherRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (switcherRef.current && !switcherRef.current.contains(event.target as Node)) {
        setIsSwitcherOpen(false);
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
    <header className="h-16 sm:h-18 bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 px-3 sm:px-4 lg:px-8 flex items-center justify-between transition-colors max-w-full overflow-hidden">
      {/* Brand Logo */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <div
          className="flex items-center gap-2 sm:gap-2.5 cursor-pointer"
          onClick={onOpenLanding || onOpenProfile}
          title="Return to CapitalBridge Introduction"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-[#0B5738] flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
            <span className="font-black text-white text-sm sm:text-base tracking-tighter">CB</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 tracking-tight text-base sm:text-lg">CapitalBridge</span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block font-medium">
              Explainable Financial-Readiness Platform
            </p>
          </div>
        </div>

        {/* Search Bar with ⌘K (matching Oripio/Modulix) */}
        <div className="hidden xl:flex items-center gap-2 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 rounded-2xl px-3.5 py-2 w-72 transition text-xs text-slate-400">
          <Search className="w-4 h-4 text-slate-400" />
          <span className="flex-1 text-slate-500">Search metrics, records...</span>
          <kbd className="bg-white border border-slate-200 text-slate-400 font-mono text-[10px] px-1.5 py-0.5 rounded-md shadow-2xs">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Center/Right Context Items */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Supabase Cloud Sync Status Pill */}
        {cloudSyncStatus === 'synced' && (
          <div className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-3 py-1.5 rounded-2xl shadow-2xs">
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span>Cloud Synced</span>
          </div>
        )}
        {cloudSyncStatus === 'syncing' && (
          <div className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-3 py-1.5 rounded-2xl shadow-2xs">
            <RefreshCw className="w-3.5 h-3.5 text-amber-600 animate-spin" />
            <span>Syncing DB...</span>
          </div>
        )}
        {cloudSyncStatus === 'offline' && (
          <div className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-2xl shadow-2xs">
            <CloudOff className="w-3.5 h-3.5 text-slate-500" />
            <span>Offline Cache</span>
          </div>
        )}

        {/* Date Selector Pill */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-50 border border-slate-200/80 text-slate-600 px-3.5 py-1.5 rounded-2xl text-xs font-medium">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>Sat, 12 Sep 2026</span>
        </div>

        {/* Live Score Pill */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 bg-emerald-50/70 border border-emerald-200/70 rounded-2xl px-2.5 sm:px-3.5 py-1 sm:py-1.5 shadow-2xs">
          <div className="hidden sm:block text-right">
            <div className="text-[9px] uppercase tracking-wider text-emerald-800 font-bold">Readiness</div>
            <div className="text-xs font-black text-emerald-700">{readinessBand}</div>
          </div>
          <div className="hidden sm:block h-6 w-[1px] bg-emerald-200" />
          <div className="text-sm sm:text-lg font-black text-slate-900 tabular-nums tracking-tight">
            {score}
            <span className="text-[10px] sm:text-xs font-normal text-slate-400">/1000</span>
          </div>
        </div>

        {/* Sign In / Active Session Status */}
        {sessionUser ? (
          <div className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-3 py-1.5 rounded-2xl shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="max-w-[120px] truncate">{sessionUser.email}</span>
          </div>
        ) : (
          onOpenAuth && (
            <button
              onClick={() => onOpenAuth('signin')}
              className="inline-flex items-center gap-1.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-2xl transition shadow-xs active:scale-95 cursor-pointer shrink-0"
              title="Sign in to your CapitalBridge account"
            >
              <LogIn className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sign In</span>
            </button>
          )
        )}

        {/* Create Account Action Button */}
        {onOpenOnboarding && (
          <button
            onClick={onOpenOnboarding}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-2 rounded-2xl transition shadow-2xs cursor-pointer"
            title="Create a new financial readiness account"
          >
            <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
            <span>+ New Account</span>
          </button>
        )}

        {/* Active Account Switcher Dropdown */}
        <div className="relative" ref={switcherRef}>
          <button
            onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
            title="Switch accounts or view profile"
            className="flex items-center gap-1.5 sm:gap-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl p-1 sm:px-3 sm:py-1.5 text-xs text-left transition cursor-pointer"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
              {getInitials(profile.name)}
            </div>
            <div className="hidden md:block">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-800">{profile.name}</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500 truncate max-w-[100px]">{profile.businessName}</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                <Target className="w-3 h-3 text-emerald-600" />
                <span>Goal: {profile.currency} {profile.capitalGoalAmount.toLocaleString()}</span>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Switcher Popover Menu */}
          {isSwitcherOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3.5 py-2 border-b border-slate-100">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Switch Active Account
                </div>
              </div>

              <div className="max-h-56 overflow-y-auto py-1">
                {profiles.map((p) => {
                  const isActive = p.id === profile.id;
                  const isAma = p.id === 'usr_ama_mensah_01';
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        onSelectProfile?.(p.id);
                        setIsSwitcherOpen(false);
                      }}
                      className={`w-full px-3.5 py-2.5 text-left text-xs flex items-center justify-between hover:bg-slate-50 transition ${
                        isActive ? 'bg-emerald-50/60 font-bold' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 ${
                            isAma ? 'bg-emerald-600' : 'bg-slate-700'
                          }`}
                        >
                          {getInitials(p.name)}
                        </div>
                        <div className="truncate">
                          <div className="text-slate-900 font-bold truncate flex items-center gap-1.5">
                            <span>{p.name}</span>
                            {isAma && (
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

        {/* Quick Action: Export / View Passport (Accessible via BottomNav on mobile) */}
        <button
          onClick={onOpenPassport}
          className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-2xl transition shadow-sm active:scale-95"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Passport</span>
          <ExternalLink className="w-3 h-3 opacity-60 ml-0.5" />
        </button>

        {/* Notification Bell Icon */}
        <button
          onClick={onResetDemo}
          title="Reset to Ama Mensah baseline state"
          className="hidden sm:inline-flex p-2 rounded-2xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition relative"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-2 right-2 ring-2 ring-white" />
        </button>
      </div>
    </header>
  );
};
