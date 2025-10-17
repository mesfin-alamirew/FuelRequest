import ApprovalTable from '@/components/ApprovalTable';
import ComponentCard from '@/components/ComponentCard';
import PageBreadcrumb from '@/components/PageBreadCrumb';
import { getPendingFuelRequestsAdmin } from '@/lib/actions/admin';

import { notFound } from 'next/navigation';

export default async function AdminRequestsPage() {
  const pendingRequests = await getPendingFuelRequestsAdmin();
  if (!pendingRequests) notFound();

  return (
    <div>
      <PageBreadcrumb pageTitle="Pending Requests" />
      <div className="space-y-6">
        <ComponentCard title="Pending requests waiting for approval ">
          <ApprovalTable requests={pendingRequests} />
        </ComponentCard>
      </div>
    </div>
  );
}
