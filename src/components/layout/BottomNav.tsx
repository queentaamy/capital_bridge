import React from 'react';
import {
  LayoutDashboard,
  FileCheck2,
  SlidersHorizontal,
  Bot,
  ShieldCheck,
} from 'lucide-react';
import type { TabType } from './Sidebar';

interface BottomNavProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
}) => {
  const tabs: Array<{ id: TabType; label: string; icon: React.ElementType }> = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'evidence', label: 'Evidence', icon: FileCheck2 },
    { id: 'simulator', label: 'What-If', icon: SlidersHorizontal },
    { id: 'coach', label: 'Coach', icon: Bot },
    { id: 'passport', label: 'Passport', icon: ShieldCheck },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur border-t border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-xl">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-medium transition ${
              isActive
                ? 'text-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
