import JobTracker from '@/components/job-tracker';
import { getDashboardState } from '@/lib/application-store';
import { DEFAULT_COLUMNS } from '@/lib/types';
import { ToastProvider } from '@/components/toast';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const { applications, deletedApplications, columns } = await getDashboardState();

  return (
    <ToastProvider>
      <JobTracker
        initialApplications={applications}
        initialDeletedApplications={deletedApplications}
        initialColumns={columns ?? DEFAULT_COLUMNS}
      />
    </ToastProvider>
  );
}
