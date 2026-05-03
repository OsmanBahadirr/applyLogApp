"use client";

import type { StreakData } from '@/lib/types';

function getStreakColor(current: number): string {
  if (current >= 30) return 'from-amber-500 to-orange-500';
  if (current >= 14) return 'from-orange-500 to-red-500';
  if (current >= 7) return 'from-emerald-500 to-teal-500';
  if (current >= 3) return 'from-sky-500 to-cyan-500';
  return 'from-slate-400 to-slate-500';
}

function getStreakLabel(current: number): string {
  if (current === 0) return 'Start your streak';
  if (current === 1) return '1 day';
  return `${current} days`;
}

function getNextMilestone(current: number): { label: string; remaining: number } | null {
  if (current < 3) return { label: '3-day streak', remaining: 3 - current };
  if (current < 7) return { label: '7-day streak', remaining: 7 - current };
  if (current < 14) return { label: '14-day streak', remaining: 14 - current };
  if (current < 30) return { label: '30-day streak', remaining: 30 - current };
  return null;
}

export function StreakCounter({ streak }: { streak: StreakData }) {
  const gradient = getStreakColor(streak.current);
  const label = getStreakLabel(streak.current);
  const milestone = getNextMilestone(streak.current);

  return (
    <div className="rounded-3xl border border-[color:var(--theme-border)] bg-[color:var(--theme-card)] p-5 shadow-soft backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} shadow-lg`}>
          <span className="text-lg font-bold uppercase tracking-wider">S</span>
        </div>

        <div className="flex-1">
          <div className="text-xs font-medium uppercase tracking-wide text-[color:var(--theme-text-muted)]">Current Streak</div>
          <div className="text-3xl font-semibold text-[color:var(--theme-text)]">{label}</div>
        </div>

        {streak.longest > 0 && (
          <div className="text-right">
            <div className="text-xs text-[color:var(--theme-text-muted)]">Best</div>
            <div className="text-lg font-semibold text-[color:var(--theme-text)]">{streak.longest}d</div>
          </div>
        )}
      </div>

      {milestone && (
        <div className="mt-3 rounded-xl bg-[color:var(--theme-surface-1)] px-3 py-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[color:var(--theme-text-muted)]">Next: {milestone.label}</span>
            <span className="font-medium text-[color:var(--theme-accent)]">{milestone.remaining}d left</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-[color:var(--theme-border)]">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all duration-500`}
              style={{ width: `${Math.min(100, ((streak.current / (milestone.remaining + streak.current)) * 100))}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
