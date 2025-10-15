import ApprovalTable from '@/components/ApprovalTable';
import { getPendingFuelRequestsAdmin } from '@/lib/actions/admin';

import { notFound } from 'next/navigation';

export default async function AdminRequestsPage() {
  const pendingRequests = await getPendingFuelRequestsAdmin();
  if (!pendingRequests) notFound();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Pending Fuel Requests (Admin)</h1>
      <ApprovalTable requests={pendingRequests} />
    </div>
  );
}
