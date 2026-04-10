import JobTracker from '@/components/job-tracker';
import { getApplications } from '@/lib/application-store';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const applications = await getApplications();

  return <JobTracker initialApplications={applications} />;
}
