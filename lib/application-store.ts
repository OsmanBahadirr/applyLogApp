import 'server-only';

import { promises as fs } from 'fs';
import path from 'path';
import { DEFAULT_COLUMNS, type Application, type DashboardState, type KanbanColumn } from './types';

const DATA_FILE = path.join(process.cwd(), 'data', 'applications.json');

function isValidColumn(column: unknown): column is KanbanColumn {
  if (!column || typeof column !== 'object') return false;
  const c = column as Record<string, unknown>;
  return (
    typeof c.id === 'string' &&
    typeof c.label === 'string' &&
    typeof c.description === 'string' &&
    typeof c.color === 'string' &&
    typeof c.isDefault === 'boolean'
  );
}

function normalizeColumns(columns: unknown): KanbanColumn[] {
  if (Array.isArray(columns) && columns.length > 0 && columns.every(isValidColumn)) {
    return columns;
  }
  return DEFAULT_COLUMNS;
}

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
      columns: DEFAULT_COLUMNS,
    };
  }

  if (value && typeof value === 'object') {
    const state = value as Partial<DashboardState>;
    return {
      applications: Array.isArray(state.applications) ? normalizeApplications(state.applications) : [],
      deletedApplications: Array.isArray(state.deletedApplications) ? normalizeApplications(state.deletedApplications) : [],
      columns: normalizeColumns(state.columns),
    };
  }

  return {
    applications: [],
    deletedApplications: [],
    columns: DEFAULT_COLUMNS,
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
      columns: DEFAULT_COLUMNS,
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
  const state = await readJsonFile();
  const normalized = normalizeApplications(applications);
  await fs.writeFile(DATA_FILE, `${JSON.stringify({ applications: normalized, deletedApplications: state.deletedApplications, columns: state.columns }, null, 2)}\n`, 'utf8');
  return normalized;
}

export async function saveDashboardState(state: DashboardState): Promise<DashboardState> {
  const normalized = {
    applications: normalizeApplications(state.applications),
    deletedApplications: normalizeApplications(state.deletedApplications),
    columns: normalizeColumns(state.columns),
  };

  await fs.writeFile(DATA_FILE, `${JSON.stringify(normalized, null, 2)}\n`, 'utf8');
  return normalized;
}
