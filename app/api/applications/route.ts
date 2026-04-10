import { NextResponse } from 'next/server';
import { getApplications, saveApplications } from '@/lib/application-store';
import type { Application } from '@/lib/types';

export async function GET() {
  return NextResponse.json(await getApplications());
}

export async function PUT(request: Request) {
  const body = (await request.json()) as { applications?: Application[] } | Application[];
  const applications = Array.isArray(body) ? body : body.applications;

  if (!Array.isArray(applications)) {
    return NextResponse.json({ error: 'Invalid applications payload' }, { status: 400 });
  }

  await saveApplications(applications);
  return NextResponse.json({ ok: true });
}
