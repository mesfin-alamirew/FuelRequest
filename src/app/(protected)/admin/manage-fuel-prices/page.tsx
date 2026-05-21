// src/app/admin/manage-fuel-prices/page.tsx

import { fetchFuelPrices } from '@/lib/actions/admin';

import PageBreadcrumb from '@/components/PageBreadCrumb';
import ComponentCard from '@/components/ComponentCard';
import FuelPriceManagementTable from '@/components/FuelPriceManagementTable';

export default async function ManageFuelPricesPage({
  searchParams,
}: {
  searchParams?: { query?: string };
}) {
  const params = await searchParams;
  const query = params?.query || '';

  const fuelPrices = await fetchFuelPrices(query);

  return (
    <div>
      <PageBreadcrumb pageTitle="Manage Fuel Prices" />
      <div className="space-y-6">
        <ComponentCard title="Fuel Prices">
          <FuelPriceManagementTable initialFuelPrices={fuelPrices} />
        </ComponentCard>
      </div>
    </div>
  );
}
