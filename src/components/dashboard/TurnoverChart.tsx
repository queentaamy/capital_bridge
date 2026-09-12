import React, { useState } from 'react';
import { TrendingUp, Calendar, ChevronDown, MoreHorizontal, ShieldCheck } from 'lucide-react';

interface MonthlyData {
  month: string;
  amount: number;
  orders: number;
  heightPercent: number;
  isPeak?: boolean;
}

export const TurnoverChart: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState<string>('Aug');

  const monthlyRecords: MonthlyData[] = [
    { month: 'Mar', amount: 7400, orders: 28, heightPercent: 54 },
    { month: 'Apr', amount: 8100, orders: 31, heightPercent: 62 },
    { month: 'May', amount: 7900, orders: 29, heightPercent: 59 },
    { month: 'Jun', amount: 8800, orders: 34, heightPercent: 72 },
    { month: 'Jul', amount: 9200, orders: 36, heightPercent: 80 },
    { month: 'Aug', amount: 9800, orders: 42, heightPercent: 92, isPeak: true },
  ];

  const activeRecord = monthlyRecords.find((m) => m.month === selectedMonth) || monthlyRecords[5];

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
              <span>MoMo & Bank Verified</span>
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Monthly cash inflows across Mobile Money and merchant ledger channels.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Legend */}
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 mr-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            <span className="font-medium text-slate-600">Trading Revenue</span>
          </div>

          {/* Time range dropdown pill */}
          <div className="inline-flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-700 px-3 py-1.5 rounded-2xl text-xs font-semibold transition cursor-pointer">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>6-Month Audit</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </div>

          <button className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Summary Stat & Active Highlight Pill */}
      <div className="flex flex-wrap items-baseline gap-3 mb-6">
        <div className="text-3xl font-black text-slate-900 tabular-nums tracking-tight">
          GH₵ {activeRecord.amount.toLocaleString()}
        </div>
        <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          <span>+18.4% vs March baseline</span>
        </div>
        <div className="text-xs text-slate-400 ml-auto hidden sm:block">
          Avg daily orders: <strong className="text-slate-700 font-semibold">{activeRecord.orders} orders/day</strong> in {activeRecord.month}
        </div>
      </div>

      {/* Vertical Pill Bar Chart (matching Oripio/Quixotic) */}
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
                    GH₵ {rec.amount.toLocaleString()}
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
          <strong className="text-slate-700">6 Months unbroken MoMo statement history</strong>
        </div>
        <div className="text-emerald-700 font-medium">
          Zero negative cash dips in last 90 days
        </div>
      </div>
    </div>
  );
};
