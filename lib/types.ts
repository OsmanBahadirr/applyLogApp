export type ApplicationStatus =
  | 'Applied'
  | 'Test Phase'
  | 'No Response'
  | 'Rejected';

export type WorkType =
  | 'Full-time'
  | 'Part-time'
  | 'Internship'
  | 'Bootcamp';

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
};

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

export const WORK_TYPE_DETAILS: Array<{ type: WorkType; description: string }> = [
  { type: 'Full-time', description: 'Standard 40-hour work week' },
  { type: 'Part-time', description: 'Less than 40 hours per week' },
  { type: 'Internship', description: 'Temporary position for students' },
  { type: 'Bootcamp', description: 'Training program with job placement' },
];
