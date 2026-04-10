import JobTracker from '@/components/job-tracker';
import { getDashboardState } from '@/lib/application-store';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const { applications, deletedApplications } = await getDashboardState();

  return <JobTracker initialApplications={applications} initialDeletedApplications={deletedApplications} />;
}
