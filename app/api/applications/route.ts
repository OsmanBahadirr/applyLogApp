import { NextResponse } from 'next/server';
import { getDashboardState, saveDashboardState } from '@/lib/application-store';
import type { Application } from '@/lib/types';

export async function GET() {
  return NextResponse.json(await getDashboardState());
}

export async function PUT(request: Request) {
  const body = (await request.json()) as { applications?: Application[]; deletedApplications?: Application[] } | Application[];

  if (Array.isArray(body)) {
    await saveDashboardState({ applications: body, deletedApplications: [] });
    return NextResponse.json({ ok: true });
  }

  const applications = body.applications;
  const deletedApplications = body.deletedApplications ?? [];

  if (!Array.isArray(applications) || !Array.isArray(deletedApplications)) {
    return NextResponse.json({ error: 'Invalid applications payload' }, { status: 400 });
  }

  await saveDashboardState({ applications, deletedApplications });
  return NextResponse.json({ ok: true });
}
