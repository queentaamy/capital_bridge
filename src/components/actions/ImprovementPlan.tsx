import React from 'react';
import {
  CheckCircle,
  Clock,
  Circle,
  Sparkles,
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
}) => {
  const totalPotentialGain = actions
    .filter((a) => a.status !== 'completed')
    .reduce((sum, a) => sum + a.estimatedPointGain, 0);

  const completedCount = actions.filter((a) => a.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Targeted Readiness Boost</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Personalized Improvement Action Plan
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
            Prioritized actions designed to systematically eliminate documentation and cash-flow gaps.
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0 bg-slate-950/60 border border-slate-800 p-4 rounded-xl">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Total Unlocked Potential</div>
            <div className="text-2xl font-black text-emerald-400 tabular-nums">
              +{totalPotentialGain} PTS
            </div>
          </div>
          <div className="h-8 w-[1px] bg-slate-800" />
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Completed</div>
            <div className="text-sm font-bold text-white tabular-nums">
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
              className={`border rounded-2xl p-5 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                isDone
                  ? 'bg-slate-950/40 border-slate-900 opacity-60'
                  : 'bg-slate-900/70 border-slate-800 hover:border-slate-700/80 shadow-sm'
              }`}
            >
              <div className="flex items-start gap-3.5">
                {/* Status Toggle Button */}
                <button
                  onClick={() => onToggleStatus(action.id)}
                  title="Click to toggle status"
                  className="mt-0.5 text-slate-500 hover:text-emerald-400 transition shrink-0"
                >
                  {isDone ? (
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  ) : isProgress ? (
                    <Clock className="w-5 h-5 text-teal-400" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-600" />
                  )}
                </button>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                      Rank #{action.rank}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        action.priority === 'High'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {action.priority} Priority
                    </span>
                    <span className="text-[10px] font-semibold uppercase text-slate-500">
                      {action.category}
                    </span>
                  </div>

                  <h4 className={`text-sm font-bold ${isDone ? 'line-through text-slate-400' : 'text-white'}`}>
                    {action.title}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                    {action.rationale}
                  </p>
                </div>
              </div>

              {/* Point Gain Badge & Action */}
              <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Estimated Lift</div>
                  <div className="text-base font-black text-emerald-400 tabular-nums">
                    +{action.estimatedPointGain} pts
                  </div>
                </div>

                <button
                  onClick={() => onToggleStatus(action.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    isDone
                      ? 'bg-slate-800 text-slate-400 hover:text-white'
                      : isProgress
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 hover:bg-teal-500/30'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                  }`}
                >
                  {isDone ? 'Completed' : isProgress ? 'In Progress' : 'Start Action'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
