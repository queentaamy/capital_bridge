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
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  evidenceCount,
  openTasksCount,
}) => {
  const navItems: Array<{
    id: TabType;
    label: string;
    icon: React.ElementType;
    badge?: string | number;
    badgeColor?: string;
  }> = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'evidence', label: 'Evidence Center', icon: FileCheck2, badge: evidenceCount },
    { id: 'indicators', label: 'Readiness Metrics', icon: Gauge },
    { id: 'simulator', label: 'What-If Simulator', icon: SlidersHorizontal, badge: 'Interactive', badgeColor: 'bg-teal-500/10 text-teal-400 border border-teal-500/30' },
    { id: 'coach', label: 'AI Credit Coach', icon: Bot, badge: 'Grounded', badgeColor: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' },
    { id: 'actions', label: 'Action Plan', icon: ListTodo, badge: openTasksCount },
    { id: 'passport', label: 'Financial Passport', icon: ShieldCheck },
    { id: 'lender', label: 'Lender View (P1)', icon: Building2 },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-slate-900/60 border-r border-slate-800 p-4 shrink-0 select-none">
      {/* Navigation Links */}
      <nav className="space-y-1.5 flex-1">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-3 py-2">
          Readiness Journey
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    item.badgeColor
                      ? item.badgeColor
                      : isActive
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Methodology Stamp Card */}
      <div className="mt-auto pt-4 border-t border-slate-800/80">
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-xs">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Deterministic Math</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            All scores are calculated deterministically. AI provides strictly grounded explanation, never arithmetic.
          </p>
          <div className="mt-2 text-[10px] text-slate-500 font-mono">
            Methodology: v1.0-prototype
          </div>
        </div>
      </div>
    </aside>
  );
};
