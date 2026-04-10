import type { ApplicationStatus } from '@/lib/types';

const styles: Record<ApplicationStatus, string> = {
  Applied: 'bg-slate-100 text-slate-700 ring-slate-200',
  Interviewing: 'bg-amber-100 text-amber-800 ring-amber-200',
  'Test Phase': 'bg-violet-100 text-violet-800 ring-violet-200',
  Rejected: 'bg-rose-100 text-rose-700 ring-rose-200',
  Accepted: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
  'No Response': 'bg-indigo-100 text-indigo-700 ring-indigo-200',
};

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${styles[status]}`}>
      {status}
    </span>
  );
}
