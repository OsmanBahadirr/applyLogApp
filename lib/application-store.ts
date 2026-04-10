import 'server-only';

import { promises as fs } from 'fs';
import path from 'path';
import type { Application } from './types';

const DATA_FILE = path.join(process.cwd(), 'data', 'applications.json');

function normalizeApplications(applications: Application[]): Application[] {
  let nextId = 1;

  return applications.map((application) => {
    const id = typeof application.id === 'number' && Number.isFinite(application.id) ? application.id : nextId;
    nextId = Math.max(nextId, id + 1);

    return {
      ...application,
      id,
    };
  });
}

async function readJsonFile(): Promise<Application[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? normalizeApplications(parsed as Application[]) : [];
  } catch {
    return [];
  }
}

export async function getApplications(): Promise<Application[]> {
  return readJsonFile();
}

export async function saveApplications(applications: Application[]): Promise<Application[]> {
  const normalized = normalizeApplications(applications);
  await fs.writeFile(DATA_FILE, `${JSON.stringify(normalized, null, 2)}\n`, 'utf8');
  return normalized;
}
