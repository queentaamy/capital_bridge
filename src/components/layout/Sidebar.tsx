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
  Menu,
  PanelLeftClose,
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
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
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
  isCollapsed = false,
  onToggleCollapse,
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
    <aside
      className={`hidden lg:flex flex-col bg-white border-r border-slate-200/80 fixed inset-y-0 left-0 h-screen z-30 select-none transition-all duration-200 ${
        isCollapsed ? 'w-20 p-2.5' : 'w-64 p-4'
      }`}
    >
      {/* Top Header: Logo, Subtitle & Menu Collapse Button */}
      <div
        className={`flex items-center pb-3 mb-2 border-b border-slate-100 ${
          isCollapsed ? 'flex-col gap-2 justify-center items-center' : 'justify-between px-1'
        }`}
      >
        <div
          className={`flex items-center gap-2.5 cursor-pointer ${isCollapsed ? 'justify-center' : 'min-w-0'}`}
          onClick={onOpenLanding || onOpenProfile}
          title="Return to CapitalBridge Introduction"
        >
          <div className="w-9 h-9 rounded-xl bg-[#0B5738] flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
            <span className="font-black text-white text-sm tracking-tighter">CB</span>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-slate-900 tracking-tight text-base leading-tight truncate">
                CapitalBridge
              </span>
              <span className="text-[10px] text-slate-400 font-medium leading-tight truncate">
                Explainable Financial-Readiness Platform
              </span>
            </div>
          )}
        </div>

        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className={`rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer flex items-center justify-center shrink-0 ${
              isCollapsed ? 'w-9 h-9' : 'p-1.5'
            }`}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <Menu className="w-5 h-5 text-emerald-700" />
            ) : (
              <PanelLeftClose className="w-5 h-5 text-slate-500" />
            )}
          </button>
        )}
      </div>

      {/* Navigation Links - Scrollable within the fixed sidebar */}
      <nav className="space-y-4 flex-1 overflow-y-auto pr-0.5">
        {/* Main Menu Section */}
        <div>
          {isCollapsed ? (
            <div className="w-8 mx-auto my-2 border-t border-slate-200/80" />
          ) : (
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1.5">
              Main Menu
            </div>
          )}
          <div className="space-y-1 mt-1">
            {mainMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              if (isCollapsed) {
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    title={item.label}
                    className={`w-12 h-12 mx-auto flex items-center justify-center rounded-2xl text-xs font-medium transition-all relative cursor-pointer ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-800 font-bold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                    {item.badge !== undefined && (
                      <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-emerald-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center shadow-xs">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              }
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all cursor-pointer ${
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
          {isCollapsed ? (
            <div className="w-8 mx-auto my-2 border-t border-slate-200/80" />
          ) : (
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1.5">
              Readiness Engine
            </div>
          )}
          <div className="space-y-1 mt-1">
            {engineItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              if (isCollapsed) {
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    title={item.label}
                    className={`w-12 h-12 mx-auto flex items-center justify-center rounded-2xl text-xs font-medium transition-all relative cursor-pointer ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-800 font-bold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                    {item.badge !== undefined && (
                      <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-emerald-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center shadow-xs">
                        {typeof item.badge === 'string' ? item.badge[0] : item.badge}
                      </span>
                    )}
                  </button>
                );
              }
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all cursor-pointer ${
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
          {isCollapsed ? (
            <div className="w-8 mx-auto my-2 border-t border-slate-200/80" />
          ) : (
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1.5">
              General
            </div>
          )}
          <div className="space-y-1 mt-1">
            {!sessionUser && onOpenAuth && (
              <button
                onClick={() => onOpenAuth('signin')}
                title="Sign In to Account"
                className={`flex items-center rounded-2xl transition cursor-pointer ${
                  isCollapsed
                    ? 'w-12 h-12 mx-auto justify-center bg-slate-100 hover:bg-slate-200/80 text-emerald-700'
                    : 'w-full gap-2.5 px-3.5 py-2.5 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200/80'
                }`}
              >
                <LogIn className="w-4 h-4 text-emerald-600 shrink-0" />
                {!isCollapsed && <span>Sign In to Account</span>}
              </button>
            )}

            {onOpenOnboarding && (
              <button
                onClick={onOpenOnboarding}
                title="+ New Account"
                className={`flex items-center rounded-2xl transition cursor-pointer ${
                  isCollapsed
                    ? 'w-12 h-12 mx-auto justify-center hover:bg-emerald-50 text-emerald-700'
                    : 'w-full gap-2.5 px-3.5 py-2.5 text-xs font-bold text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                <UserPlus className="w-4 h-4 text-emerald-600 shrink-0" />
                {!isCollapsed && <span>+ New Account</span>}
              </button>
            )}

            {onOpenProfile && (
              <button
                onClick={onOpenProfile}
                title="Profile & Consent"
                className={`flex items-center rounded-2xl transition cursor-pointer ${
                  isCollapsed
                    ? 'w-12 h-12 mx-auto justify-center hover:bg-slate-50 text-slate-600'
                    : 'w-full gap-2.5 px-3.5 py-2.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                {!isCollapsed && <span>Profile & Consent</span>}
              </button>
            )}

            {onOpenLanding && (
              <button
                onClick={onOpenLanding}
                title="Return to CapitalBridge Introduction"
                className={`flex items-center rounded-2xl transition cursor-pointer ${
                  isCollapsed
                    ? 'w-12 h-12 mx-auto justify-center hover:bg-slate-50 text-slate-600'
                    : 'w-full gap-2.5 px-3.5 py-2.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Compass className="w-4 h-4 text-emerald-600 shrink-0" />
                {!isCollapsed && <span>Product Intro</span>}
              </button>
            )}

            {sessionUser && onSignOut && (
              <button
                onClick={onSignOut}
                title={`Signed in as ${sessionUser.email}`}
                className={`flex items-center rounded-2xl transition cursor-pointer ${
                  isCollapsed
                    ? 'w-12 h-12 mx-auto justify-center hover:bg-rose-50 text-rose-600'
                    : 'w-full gap-2.5 px-3.5 py-2.5 text-xs font-medium text-rose-600 hover:bg-rose-50'
                }`}
              >
                <LogOut className="w-4 h-4 text-rose-500 shrink-0" />
                {!isCollapsed && <span className="truncate">Sign Out</span>}
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Bottom Pro / Capital Goal Card or Collapsed Icon */}
      {isCollapsed ? (
        <div className="mt-auto pt-3 flex flex-col items-center gap-2 border-t border-slate-100">
          <button
            onClick={() => onSelectTab('passport')}
            title="View Financial Passport"
            className="w-12 h-12 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white flex items-center justify-center shadow-xs transition cursor-pointer"
          >
            <ShieldCheck className="w-5 h-5 text-emerald-300" />
          </button>
          <span className="sr-only">Deterministic Math</span>
        </div>
      ) : (
        <div className="mt-auto pt-3 space-y-2 border-t border-slate-100">
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
                className="w-full bg-white hover:bg-slate-100 text-emerald-900 font-bold text-xs py-2 rounded-xl transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
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
      )}
    </aside>
  );
};
