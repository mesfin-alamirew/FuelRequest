// src/app/admin/manage-vehicles/page.tsx
import Layout from '@/components/Layout';
import { fetchVehicles } from '@/lib/actions/admin';

import Search from '@/components/Search';
import VehicleManagementTable from '@/components/VehicleManagementTable';
import PageBreadcrumb from '@/components/PageBreadCrumb';
import ComponentCard from '@/components/ComponentCard';

export default async function ManageVehiclesPage({
  searchParams,
}: {
  searchParams?: { query?: string };
}) {
  const query = searchParams?.query || '';
  const vehicles = await fetchVehicles(query);

  return (
    <div>
      <PageBreadcrumb pageTitle="Manage Vehicles" />
      <div className="space-y-6">
        <ComponentCard title="Vehicles">
          <VehicleManagementTable initialVehicles={vehicles} />
        </ComponentCard>
      </div>
    </div>
  );
}
