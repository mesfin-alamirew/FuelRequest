// src/app/admin/manage-vehicles/page.tsx
import Layout from '@/components/Layout';
import { fetchVehicles } from '@/lib/actions/admin';

import Search from '@/components/Search';
import VehicleManagementTable from '@/components/VehicleManagementTable';

export default async function ManageVehiclesPage({
  searchParams,
}: {
  searchParams?: { query?: string };
}) {
  const query = searchParams?.query || '';
  const vehicles = await fetchVehicles(query);

  return (
    <div className="m-6 flex flex-col gap-2">
      <h1 className="text-2xl font-bold">Manage Vehicles</h1>
      <Search placeholder="Search by plate or fuel type..." />
      <VehicleManagementTable initialVehicles={vehicles} />
    </div>
  );
}
