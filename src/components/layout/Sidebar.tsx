import React from 'react';
import {
  LayoutDashboard,
  FileCheck2,
  SlidersHorizontal,
  Bot,
  ListTodo,
  ShieldCheck,
  Building2,
  Gauge,
  Sparkles,
  UserCheck,
  UserPlus,
  LogIn,
  LogOut,
  Compass,
} from 'lucide-react';

export type TabType =
  | 'dashboard'
  | 'evidence'
  | 'indicators'
  | 'simulator'
  | 'coach'
  | 'actions'
  | 'passport'
  | 'lender';

interface SidebarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  evidenceCount: number;
  openTasksCount: number;
  sessionUser?: { id: string; email: string } | null;
  onOpenAuth?: (mode?: 'signin' | 'signup') => void;
  onSignOut?: () => void;
  onOpenProfile?: () => void;
  onOpenOnboarding?: () => void;
  onOpenLanding?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  evidenceCount,
  openTasksCount,
  sessionUser = null,
  onOpenAuth,
  onSignOut,
  onOpenProfile,
  onOpenOnboarding,
  onOpenLanding,
}) => {
  const mainMenuItems: Array<{
    id: TabType;
    label: string;
    icon: React.ElementType;
    badge?: string | number;
  }> = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'evidence', label: 'Evidence Center', icon: FileCheck2, badge: evidenceCount },
    { id: 'indicators', label: 'Readiness Metrics', icon: Gauge },
  ];

  const engineItems: Array<{
    id: TabType;
    label: string;
    icon: React.ElementType;
    badge?: string | number;
    badgeColor?: string;
  }> = [
    { id: 'simulator', label: 'What-If Simulator', icon: SlidersHorizontal, badge: 'Interactive', badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200/70' },
    { id: 'coach', label: 'AI Credit Coach', icon: Bot, badge: 'Grounded', badgeColor: 'bg-teal-50 text-teal-700 border-teal-200/70' },
    { id: 'actions', label: 'Action Plan', icon: ListTodo, badge: openTasksCount },
    { id: 'passport', label: 'Financial Passport', icon: ShieldCheck },
    { id: 'lender', label: 'Lender View (P1)', icon: Building2 },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200/80 p-4 shrink-0 select-none transition-colors">
      {/* Navigation Links */}
      <nav className="space-y-4 flex-1">
        {/* Main Menu Section */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1.5">
            Main Menu
          </div>
          <div className="space-y-1 mt-1">
            {mainMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Readiness Engine Section */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1.5">
            Readiness Engine
          </div>
          <div className="space-y-1 mt-1">
            {engineItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                        item.badgeColor
                          ? item.badgeColor
                          : isActive
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border-slate-200/80'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* General / Profile & Consent Section */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1.5">
            General
          </div>
          <div className="space-y-1 mt-1">
            {!sessionUser && onOpenAuth && (
              <button
                onClick={() => onOpenAuth('signin')}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200/80 transition cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-emerald-600" />
                <span>Sign In to Account</span>
              </button>
            )}

            {onOpenOnboarding && (
              <button
                onClick={onOpenOnboarding}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-emerald-700 hover:bg-emerald-50 transition cursor-pointer"
              >
                <UserPlus className="w-4 h-4 text-emerald-600" />
                <span>+ New Account</span>
              </button>
            )}

            {onOpenProfile && (
              <button
                onClick={onOpenProfile}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition cursor-pointer"
              >
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>Profile & Consent</span>
              </button>
            )}

            {onOpenLanding && (
              <button
                onClick={onOpenLanding}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition cursor-pointer"
                title="Return to CapitalBridge Introduction"
              >
                <Compass className="w-4 h-4 text-emerald-600" />
                <span>Product Intro</span>
              </button>
            )}

            {sessionUser && onSignOut && (
              <button
                onClick={onSignOut}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-medium text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                title={`Signed in as ${sessionUser.email}`}
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                <span className="truncate">Sign Out</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Bottom Pro / Capital Goal Card (matching Oripio "Upgrade Pro!" green widget) */}
      <div className="mt-auto pt-3 space-y-2">
        <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 text-white rounded-3xl p-4 shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-200 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Capital Readiness</span>
            </div>
            <p className="text-[11px] text-emerald-100/90 leading-snug mb-3">
              Aiming for GH₵8,000 working capital in Makola Market.
            </p>
            <button
              onClick={() => onSelectTab('passport')}
              className="w-full bg-white hover:bg-slate-100 text-emerald-900 font-bold text-xs py-2 rounded-xl transition shadow-xs flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>View Passport</span>
            </button>
          </div>
        </div>

        {/* Methodology & Calculation Disclaimer */}
        <div className="px-2 py-1 text-[10px] text-slate-400 flex items-center justify-between">
          <span>Methodology: v1.0-prototype</span>
          <span className="font-semibold text-emerald-600">Deterministic Math</span>
        </div>
      </div>
    </aside>
  );
};
