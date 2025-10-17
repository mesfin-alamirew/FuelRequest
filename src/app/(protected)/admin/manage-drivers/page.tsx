// src/app/admin/manage-drivers/page.tsx

import Search from '@/components/Search';

import { fetchDrivers } from '@/lib/actions/admin';
import DriverManagementTable from '@/components/DriverManagementTable';
import PageBreadcrumb from '@/components/PageBreadCrumb';
import ComponentCard from '@/components/ComponentCard';

export default async function ManageDriversPage({
  searchParams,
}: {
  searchParams?: { query?: string };
}) {
  const query = searchParams?.query || '';
  const drivers = await fetchDrivers(query);

  return (
    <div>
      <PageBreadcrumb pageTitle="Manage Driver" />
      <div className="space-y-6">
        <ComponentCard title="Drivers">
          <DriverManagementTable initialDrivers={drivers} />
        </ComponentCard>
      </div>
    </div>
  );
}
