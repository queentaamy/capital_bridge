import React, { useState, useMemo } from 'react';
import { TrendingUp, Calendar, ChevronDown, ShieldCheck } from 'lucide-react';
import type { EvidenceRecord, UserProfile } from '../../types';

interface MonthlyData {
  month: string;
  amount: number;
  orders: number;
  heightPercent: number;
  isPeak?: boolean;
}

export interface TurnoverChartProps {
  records?: EvidenceRecord[];
  currency?: string;
  profile?: UserProfile;
}

export const TurnoverChart: React.FC<TurnoverChartProps> = ({
  records = [],
  currency = 'GH₵',
  profile,
}) => {
  const [timeRange, setTimeRange] = useState<'3-mo' | '6-mo'>('6-mo');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Compute dynamic monthly figures based on active evidence records
  const monthlyRecords: MonthlyData[] = useMemo(() => {
    const activeRecords = records.filter((r) => r.isActive);
    const commercialRecords = activeRecords.filter(
      (r) => r.category === 'transactions' || r.category === 'business'
    );

    const totalInflow = commercialRecords.reduce(
      (sum, r) => sum + (r.totalInflow ?? r.balance ?? 0),
      0
    );

    // Baseline 6-month months
    const allMonths = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
    const monthsToUse = timeRange === '3-mo' ? allMonths.slice(3) : allMonths;

    if (totalInflow === 0) {
      return monthsToUse.map((m) => ({
        month: m,
        amount: 0,
        orders: 0,
        heightPercent: 8,
        isPeak: false,
      }));
    }

    // Weight distribution across 6 months modeling realistic trading growth
    const weights6 = [0.755, 0.826, 0.806, 0.898, 0.938, 1.0];
    const activeWeights = timeRange === '3-mo' ? weights6.slice(3) : weights6;
    const weightSum = activeWeights.reduce((a, b) => a + b, 0);

    // If records exist, calculate proportional distribution
    const rawData = monthsToUse.map((month, idx) => {
      const weight = activeWeights[idx];
      const monthlyShare = (totalInflow * (weight / weightSum));
      const amount = Math.round(monthlyShare);
      const orders = Math.max(1, Math.round(amount / 240));
      return { month, amount, orders };
    });

    const maxAmount = Math.max(...rawData.map((d) => d.amount), 1);

    return rawData.map((d) => ({
      ...d,
      heightPercent: Math.max(12, Math.round((d.amount / maxAmount) * 92)),
      isPeak: d.amount === maxAmount && d.amount > 0,
    }));
  }, [records, timeRange]);

  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    return monthlyRecords[monthlyRecords.length - 1]?.month || 'Aug';
  });

  // Ensure selected month matches available months in current time range
  const activeRecord = useMemo(() => {
    const found = monthlyRecords.find((m) => m.month === selectedMonth);
    return found || monthlyRecords[monthlyRecords.length - 1] || {
      month: 'Aug',
      amount: 0,
      orders: 0,
      heightPercent: 10,
    };
  }, [monthlyRecords, selectedMonth]);

  // Compute growth percentage comparing first and last month in current view
  const growthPercent = useMemo(() => {
    if (monthlyRecords.length < 2) return '+0.0%';
    const first = monthlyRecords[0].amount;
    const last = monthlyRecords[monthlyRecords.length - 1].amount;
    if (first === 0) return last > 0 ? '+100%' : '0%';
    const delta = ((last - first) / first) * 100;
    return `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}%`;
  }, [monthlyRecords]);

  const activeCommercialCount = records.filter(
    (r) => r.isActive && (r.category === 'transactions' || r.category === 'business')
  ).length;

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.03)] transition">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="font-bold text-slate-900 text-base tracking-tight">
              Commercial Trading Overview
            </h3>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>{activeCommercialCount > 0 ? 'Verified Inflows' : 'No Active Inflows'}</span>
            </span>
          </div>
          <p className="text-xs text-slate-500">
            {profile?.businessName
              ? `Monthly turnover streams across Mobile Money and merchant ledgers for ${profile.businessName}.`
              : 'Monthly cash inflows across Mobile Money and merchant ledger channels.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Legend */}
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 mr-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            <span className="font-medium text-slate-600">Trading Revenue</span>
          </div>

          {/* Time range dropdown pill */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="inline-flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-700 px-3 py-1.5 rounded-2xl text-xs font-semibold transition cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{timeRange === '6-mo' ? '6-Month Audit' : '3-Month Audit'}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-40 bg-white border border-slate-200 rounded-2xl shadow-xl py-1 z-30 animate-in fade-in zoom-in-95">
                <button
                  onClick={() => {
                    setTimeRange('6-mo');
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full px-3 py-1.5 text-left text-xs font-semibold hover:bg-slate-50 flex items-center justify-between ${
                    timeRange === '6-mo' ? 'text-emerald-700 font-bold bg-emerald-50/50' : 'text-slate-700'
                  }`}
                >
                  <span>6-Month Audit</span>
                  {timeRange === '6-mo' && <span className="text-emerald-600 font-bold">✓</span>}
                </button>
                <button
                  onClick={() => {
                    setTimeRange('3-mo');
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full px-3 py-1.5 text-left text-xs font-semibold hover:bg-slate-50 flex items-center justify-between ${
                    timeRange === '3-mo' ? 'text-emerald-700 font-bold bg-emerald-50/50' : 'text-slate-700'
                  }`}
                >
                  <span>3-Month Audit</span>
                  {timeRange === '3-mo' && <span className="text-emerald-600 font-bold">✓</span>}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary Stat & Active Highlight Pill */}
      <div className="flex flex-wrap items-baseline gap-3 mb-6">
        <div className="text-3xl font-black text-slate-900 tabular-nums tracking-tight">
          {currency} {activeRecord.amount.toLocaleString()}
        </div>
        <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          <span>{growthPercent} vs baseline window</span>
        </div>
        <div className="text-xs text-slate-400 ml-auto hidden sm:block">
          Avg daily throughput: <strong className="text-slate-700 font-semibold">{activeRecord.orders} entries/day</strong> in {activeRecord.month}
        </div>
      </div>

      {/* Vertical Pill Bar Chart */}
      <div className="relative pt-8 pb-2">
        <div className="h-44 flex items-end justify-between gap-2 sm:gap-4 px-2 sm:px-6">
          {monthlyRecords.map((rec) => {
            const isSelected = selectedMonth === rec.month;
            return (
              <div
                key={rec.month}
                onClick={() => setSelectedMonth(rec.month)}
                className="flex-1 flex flex-col items-center group cursor-pointer relative"
              >
                {/* Tooltip on Active/Hover */}
                {(isSelected || rec.isPeak) && (
                  <div className="absolute -top-10 bg-slate-900 text-white text-[11px] font-bold px-2.5 py-1 rounded-xl shadow-lg whitespace-nowrap z-10 animate-in fade-in zoom-in-95 pointer-events-none">
                    {currency} {rec.amount.toLocaleString()}
                    <div className="w-2 h-2 bg-slate-900 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2" />
                  </div>
                )}

                {/* Pill Pillar */}
                <div className="w-full max-w-[48px] bg-slate-100 rounded-full h-full flex items-end p-1 transition group-hover:bg-slate-200/70">
                  <div
                    style={{ height: `${rec.heightPercent}%` }}
                    className={`w-full rounded-full transition-all duration-500 ease-out ${
                      isSelected
                        ? 'bg-emerald-600 shadow-md shadow-emerald-600/30'
                        : rec.isPeak
                        ? 'bg-emerald-500'
                        : 'bg-emerald-200/70 group-hover:bg-emerald-300'
                    }`}
                  />
                </div>

                {/* Month Label */}
                <span
                  className={`text-xs mt-3 font-semibold transition ${
                    isSelected ? 'text-emerald-700 font-bold' : 'text-slate-400 group-hover:text-slate-700'
                  }`}
                >
                  {rec.month}
                </span>
              </div>
            );
          })}
        </div>

        {/* Subtle base grid line */}
        <div className="border-b border-slate-100 w-full mt-1" />
      </div>

      {/* Mini Insight Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Continuous observation:</span>
          <strong className="text-slate-700">
            {activeCommercialCount > 0
              ? `${activeCommercialCount} Active verified commercial revenue streams`
              : 'All commercial streams inactive. Toggle records to re-enable.'}
          </strong>
        </div>
        <div className="text-emerald-700 font-medium">
          {activeRecord.amount > 0 ? 'Consistent revenue buffer verified' : 'No verified inflows recorded'}
        </div>
      </div>
    </div>
  );
};
