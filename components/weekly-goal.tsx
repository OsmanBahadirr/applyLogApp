"use client";

import { useState } from 'react';
import type { WeeklyGoal } from '@/lib/types';

function getWeekDates(weekStart: string): { start: string; end: string } {
  const start = new Date(weekStart);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return {
    start: start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    end: end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  };
}

export function WeeklyGoalWidget({ goal, onUpdate }: { goal: WeeklyGoal; onUpdate: (target: number) => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [targetInput, setTargetInput] = useState(goal.target.toString());
  const progress = Math.min(100, Math.round((goal.completed / goal.target) * 100));
  const weekDates = getWeekDates(goal.currentWeekStart);
  const isComplete = goal.completed >= goal.target;

  const handleSave = () => {
    const newTarget = parseInt(targetInput, 10);
    if (Number.isFinite(newTarget) && newTarget >= 1 && newTarget <= 50) {
      onUpdate(newTarget);
    } else {
      setTargetInput(goal.target.toString());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTargetInput(goal.target.toString());
    setIsEditing(false);
  };

  return (
    <div className="rounded-3xl border border-[color:var(--theme-border)] bg-[color:var(--theme-card)] p-5 shadow-soft backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl shadow-md ${
            isComplete
              ? 'bg-gradient-to-br from-emerald-400 to-green-400'
              : 'bg-gradient-to-br from-sky-400 to-indigo-400'
          }`}>
            <span className="text-lg font-bold uppercase tracking-wider">{isComplete ? 'G' : 'W'}</span>
          </div>

          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-[color:var(--theme-text-muted)]">Weekly Goal</div>
            <div className="text-sm text-[color:var(--theme-text-muted)]">{weekDates.start} - {weekDates.end}</div>
          </div>
        </div>

        {!isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="rounded-lg px-2 py-1 text-xs text-[color:var(--theme-text-muted)] hover:bg-[color:var(--theme-surface-1)]"
          >
            Edit
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="mt-4">
          <label className="mb-2 block text-sm text-[color:var(--theme-text)]">
            Applications per week:
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={50}
              value={targetInput}
              onChange={(e) => setTargetInput(e.target.value)}
              className="w-20 rounded-xl border border-[color:var(--theme-border)] bg-[color:var(--theme-surface-1)] px-3 py-2 text-sm text-[color:var(--theme-text)] outline-none focus:border-[color:var(--theme-focus)] focus:ring-4 focus:ring-[color:var(--theme-accent-soft)]"
            />
            <button
              type="button"
              onClick={handleSave}
              className="rounded-xl bg-[color:var(--theme-accent)] px-3 py-2 text-sm font-medium text-white hover:bg-[color:var(--theme-accent-strong)]"
            >
              Save
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-xl border border-[color:var(--theme-border)] px-3 py-2 text-sm text-[color:var(--theme-text)] hover:bg-[color:var(--theme-surface-1)]"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-semibold text-[color:var(--theme-text)]">
              {goal.completed} / {goal.target} applications
            </span>
            <span className={`font-medium ${isComplete ? 'text-emerald-500' : 'text-[color:var(--theme-accent)]'}`}>
              {progress}%
            </span>
          </div>

          <div className="h-3 overflow-hidden rounded-full bg-[color:var(--theme-border)]">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isComplete
                  ? 'bg-gradient-to-r from-emerald-400 to-green-400'
                  : 'bg-gradient-to-r from-sky-400 to-indigo-400'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>

          {!isComplete && (
            <div className="mt-2 text-xs text-[color:var(--theme-text-muted)]">
              {goal.target - goal.completed} more to reach your goal
            </div>
          )}

          {isComplete && (
            <div className="mt-2 text-xs font-medium text-emerald-500">
              Goal completed! 🎉
            </div>
          )}
        </div>
      )}
    </div>
  );
}
