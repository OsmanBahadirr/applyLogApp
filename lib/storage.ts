import seedApplications from '@/data/applications.json';
import type { Application } from './types';

const STORAGE_KEY = 'jobcodex.applications';

function getTodayDate() {
  const date = new Date();
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function normalizeApplications(applications: Application[]): Application[] {
  return applications.map((application, index) => ({
    ...application,
    id: typeof application.id === 'number' ? application.id : index + 1,
    applicationDate: typeof application.applicationDate === 'string' && application.applicationDate ? application.applicationDate : getTodayDate(),
    starred: typeof application.starred === 'boolean' ? application.starred : false,
  }));
}

export function getSeedApplications(): Application[] {
  return normalizeApplications(seedApplications as Application[]);
}

export function loadApplications(): Application[] {
  if (typeof window === 'undefined') return getSeedApplications();

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return getSeedApplications();

    const parsed = JSON.parse(raw) as Application[];
    return Array.isArray(parsed) ? normalizeApplications(parsed) : getSeedApplications();
  } catch {
    return getSeedApplications();
  }
}

export function saveApplications(applications: Application[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
}
