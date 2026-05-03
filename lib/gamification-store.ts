import 'server-only';

import { promises as fs } from 'fs';
import path from 'path';
import {
  ACHIEVEMENT_DEFINITIONS,
  type Achievement,
  type AchievementId,
  type Application,
  type GamificationState,
  type StreakData,
  type WeeklyGoal,
} from './types';

const DATA_FILE = path.join(process.cwd(), 'data', 'gamification.json');

function getTodayDate(): string {
  const date = new Date();
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function getWeekStart(dateStr: string): string {
  const date = new Date(dateStr);
  const dayOfWeek = date.getDay();
  const weekStart = new Date(date);
  weekStart.setDate(date.getDate() - dayOfWeek);
  return weekStart.toISOString().slice(0, 10);
}

function isYesterday(dateStr: string): boolean {
  const today = getTodayDate();
  const todayDate = new Date(today);
  const targetDate = new Date(dateStr);
  const diffTime = todayDate.getTime() - targetDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays === 1;
}

function isToday(dateStr: string): boolean {
  return dateStr === getTodayDate();
}

function createDefaultGamificationState(): GamificationState {
  return {
    achievements: ACHIEVEMENT_DEFINITIONS.map((def) => ({
      ...def,
      unlockedAt: null,
    })),
    streak: {
      current: 0,
      longest: 0,
      lastApplicationDate: null,
    },
    weeklyGoal: {
      target: 5,
      currentWeekStart: getWeekStart(getTodayDate()),
      completed: 0,
    },
  };
}

function normalizeGamificationState(value: unknown): GamificationState {
  if (!value || typeof value !== 'object') {
    return createDefaultGamificationState();
  }

  const state = value as Partial<GamificationState>;

  const achievements: Achievement[] = ACHIEVEMENT_DEFINITIONS.map((def) => {
    const existing = Array.isArray(state.achievements)
      ? state.achievements.find((a: { id?: string }) => a.id === def.id)
      : null;
    return {
      ...def,
      unlockedAt: existing?.unlockedAt ?? null,
    };
  });

  const streakRaw = state.streak;
  const streak: StreakData = {
    current: typeof streakRaw?.current === 'number' ? streakRaw.current : 0,
    longest: typeof streakRaw?.longest === 'number' ? streakRaw.longest : 0,
    lastApplicationDate: typeof streakRaw?.lastApplicationDate === 'string' ? streakRaw.lastApplicationDate : null,
  };

  const goalRaw = state.weeklyGoal;
  const currentWeekStart = getWeekStart(getTodayDate());
  const weeklyGoal: WeeklyGoal = {
    target: typeof goalRaw?.target === 'number' && goalRaw.target > 0 ? goalRaw.target : 5,
    currentWeekStart: typeof goalRaw?.currentWeekStart === 'string' ? goalRaw.currentWeekStart : currentWeekStart,
    completed: typeof goalRaw?.completed === 'number' ? goalRaw.completed : 0,
  };

  if (weeklyGoal.currentWeekStart !== currentWeekStart) {
    weeklyGoal.currentWeekStart = currentWeekStart;
    weeklyGoal.completed = 0;
  }

  return { achievements, streak, weeklyGoal };
}

async function readJsonFile(): Promise<GamificationState> {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw) as unknown;
    return normalizeGamificationState(parsed);
  } catch {
    return createDefaultGamificationState();
  }
}

async function writeJsonFile(state: GamificationState): Promise<void> {
  await fs.writeFile(DATA_FILE, `${JSON.stringify(state, null, 2)}\n`, 'utf8');
}

export async function getGamificationState(): Promise<GamificationState> {
  return readJsonFile();
}

function unlockAchievement(state: GamificationState, id: AchievementId, newAchievements: AchievementId[]): void {
  if (!newAchievements.includes(id) && !state.achievements.find((a) => a.id === id)?.unlockedAt) {
    const achievement = state.achievements.find((a) => a.id === id);
    if (achievement) {
      achievement.unlockedAt = new Date().toISOString();
      newAchievements.push(id);
    }
  }
}

export async function processNewApplication(application: Application, allApplications: Application[]): Promise<{ newAchievements: AchievementId[] }> {
  const state = await readJsonFile();
  const newAchievements: AchievementId[] = [];

  // Update streak
  if (!state.streak.lastApplicationDate) {
    state.streak.current = 1;
  } else if (!isToday(state.streak.lastApplicationDate) && isYesterday(state.streak.lastApplicationDate)) {
    state.streak.current += 1;
  } else if (!isToday(state.streak.lastApplicationDate)) {
    state.streak.current = 1;
  }

  const effectiveDate = application.applicationDate || getTodayDate();
  if (!state.streak.lastApplicationDate || effectiveDate > state.streak.lastApplicationDate) {
    state.streak.lastApplicationDate = effectiveDate;
  }
  state.streak.longest = Math.max(state.streak.longest, state.streak.current);

  // Streak achievements
  const streakThresholds: Array<{ id: AchievementId; threshold: number }> = [
    { id: 'three_day_streak', threshold: 3 },
    { id: 'seven_day_streak', threshold: 7 },
    { id: 'fourteen_day_streak', threshold: 14 },
    { id: 'thirty_day_streak', threshold: 30 },
  ];

  for (const { id, threshold } of streakThresholds) {
    if (state.streak.current >= threshold) {
      unlockAchievement(state, id, newAchievements);
    }
  }

  // Application count milestones
  const totalApplications = allApplications.length;
  const milestones: Array<{ id: AchievementId; threshold: number }> = [
    { id: 'first_application', threshold: 1 },
    { id: 'five_applications', threshold: 5 },
    { id: 'ten_applications', threshold: 10 },
    { id: 'twenty_five_applications', threshold: 25 },
    { id: 'fifty_applications', threshold: 50 },
  ];

  for (const { id, threshold } of milestones) {
    if (totalApplications >= threshold) {
      unlockAchievement(state, id, newAchievements);
    }
  }

  // First interview achievement
  const hasInterview = allApplications.some((app) => app.status === 'Test Phase');
  if (hasInterview) {
    unlockAchievement(state, 'first_interview', newAchievements);
  }

  // Fast tracker achievement
  const today = getTodayDate();
  for (const app of allApplications) {
    if (app.status === 'Test Phase') {
      const applyDate = new Date(app.applicationDate);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate.getTime() - applyDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays <= 3) {
        unlockAchievement(state, 'fast_tracker', newAchievements);
        break;
      }
    }
  }

  // Weekly goal handling
  const currentWeekStart = getWeekStart(getTodayDate());
  if (state.weeklyGoal.currentWeekStart !== currentWeekStart) {
    if (state.weeklyGoal.completed >= state.weeklyGoal.target) {
      unlockAchievement(state, 'week_warrior', newAchievements);
    }
    state.weeklyGoal.currentWeekStart = currentWeekStart;
    state.weeklyGoal.completed = 0;
  }

  state.weeklyGoal.completed += 1;

  if (state.weeklyGoal.completed >= state.weeklyGoal.target) {
    unlockAchievement(state, 'goal_crusher', newAchievements);
  }

  await writeJsonFile(state);
  return { newAchievements };
}

export async function updateWeeklyGoal(target: number): Promise<WeeklyGoal> {
  const state = await readJsonFile();
  state.weeklyGoal.target = Math.max(1, target);
  await writeJsonFile(state);
  return state.weeklyGoal;
}

export async function saveGamificationState(state: GamificationState): Promise<GamificationState> {
  await writeJsonFile(state);
  return state;
}
