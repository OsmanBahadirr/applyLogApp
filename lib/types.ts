export type ApplicationStatus =
  | 'Submitted'
  | 'Interview'
  | 'Offer'
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
  'Submitted',
  'Interview',
  'Offer',
  'Rejected',
];

export const WORK_TYPE_OPTIONS: WorkType[] = [
  'Full-time',
  'Part-time',
  'Internship',
  'Bootcamp',
];
