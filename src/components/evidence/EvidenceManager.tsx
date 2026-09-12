import React, { useState } from 'react';
import {
  FileCheck2,
  Plus,
  ToggleLeft,
  ToggleRight,
  Hash,
  ArrowDownRight,
  ArrowUpRight,
  Trash2,
} from 'lucide-react';
import type { EvidenceCategory, EvidenceRecord } from '../../types';

interface EvidenceManagerProps {
  records: EvidenceRecord[];
  onToggleRecord: (recordId: string) => void;
  onAddRecord: (newRecord: Omit<EvidenceRecord, 'id' | 'isActive'>) => void;
  onDeleteRecord?: (recordId: string) => void;
}

export const EvidenceManager: React.FC<EvidenceManagerProps> = ({
  records,
  onToggleRecord,
  onAddRecord,
  onDeleteRecord,
}) => {
  const [activeCategory, setActiveCategory] = useState<EvidenceCategory | 'all'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State for Adding New Evidence
  const [newCategory, setNewCategory] = useState<EvidenceCategory>('business');
  const [newTitle, setNewTitle] = useState('');
  const [newSource, setNewSource] = useState('');
  const [newRecordCount, setNewRecordCount] = useState(90);
  const [newInflow, setNewInflow] = useState(15000);
  const [newNotes, setNewNotes] = useState('');

  const categories: Array<{ id: EvidenceCategory | 'all'; label: string }> = [
    { id: 'all', label: 'All Evidence' },
    { id: 'transactions', label: 'Transactions' },
    { id: 'savings', label: 'Savings & Susu' },
    { id: 'business', label: 'Business Records' },
    { id: 'obligations', label: 'Debt Obligations' },
    { id: 'documents', label: 'Documents & Permits' },
  ];

  const filteredRecords =
    activeCategory === 'all'
      ? records
      : records.filter((r) => r.category === activeCategory);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newSource) return;

    onAddRecord({
      category: newCategory,
      title: newTitle,
      sourceName: newSource,
      dateRange: {
        start: '2026-03-01',
        end: '2026-05-31',
      },
      recordCount: Number(newRecordCount),
      totalInflow: Number(newInflow),
      totalOutflow: 0,
      balance: Number(newInflow),
      status: 'consented_verified',
      traceabilityHash: `sha256-sim-${Math.random().toString(36).substring(2, 9)}`,
      notes: newNotes || 'Added via simulated consented upload.',
    });

    setIsModalOpen(false);
    setNewTitle('');
    setNewSource('');
  };

  return (
    <div className="space-y-6">
      {/* Header with CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Consented Evidence Center</h2>
          <p className="text-xs text-slate-500 mt-1">
            Controlled financial inputs normalized into verifiable readiness metrics.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-2xl text-xs transition shadow-sm active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add / Simulate Evidence</span>
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCategory(c.id)}
            className={`px-3.5 py-1.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition ${
              activeCategory === c.id
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-2xs'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Evidence Record Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRecords.map((rec) => (
          <div
            key={rec.id}
            className={`rounded-3xl border p-4 sm:p-6 transition flex flex-col justify-between ${
              rec.isActive
                ? 'bg-white border-slate-200/80 hover:border-slate-300 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]'
                : 'bg-slate-50/70 border-slate-200 opacity-60'
            }`}
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                    <FileCheck2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      {rec.category}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">{rec.title}</h4>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {onDeleteRecord &&
                    rec.id !== 'ev_momo_01' &&
                    rec.id !== 'ev_bank_01' &&
                    rec.id !== 'ev_savings_01' &&
                    rec.id !== 'ev_biz_01' &&
                    rec.id !== 'ev_debt_01' &&
                    rec.id !== 'ev_kyc_01' && (
                      <button
                        onClick={() => onDeleteRecord(rec.id)}
                        title="Remove custom record"
                        className="p-1 text-slate-300 hover:text-rose-600 transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  <button
                    onClick={() => onToggleRecord(rec.id)}
                    title={rec.isActive ? 'Disable record (simulate removal)' : 'Enable record'}
                    className="p-1 text-slate-400 hover:text-slate-800 transition shrink-0 cursor-pointer"
                  >
                    {rec.isActive ? (
                      <ToggleRight className="w-6 h-6 text-emerald-600" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-slate-300" />
                    )}
                  </button>
                </div>
              </div>

              {/* Source & Date Range */}
              <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-4 space-y-2 my-3 text-xs">
                <div className="flex items-center justify-between text-slate-700">
                  <span className="text-slate-500 font-medium">Verified Source:</span>
                  <span className="font-bold text-slate-800 truncate max-w-[160px] text-right">{rec.sourceName}</span>
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <span className="text-slate-500 font-medium">Window:</span>
                  <span className="font-mono text-slate-600">
                    {rec.dateRange.start} → {rec.dateRange.end}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <span className="text-slate-500 font-medium">Entries Verified:</span>
                  <span className="text-emerald-700 font-black tabular-nums">
                    {rec.recordCount} records
                  </span>
                </div>

                {rec.totalInflow !== undefined && (
                  <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
                    <div className="text-[11px] text-slate-600 flex items-center gap-1">
                      <ArrowDownRight className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Inflows:</span>
                      <strong className="text-slate-900 font-bold">
                        GH₵ {rec.totalInflow.toLocaleString()}
                      </strong>
                    </div>
                    {rec.totalOutflow !== undefined && rec.totalOutflow > 0 && (
                      <div className="text-[11px] text-slate-600 flex items-center gap-1">
                        <ArrowUpRight className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Outflows:</span>
                        <strong className="text-slate-900 font-bold">
                          GH₵ {rec.totalOutflow.toLocaleString()}
                        </strong>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Notes */}
              {rec.notes && (
                <p className="text-xs text-slate-500 leading-relaxed italic">{rec.notes}</p>
              )}
            </div>

            {/* Provenance Hash */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400 font-mono">
              <span className="flex items-center gap-1 truncate max-w-[180px]">
                <Hash className="w-3 h-3 shrink-0" />
                <span className="truncate">{rec.traceabilityHash || 'sha256-verified'}</span>
              </span>
              <span className="text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full font-sans font-bold shrink-0">
                Consented & Audited
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Evidence Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-slate-200/80 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-5 sm:p-7 text-slate-800 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Add Consented Evidence</h3>
            <p className="text-xs text-slate-500 mb-4">
              Simulate submitting additional bookkeeping, bank statements, or savings logs.
            </p>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Evidence Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as EvidenceCategory)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-emerald-500"
                >
                  <option value="business">Business Sales Records (Books/Ledger)</option>
                  <option value="transactions">Bank / Mobile Money Statement</option>
                  <option value="savings">Susu / Thrift Savings</option>
                  <option value="obligations">Debt / Micro-loan Payoff</option>
                  <option value="documents">License / Permit Document</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sales Ledger Q1 (March - May 2026)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Verified Source Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Daily Vendor Book & Paper Receipts"
                  value={newSource}
                  onChange={(e) => setNewSource(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Total Amount (GH₵)</label>
                  <input
                    type="number"
                    value={newInflow}
                    onChange={(e) => setNewInflow(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Record Count</label>
                  <input
                    type="number"
                    value={newRecordCount}
                    onChange={(e) => setNewRecordCount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Provenance Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Reconstructed receipt records stamped by market committee."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition shadow-sm"
                >
                  Add to Evidence & Recalculate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
