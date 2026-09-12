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
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1.5 flex items-center justify-around shadow-lg">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-medium transition ${
              isActive
                ? 'text-emerald-700 font-bold bg-emerald-50/80'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
