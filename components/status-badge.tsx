import type { ApplicationStatus } from '@/lib/types';
import { statusBadgeStyles } from '@/lib/status-styles';

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeStyles[status]}`}>
      {status}
    </span>
  );
}
