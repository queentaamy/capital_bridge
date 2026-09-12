import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  FileCheck2,
  Gauge,
  ListTodo,
  Compass,
  ArrowRight,
  ShieldCheck,
  Bot,
  SlidersHorizontal,
  LayoutDashboard,
} from 'lucide-react';
import type { EvidenceRecord, ImprovementAction } from '../../types';
import type { TabType } from './Sidebar';

export interface SearchPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  records: EvidenceRecord[];
  actions: ImprovementAction[];
  onSelectTab: (tab: TabType) => void;
}

export const SearchPalette: React.FC<SearchPaletteProps> = ({
  isOpen,
  onClose,
  records,
  actions,
  onSelectTab,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const pages: Array<{ id: TabType; title: string; subtitle: string; icon: React.ElementType }> = [
    { id: 'dashboard', title: 'Dashboard & Overview', subtitle: 'Readiness score & turnover snapshot', icon: LayoutDashboard },
    { id: 'evidence', title: 'Evidence Center', subtitle: 'Manage MoMo, bank, and bookkeeping inputs', icon: FileCheck2 },
    { id: 'indicators', title: 'Readiness Metrics', subtitle: 'All 6 deterministic scoring dimensions', icon: Gauge },
    { id: 'simulator', title: 'What-If Simulator', subtitle: 'Simulate books, debt reduction & revenue smoothing', icon: SlidersHorizontal },
    { id: 'coach', title: 'AI Credit Coach', subtitle: 'Grounded readiness advice & gap analysis', icon: Bot },
    { id: 'actions', title: 'Action Plan', subtitle: 'Ranked priority steps to lift your score', icon: ListTodo },
    { id: 'passport', title: 'Financial Passport', subtitle: 'Verifiable credentials & tamper-evident hash', icon: ShieldCheck },
    { id: 'lender', title: 'Lender Review Portal', subtitle: 'Institutional underwriting view & DSCR metrics', icon: Compass },
  ];

  const matchedPages = pages.filter(
    (p) => !q || p.title.toLowerCase().includes(q) || p.subtitle.toLowerCase().includes(q)
  );

  const matchedRecords = records.filter(
    (r) =>
      !q ||
      r.title.toLowerCase().includes(q) ||
      r.sourceName.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q)
  );

  const matchedActions = actions.filter(
    (a) =>
      !q ||
      a.title.toLowerCase().includes(q) ||
      a.rationale.toLowerCase().includes(q) ||
      a.priority.toLowerCase().includes(q)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 pt-6 sm:pt-20 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[88dvh] relative animate-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search records, metrics, tasks, or navigation..."
            className="flex-1 bg-transparent text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block bg-white border border-slate-200 text-slate-400 font-mono text-[10px] px-1.5 py-0.5 rounded shadow-2xs">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4 text-xs">
          {/* Section 1: Navigation Pages */}
          {matchedPages.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
                Navigation & Views
              </div>
              <div className="space-y-1 mt-1">
                {matchedPages.map((page) => {
                  const Icon = page.icon;
                  return (
                    <button
                      key={page.id}
                      onClick={() => {
                        onSelectTab(page.id);
                        onClose();
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-emerald-50/70 hover:text-emerald-950 transition text-left group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-emerald-100 text-slate-600 group-hover:text-emerald-700 flex items-center justify-center transition shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 group-hover:text-emerald-800">
                            {page.title}
                          </div>
                          <div className="text-[11px] text-slate-400 group-hover:text-emerald-700/70">
                            {page.subtitle}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 2: Verified Evidence Records */}
          {matchedRecords.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
                Verified Evidence Records ({matchedRecords.length})
              </div>
              <div className="space-y-1 mt-1">
                {matchedRecords.slice(0, 4).map((rec) => (
                  <button
                    key={rec.id}
                    onClick={() => {
                      onSelectTab('evidence');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 transition text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                        <FileCheck2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">{rec.title}</div>
                        <div className="text-[11px] text-slate-400">
                          {rec.sourceName} • {rec.category}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-900 tabular-nums">
                        GH₵ {((rec.totalInflow ?? rec.balance) ?? 0).toLocaleString()}
                      </div>
                      <span className={`text-[10px] font-semibold ${rec.isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {rec.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Section 3: Action Plan Tasks */}
          {matchedActions.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
                Action Plan ({matchedActions.length})
              </div>
              <div className="space-y-1 mt-1">
                {matchedActions.slice(0, 3).map((act) => (
                  <button
                    key={act.id}
                    onClick={() => {
                      onSelectTab('actions');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 transition text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 font-bold text-xs">
                        #{act.rank}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">{act.title}</div>
                        <div className="text-[11px] text-slate-400">{act.priority} Priority</div>
                      </div>
                    </div>
                    <span className="text-emerald-700 font-bold text-xs">
                      +{act.estimatedPointGain} pts
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {matchedPages.length === 0 && matchedRecords.length === 0 && matchedActions.length === 0 && (
            <div className="text-center py-8 text-slate-400">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="font-semibold text-xs">No matching records or navigation items found.</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Try searching for "MoMo", "Simulator", or "Score"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
