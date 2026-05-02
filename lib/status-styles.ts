import type { ApplicationStatus } from './types';

const COLOR_MAP: Record<string, { surface: string; badge: string; dot: string }> = {
  sky: {
    surface: 'border-sky-200 bg-sky-50 text-sky-950 dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-100',
    badge: 'bg-sky-100 text-sky-800 ring-sky-200 dark:bg-sky-950 dark:text-sky-200 dark:ring-sky-800',
    dot: 'bg-sky-500 dark:bg-sky-400',
  },
  amber: {
    surface: 'border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-100',
    badge: 'bg-amber-100 text-amber-800 ring-amber-200 dark:bg-amber-950 dark:text-amber-200 dark:ring-amber-800',
    dot: 'bg-amber-500 dark:bg-amber-400',
  },
  violet: {
    surface: 'border-violet-200 bg-violet-50 text-violet-950 dark:border-violet-800 dark:bg-violet-950/60 dark:text-violet-100',
    badge: 'bg-violet-100 text-violet-800 ring-violet-200 dark:bg-violet-950 dark:text-violet-200 dark:ring-violet-800',
    dot: 'bg-violet-500 dark:bg-violet-400',
  },
  rose: {
    surface: 'border-rose-200 bg-rose-50 text-rose-950 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-100',
    badge: 'bg-rose-100 text-rose-700 ring-rose-200 dark:bg-rose-950 dark:text-rose-200 dark:ring-rose-800',
    dot: 'bg-rose-500 dark:bg-rose-400',
  },
  emerald: {
    surface: 'border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-100',
    badge: 'bg-emerald-100 text-emerald-800 ring-emerald-200 dark:bg-emerald-950 dark:text-emerald-200 dark:ring-emerald-800',
    dot: 'bg-emerald-500 dark:bg-emerald-400',
  },
  cyan: {
    surface: 'border-cyan-200 bg-cyan-50 text-cyan-950 dark:border-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-100',
    badge: 'bg-cyan-100 text-cyan-800 ring-cyan-200 dark:bg-cyan-950 dark:text-cyan-200 dark:ring-cyan-800',
    dot: 'bg-cyan-500 dark:bg-cyan-400',
  },
  orange: {
    surface: 'border-orange-200 bg-orange-50 text-orange-950 dark:border-orange-800 dark:bg-orange-950/60 dark:text-orange-100',
    badge: 'bg-orange-100 text-orange-800 ring-orange-200 dark:bg-orange-950 dark:text-orange-200 dark:ring-orange-800',
    dot: 'bg-orange-500 dark:bg-orange-400',
  },
  pink: {
    surface: 'border-pink-200 bg-pink-50 text-pink-950 dark:border-pink-800 dark:bg-pink-950/60 dark:text-pink-100',
    badge: 'bg-pink-100 text-pink-800 ring-pink-200 dark:bg-pink-950 dark:text-pink-200 dark:ring-pink-800',
    dot: 'bg-pink-500 dark:bg-pink-400',
  },
  indigo: {
    surface: 'border-indigo-200 bg-indigo-50 text-indigo-950 dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-100',
    badge: 'bg-indigo-100 text-indigo-800 ring-indigo-200 dark:bg-indigo-950 dark:text-indigo-200 dark:ring-indigo-800',
    dot: 'bg-indigo-500 dark:bg-indigo-400',
  },
  teal: {
    surface: 'border-teal-200 bg-teal-50 text-teal-950 dark:border-teal-800 dark:bg-teal-950/60 dark:text-teal-100',
    badge: 'bg-teal-100 text-teal-800 ring-teal-200 dark:bg-teal-950 dark:text-teal-200 dark:ring-teal-800',
    dot: 'bg-teal-500 dark:bg-teal-400',
  },
};

const DEFAULT_COLOR = 'slate';
const DEFAULT_STYLES = {
  surface: 'border-slate-200 bg-slate-50 text-slate-950 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-100',
  badge: 'bg-slate-100 text-slate-800 ring-slate-200 dark:bg-slate-950 dark:text-slate-200 dark:ring-slate-800',
  dot: 'bg-slate-500 dark:bg-slate-400',
};

export function getColumnStyles(color: string) {
  return COLOR_MAP[color] ?? DEFAULT_STYLES;
}

export const statusSurfaceStyles: Record<ApplicationStatus, string> = {
  Applied: COLOR_MAP.sky.surface,
  'Test Phase': COLOR_MAP.amber.surface,
  'No Response': COLOR_MAP.violet.surface,
  Rejected: COLOR_MAP.rose.surface,
};

export const statusBadgeStyles: Record<ApplicationStatus, string> = {
  Applied: COLOR_MAP.sky.badge,
  'Test Phase': COLOR_MAP.amber.badge,
  'No Response': COLOR_MAP.violet.badge,
  Rejected: COLOR_MAP.rose.badge,
};

export const statusDotStyles: Record<ApplicationStatus, string> = {
  Applied: COLOR_MAP.sky.dot,
  'Test Phase': COLOR_MAP.amber.dot,
  'No Response': COLOR_MAP.violet.dot,
  Rejected: COLOR_MAP.rose.dot,
};
