// src/app/admin/manage-drivers/page.tsx

import Search from '@/components/Search';

import { fetchDrivers } from '@/lib/actions/admin';
import DriverManagementTable from '@/components/DriverManagementTable';

export default async function ManageDriversPage({
  searchParams,
}: {
  searchParams?: { query?: string };
}) {
  const query = searchParams?.query || '';
  const drivers = await fetchDrivers(query);

  return (
    <div className="m-6 flex flex-col gap-2">
      <h1 className="text-2xl font-bold">Manage Vehicles</h1>
      <Search placeholder="Search by name..." />
      <DriverManagementTable initialDrivers={drivers} />
    </div>
  );
}
