import { DeletedApplications } from '@/components/deleted-applications';
import { getDashboardState } from '@/lib/application-store';

export const dynamic = 'force-dynamic';

export default async function DeletedPage() {
  const { applications, deletedApplications } = await getDashboardState();

  return <DeletedApplications initialApplications={applications} initialDeletedApplications={deletedApplications} />;
}
