import 'server-only';

import { promises as fs } from 'fs';
import path from 'path';
import type { Application, DashboardState } from './types';

const DATA_FILE = path.join(process.cwd(), 'data', 'applications.json');

function normalizeApplications(applications: Application[]): Application[] {
  let nextId = 1;
  const today = new Date();
  const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

  return applications.map((application) => {
    const id = typeof application.id === 'number' && Number.isFinite(application.id) ? application.id : nextId;
    nextId = Math.max(nextId, id + 1);

    return {
      ...application,
      id,
      applicationDate: typeof application.applicationDate === 'string' && application.applicationDate ? application.applicationDate : localToday,
      starred: typeof application.starred === 'boolean' ? application.starred : false,
    };
  });
}

function normalizeDashboardState(value: unknown): DashboardState {
  if (Array.isArray(value)) {
    return {
      applications: normalizeApplications(value as Application[]),
      deletedApplications: [],
    };
  }

  if (value && typeof value === 'object') {
    const state = value as Partial<DashboardState>;
    return {
      applications: Array.isArray(state.applications) ? normalizeApplications(state.applications) : [],
      deletedApplications: Array.isArray(state.deletedApplications) ? normalizeApplications(state.deletedApplications) : [],
    };
  }

  return {
    applications: [],
    deletedApplications: [],
  };
}

async function readJsonFile(): Promise<DashboardState> {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw) as unknown;
    return normalizeDashboardState(parsed);
  } catch {
    return {
      applications: [],
      deletedApplications: [],
    };
  }
}

export async function getApplications(): Promise<Application[]> {
  return (await readJsonFile()).applications;
}

export async function getDashboardState(): Promise<DashboardState> {
  return readJsonFile();
}

export async function saveApplications(applications: Application[]): Promise<Application[]> {
  const normalized = normalizeApplications(applications);
  await fs.writeFile(DATA_FILE, `${JSON.stringify({ applications: normalized, deletedApplications: [] }, null, 2)}\n`, 'utf8');
  return normalized;
}

export async function saveDashboardState(state: DashboardState): Promise<DashboardState> {
  const normalized = {
    applications: normalizeApplications(state.applications),
    deletedApplications: normalizeApplications(state.deletedApplications),
  };

  await fs.writeFile(DATA_FILE, `${JSON.stringify(normalized, null, 2)}\n`, 'utf8');
  return normalized;
}
