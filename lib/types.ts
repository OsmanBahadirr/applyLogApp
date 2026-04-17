export type ApplicationStatus =
  | 'Applied'
  | 'Test Phase'
  | 'Interviewing'
  | 'Rejected'
  | 'Accepted'
  | 'No Response';

export type WorkType =
  | 'Bootcamp'
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
  'Test Phase',
  'Interviewing',
  'Rejected',
  'Accepted',
  'No Response',
  
];

export const WORK_TYPE_OPTIONS: WorkType[] = [
  'Bootcamp',
  'Internship',
  'Full-time',
  'Part-time',
];
