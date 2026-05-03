export type ApplicationStatus =
  | 'Applied'
  | 'Test Phase'
  | 'No Response'
  | 'Rejected'
  | string;

export type WorkType =
  | 'Full-time'
  | 'Part-time'
  | 'Internship'
  | 'Bootcamp';

export type KanbanColumn = {
  id: string;
  label: string;
  description: string;
  color: string;
  isDefault: boolean;
};

export type Application = {
  id: number;
  company: string;
  program: string;
  workType: WorkType;
  status: ApplicationStatus;
  applicationDate: string;
  starred: boolean;
  notes: string;
};

export type DashboardState = {
  applications: Application[];
  deletedApplications: Application[];
  columns?: KanbanColumn[];
};

export const DEFAULT_COLUMNS: KanbanColumn[] = [
  { id: 'Applied', label: 'Applied', description: 'Applications sent and awaiting the next step.', color: 'sky', isDefault: true },
  { id: 'Test Phase', label: 'Test Phase', description: 'Assignments, exams, and screening steps in progress.', color: 'amber', isDefault: true },
  { id: 'No Response', label: 'No Response', description: 'Applications that have gone quiet with no follow-up yet.', color: 'violet', isDefault: true },
  { id: 'Rejected', label: 'Rejected', description: 'Closed out or declined applications.', color: 'rose', isDefault: true },
];

export const STATUS_OPTIONS: ApplicationStatus[] = [
  'Applied',
  'Test Phase',
  'No Response',
  'Rejected',
];

export const WORK_TYPE_OPTIONS: WorkType[] = [
  'Full-time',
  'Part-time',
  'Internship',
  'Bootcamp',
];

export const COLOR_OPTIONS = [
  { value: 'sky', label: 'Sky', preview: 'bg-sky-500' },
  { value: 'amber', label: 'Amber', preview: 'bg-amber-500' },
  { value: 'violet', label: 'Violet', preview: 'bg-violet-500' },
  { value: 'rose', label: 'Rose', preview: 'bg-rose-500' },
  { value: 'emerald', label: 'Emerald', preview: 'bg-emerald-500' },
  { value: 'cyan', label: 'Cyan', preview: 'bg-cyan-500' },
  { value: 'orange', label: 'Orange', preview: 'bg-orange-500' },
  { value: 'pink', label: 'Pink', preview: 'bg-pink-500' },
  { value: 'indigo', label: 'Indigo', preview: 'bg-indigo-500' },
  { value: 'teal', label: 'Teal', preview: 'bg-teal-500' },
];

export const WORK_TYPE_DETAILS: Array<{ type: WorkType; description: string }> = [
  { type: 'Full-time', description: 'Standard 40-hour work week' },
  { type: 'Part-time', description: 'Less than 40 hours per week' },
  { type: 'Internship', description: 'Temporary position for students' },
  { type: 'Bootcamp', description: 'Training program with job placement' },
];

export type AchievementId =
  | 'first_application'
  | 'five_applications'
  | 'ten_applications'
  | 'twenty_five_applications'
  | 'fifty_applications'
  | 'first_interview'
  | 'fast_tracker'
  | 'three_day_streak'
  | 'seven_day_streak'
  | 'fourteen_day_streak'
  | 'thirty_day_streak'
  | 'week_warrior'
  | 'goal_crusher';

export type Achievement = {
  id: AchievementId;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string | null;
};

export type StreakData = {
  current: number;
  longest: number;
  lastApplicationDate: string | null;
};

export type WeeklyGoal = {
  target: number;
  currentWeekStart: string;
  completed: number;
};

export type GamificationState = {
  achievements: Achievement[];
  streak: StreakData;
  weeklyGoal: WeeklyGoal;
};

export const ACHIEVEMENT_DEFINITIONS: Omit<Achievement, 'unlockedAt'>[] = [
  { id: 'first_application', title: 'First Step', description: 'Sent your first application', icon: '»' },
  { id: 'five_applications', title: 'Getting Started', description: 'Sent 5 applications', icon: '¶' },
  { id: 'ten_applications', title: 'Double Digits', description: 'Sent 10 applications', icon: '%' },
  { id: 'twenty_five_applications', title: 'Quarter Century', description: 'Sent 25 applications', icon: '*' },
  { id: 'fifty_applications', title: 'Half Century', description: 'Sent 50 applications', icon: '#' },
  { id: 'first_interview', title: 'First Interview', description: 'Moved your first application to Test Phase', icon: '+' },
  { id: 'fast_tracker', title: 'Fast Tracker', description: 'Moved an application to Test Phase within 3 days of applying', icon: '~' },
  { id: 'three_day_streak', title: '3-Day Streak', description: 'Applied 3 days in a row', icon: '^' },
  { id: 'seven_day_streak', title: 'Week Warrior', description: 'Applied 7 days in a row', icon: '^' },
  { id: 'fourteen_day_streak', title: 'Fortnight Focus', description: 'Applied 14 days in a row', icon: '^' },
  { id: 'thirty_day_streak', title: 'Monthly Machine', description: 'Applied 30 days in a row', icon: '^' },
  { id: 'week_warrior', title: 'Week Warrior', description: 'Completed a weekly goal of 5+ applications', icon: '=' },
  { id: 'goal_crusher', title: 'Goal Crusher', description: 'Completed 4 weekly goals in a row', icon: '@' },
];
