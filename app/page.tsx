import JobTracker from '@/components/job-tracker';
import { getDashboardState } from '@/lib/application-store';
import { ToastProvider } from '@/components/toast';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const { applications, deletedApplications } = await getDashboardState();

  return (
    <ToastProvider>
      <JobTracker initialApplications={applications} initialDeletedApplications={deletedApplications} />
    </ToastProvider>
  );
}
