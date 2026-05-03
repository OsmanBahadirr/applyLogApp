"use client";

import { useState } from 'react';
import type { Achievement } from '@/lib/types';

function AchievementBadgeCard({ achievement, size = 'normal' }: { achievement: Achievement; size?: 'small' | 'normal' }) {
  const isUnlocked = achievement.unlockedAt !== null;

  if (size === 'small') {
    return (
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-xl border text-xl transition ${
          isUnlocked
            ? 'border-amber-200 bg-amber-50 dark:border-amber-700 dark:bg-amber-950'
            : 'border-[color:var(--theme-border)] bg-[color:var(--theme-surface-1)] opacity-40 grayscale'
        }`}
        title={`${achievement.title}${isUnlocked ? '' : ' (Locked)'}`}
      >
        {achievement.icon}
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border p-4 transition ${
        isUnlocked
          ? 'border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 dark:border-amber-700 dark:from-amber-950 dark:to-yellow-950'
          : 'border-[color:var(--theme-border)] bg-[color:var(--theme-surface-1)]'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl ${
            isUnlocked
              ? 'bg-amber-100 dark:bg-amber-900'
              : 'opacity-40 grayscale'
          }`}
        >
          {achievement.icon}
        </div>

        <div className="min-w-0">
          <div className={`text-sm font-semibold ${isUnlocked ? 'text-amber-900 dark:text-amber-100' : 'text-[color:var(--theme-text-muted)]'}`}>
            {achievement.title}
          </div>
          <div className="mt-0.5 text-xs text-[color:var(--theme-text-muted)]">{achievement.description}</div>
          {isUnlocked && achievement.unlockedAt && (
            <div className="mt-1 text-[10px] text-amber-600 dark:text-amber-400">
              Unlocked {new Date(achievement.unlockedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function AchievementPanel({ achievements }: { achievements: Achievement[] }) {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const unlockedCount = achievements.filter((a) => a.unlockedAt !== null).length;
  const totalCount = achievements.length;
  const progressPercent = Math.round((unlockedCount / totalCount) * 100);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsPanelOpen(true)}
        className="rounded-3xl border border-[color:var(--theme-border)] bg-[color:var(--theme-card)] px-5 py-4 shadow-soft backdrop-blur-sm transition hover:bg-[color:var(--theme-surface-1)]"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-400 shadow-md">
            <span className="text-lg font-bold uppercase tracking-wider">A</span>
          </div>

          <div className="text-left">
            <div className="text-xs font-medium uppercase tracking-wide text-[color:var(--theme-text-muted)]">Achievements</div>
            <div className="text-lg font-semibold text-[color:var(--theme-text)]">
              {unlockedCount} / {totalCount}
            </div>
          </div>

          <div className="ml-auto hidden sm:block">
            <div className="h-2 w-24 overflow-hidden rounded-full bg-[color:var(--theme-border)]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </button>

      {isPanelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[color:var(--theme-overlay)] px-4 py-6 backdrop-blur-sm" onClick={() => setIsPanelOpen(false)}>
          <div className="w-full max-w-2xl rounded-3xl bg-[color:var(--theme-card-strong)] p-6 shadow-2xl shadow-slate-900/10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-[color:var(--theme-text)]">Achievements</h2>
                <p className="mt-1 text-sm text-[color:var(--theme-text-muted)]">
                  {unlockedCount} of {totalCount} unlocked ({progressPercent}%)
                </p>
              </div>
              <button onClick={() => setIsPanelOpen(false)} className="rounded-full px-3 py-1.5 text-sm text-[color:var(--theme-text-muted)] hover:bg-[color:var(--theme-surface-1)]">
                Close
              </button>
            </div>

            <div className="mt-4 h-3 overflow-hidden rounded-full bg-[color:var(--theme-border)]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {achievements.map((achievement) => (
                <AchievementBadgeCard key={achievement.id} achievement={achievement} />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function AchievementToast({ achievements, onClose }: { achievements: Achievement[]; onClose: () => void }) {
  if (achievements.length === 0) return null;

  return (
    <div className="pointer-events-auto rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 px-5 py-4 shadow-lg shadow-amber-200/30 dark:border-amber-700 dark:from-amber-950 dark:to-yellow-950 dark:shadow-amber-900/20 animate-snackbar-in">
      <div className="flex items-start gap-3">
        <span className="text-lg font-bold uppercase tracking-wider">A</span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
            {achievements.length === 1 ? 'Achievement Unlocked!' : `${achievements.length} Achievements Unlocked!`}
          </p>
          <div className="mt-1 space-y-1">
            {achievements.map((a) => (
              <div key={a.id} className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-300">
                <span>{a.icon}</span>
                <span className="font-medium">{a.title}</span>
              </div>
            ))}
          </div>
        </div>
        <button onClick={onClose} className="text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200">
          ✕
        </button>
      </div>
    </div>
  );
}
