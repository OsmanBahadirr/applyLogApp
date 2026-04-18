export type ApplicationStatus =
  | 'Applied'
  | 'Test Phase'
  | 'Interviewing'
  | 'Rejected'
  | 'Accepted'
  | 'No Response';

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
  'Interviewing',
  'Rejected',
  'Accepted',
  'No Response',
  
];

export const WORK_TYPE_OPTIONS: WorkType[] = [
  'Full-time',
  'Part-time',
  'Internship',
  'Bootcamp',
];
