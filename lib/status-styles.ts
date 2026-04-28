import type { ApplicationStatus } from './types';

export const statusSurfaceStyles: Record<ApplicationStatus, string> = {
  Applied: 'border-sky-200 bg-sky-50 text-sky-950 dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-100',
  'Test Phase': 'border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-100',
  'No Response': 'border-violet-200 bg-violet-50 text-violet-950 dark:border-violet-800 dark:bg-violet-950/60 dark:text-violet-100',
  Rejected: 'border-rose-200 bg-rose-50 text-rose-950 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-100',
};

export const statusBadgeStyles: Record<ApplicationStatus, string> = {
  Applied: 'bg-sky-100 text-sky-800 ring-sky-200 dark:bg-sky-950 dark:text-sky-200 dark:ring-sky-800',
  'Test Phase': 'bg-amber-100 text-amber-800 ring-amber-200 dark:bg-amber-950 dark:text-amber-200 dark:ring-amber-800',
  'No Response': 'bg-violet-100 text-violet-800 ring-violet-200 dark:bg-violet-950 dark:text-violet-200 dark:ring-violet-800',
  Rejected: 'bg-rose-100 text-rose-700 ring-rose-200 dark:bg-rose-950 dark:text-rose-200 dark:ring-rose-800',
};

export const statusDotStyles: Record<ApplicationStatus, string> = {
  Applied: 'bg-sky-500 dark:bg-sky-400',
  'Test Phase': 'bg-amber-500 dark:bg-amber-400',
  'No Response': 'bg-violet-500 dark:bg-violet-400',
  Rejected: 'bg-rose-500 dark:bg-rose-400',
};
