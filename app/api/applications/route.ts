import { NextResponse } from 'next/server';
import { getDashboardState, saveDashboardState } from '@/lib/application-store';
import { processNewApplication } from '@/lib/gamification-store';
import { DEFAULT_COLUMNS, STATUS_OPTIONS, WORK_TYPE_OPTIONS, COLOR_OPTIONS, type Application, type ApplicationStatus, type KanbanColumn, type WorkType } from '@/lib/types';

type CreateApplicationPayload = Omit<Application, 'id' | 'starred'>;
type ExistingApplicationResult = {
  exists: boolean;
  application: Application | null;
  deleted: boolean;
};

const statusValues = new Set<string>(STATUS_OPTIONS);
const workTypeValues = new Set<string>(WORK_TYPE_OPTIONS);

function getTodayDate() {
  const date = new Date();
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isValidDateString(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day;
}

function readCreatePayload(body: unknown): { payload: CreateApplicationPayload } | { error: string } {
  if (!isRecord(body)) {
    return { error: 'Application payload must be an object' };
  }

  const company = typeof body.company === 'string' ? body.company.trim() : '';
  const program = typeof body.program === 'string' ? body.program.trim() : '';
  const workType = typeof body.workType === 'string' ? body.workType : '';
  const status = typeof body.status === 'string' ? body.status : '';
  const applicationDate = typeof body.applicationDate === 'string' && body.applicationDate.trim()
    ? body.applicationDate.trim()
    : getTodayDate();
  const notes = body.notes == null ? '' : body.notes;

  if (!company) {
    return { error: 'Company is required' };
  }

  if (!program) {
    return { error: 'Program is required' };
  }

  if (!workTypeValues.has(workType)) {
    return { error: `Work type must be one of: ${WORK_TYPE_OPTIONS.join(', ')}` };
  }

  if (!statusValues.has(status)) {
    return { error: `Status must be one of: ${STATUS_OPTIONS.join(', ')}` };
  }

  if (!isValidDateString(applicationDate)) {
    return { error: 'Application date must use YYYY-MM-DD format' };
  }

  if (applicationDate > getTodayDate()) {
    return { error: 'Application date cannot be in the future' };
  }

  if (typeof notes !== 'string') {
    return { error: 'Notes must be a string' };
  }

  return {
    payload: {
      company,
      program,
      workType: workType as WorkType,
      status: status as ApplicationStatus,
      applicationDate,
      notes,
    },
  };
}

function getNextApplicationId(applications: Application[], deletedApplications: Application[]) {
  return Math.max(
    0,
    ...applications.map((application) => application.id).filter(Number.isFinite),
    ...deletedApplications.map((application) => application.id).filter(Number.isFinite),
  ) + 1;
}

function normalizeLookupValue(value: unknown) {
  return typeof value === 'string'
    ? value.trim().replace(/\s+/g, ' ').toLocaleLowerCase('tr-TR')
    : '';
}

function findExistingApplication(
  applications: Application[],
  deletedApplications: Application[],
  company: string,
  program: string,
): ExistingApplicationResult {
  const companyKey = normalizeLookupValue(company);
  const programKey = normalizeLookupValue(program);
  const matchesApplication = (application: Application) => (
    normalizeLookupValue(application.company) === companyKey
    && normalizeLookupValue(application.program) === programKey
  );

  const activeMatch = applications.find(matchesApplication);

  if (activeMatch) {
    return {
      exists: true,
      application: activeMatch,
      deleted: false,
    };
  }

  const deletedMatch = deletedApplications.find(matchesApplication);

  return {
    exists: Boolean(deletedMatch),
    application: deletedMatch ?? null,
    deleted: Boolean(deletedMatch),
  };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const company = url.searchParams.get('company');
  const program = url.searchParams.get('program');
  const state = await getDashboardState();

  if (company !== null || program !== null) {
    const normalizedCompany = typeof company === 'string' ? company.trim() : '';
    const normalizedProgram = typeof program === 'string' ? program.trim() : '';

    if (!normalizedCompany || !normalizedProgram) {
      return NextResponse.json({ error: 'Company and program are required for application lookup' }, { status: 400 });
    }

    return NextResponse.json(findExistingApplication(
      state.applications,
      state.deletedApplications,
      normalizedCompany,
      normalizedProgram,
    ));
  }

  return NextResponse.json({
    applications: state.applications,
    deletedApplications: state.deletedApplications,
    columns: state.columns ?? DEFAULT_COLUMNS,
  });
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const result = readCreatePayload(body);

  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const state = await getDashboardState();
  const application: Application = {
    id: getNextApplicationId(state.applications, state.deletedApplications),
    starred: false,
    ...result.payload,
  };

  await saveDashboardState({
    applications: [application, ...state.applications],
    deletedApplications: state.deletedApplications,
  });

  const nextApplications = [application, ...state.applications];
  const { newAchievements } = await processNewApplication(application, nextApplications);

  return NextResponse.json({ application, newAchievements }, { status: 201 });
}

export async function PUT(request: Request) {
  const body = (await request.json()) as { applications?: Application[]; deletedApplications?: Application[]; columns?: KanbanColumn[] } | Application[];

  const today = getTodayDate();

  const validateApplications = (apps: Application[]): string | null => {
    for (const app of apps) {
      if (app.applicationDate > today) {
        return `Application date for "${app.company}" cannot be in the future`;
      }
    }
    return null;
  };

  if (Array.isArray(body)) {
    const error = validateApplications(body);
    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }
    const state = await getDashboardState();
    await saveDashboardState({ applications: body, deletedApplications: state.deletedApplications, columns: state.columns });
    return NextResponse.json({ ok: true });
  }

  const applications = body.applications;
  const deletedApplications = body.deletedApplications ?? [];
  const columns = body.columns;

  if (!Array.isArray(applications) || !Array.isArray(deletedApplications)) {
    return NextResponse.json({ error: 'Invalid applications payload' }, { status: 400 });
  }

  const error = validateApplications(applications);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  await saveDashboardState({ applications, deletedApplications, columns });
  return NextResponse.json({ ok: true });
}
