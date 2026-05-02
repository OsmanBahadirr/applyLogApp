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
