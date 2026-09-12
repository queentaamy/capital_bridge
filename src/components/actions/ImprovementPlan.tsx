import React from 'react';
import {
  CheckCircle,
  Clock,
  Circle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import type { ImprovementAction } from '../../types';

interface ImprovementPlanProps {
  actions: ImprovementAction[];
  onToggleStatus: (actionId: string) => void;
  onNavigateToSimulator?: () => void;
}

export const ImprovementPlan: React.FC<ImprovementPlanProps> = ({
  actions,
  onToggleStatus,
  onNavigateToSimulator,
}) => {
  const totalPotentialGain = actions
    .filter((a) => a.status !== 'completed')
    .reduce((sum, a) => sum + a.estimatedPointGain, 0);

  const completedCount = actions.filter((a) => a.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-50/90 via-white to-teal-50/60 border border-emerald-200/80 rounded-3xl p-6 sm:p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Targeted Readiness Boost</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Personalized Improvement Action Plan
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl leading-relaxed">
            Prioritized actions designed to systematically eliminate documentation and cash-flow gaps.
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0 bg-white border border-slate-200/80 p-4 sm:p-5 rounded-2xl shadow-xs">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Total Potential Gain</div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-700 tabular-nums">
              +{totalPotentialGain} PTS
            </div>
          </div>
          <div className="h-8 w-[1px] bg-slate-200" />
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Completed</div>
            <div className="text-sm font-bold text-slate-800 tabular-nums">
              {completedCount} / {actions.length} Tasks
            </div>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {actions.map((action) => {
          const isDone = action.status === 'completed';
          const isProgress = action.status === 'in_progress';

          return (
            <div
              key={action.id}
              className={`border rounded-3xl p-5 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs ${
                isDone
                  ? 'bg-slate-50/60 border-slate-200/60 opacity-60'
                  : 'bg-white border-slate-200/80 hover:border-emerald-300 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.02)]'
              }`}
            >
              <div className="flex items-start gap-3.5">
                {/* Status Toggle Button */}
                <button
                  onClick={() => onToggleStatus(action.id)}
                  title="Click to toggle status"
                  className="mt-0.5 text-slate-400 hover:text-emerald-600 transition shrink-0"
                >
                  {isDone ? (
                    <CheckCircle className="w-5 h-5 text-emerald-600 fill-emerald-50" />
                  ) : isProgress ? (
                    <Clock className="w-5 h-5 text-teal-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300 hover:text-slate-400" />
                  )}
                </button>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg border border-slate-200/60">
                      Rank #{action.rank}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        action.priority === 'High'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {action.priority} Priority
                    </span>
                    <span className="text-[10px] font-bold uppercase text-slate-400">
                      {action.category}
                    </span>
                  </div>

                  <h4 className={`text-sm font-bold ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                    {action.title}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-2xl font-medium">
                    {action.rationale}
                  </p>
                </div>
              </div>

              {/* Point Gain Badge & Action */}
              <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Estimated Lift</div>
                  <div className="text-base font-black text-emerald-700 tabular-nums">
                    +{action.estimatedPointGain} pts
                  </div>
                </div>

                {onNavigateToSimulator && !isDone && (
                  <button
                    onClick={onNavigateToSimulator}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl transition shadow-xs"
                    title="Test this improvement in the What-If Simulator"
                  >
                    <span>Simulate</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
