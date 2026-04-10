export type ApplicationStatus =
  | 'Applied'
  | 'Interviewing'
  | 'Rejected'
  | 'Accepted'
  | 'No Response'
  | 'Test Phase';

export type WorkType =
  | 'Bootcamp'
  | 'On-site'
  | 'Hybrid'
  | 'Remote'
  | 'Internship'
  | 'Full-time'
  | 'Part-time';

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
  'Interviewing',
  'Rejected',
  'Accepted',
  'No Response',
  'Test Phase',
];

export const WORK_TYPE_OPTIONS: WorkType[] = [
  'Bootcamp',
  'On-site',
  'Hybrid',
  'Remote',
  'Internship',
  'Full-time',
  'Part-time',
];
