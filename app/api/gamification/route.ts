import { NextResponse } from 'next/server';
import { getGamificationState, saveGamificationState, updateWeeklyGoal } from '@/lib/gamification-store';

export async function GET() {
  const state = await getGamificationState();
  return NextResponse.json(state);
}

export async function PUT(request: Request) {
  const body = await request.json() as { weeklyGoal?: { target?: number } };

  if (body.weeklyGoal?.target !== undefined) {
    const weeklyGoal = await updateWeeklyGoal(body.weeklyGoal.target);
    return NextResponse.json({ weeklyGoal });
  }

  return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
}
