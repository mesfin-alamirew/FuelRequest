import ComponentCard from '@/components/ComponentCard';
import CouponTable from '@/components/CouponTable';
import PageBreadcrumb from '@/components/PageBreadCrumb';
import { fetchCoupons } from '@/lib/actions/admin';

import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function CouponsPage({
  searchParams,
}: {
  searchParams: { page?: string; query?: string };
}) {
  const currentPage = Number(searchParams.page) || 1;
  const searchQuery = searchParams.query || '';
  const couponsPerPage = 10;

  const { coupons, totalPages } = await fetchCoupons(
    searchQuery,
    currentPage,
    couponsPerPage
  );

  // Create a unique key that changes with the search query
  const componentKey = `${currentPage}-${searchQuery}`;

  return (
    <div>
      <PageBreadcrumb pageTitle="Manage Coupons" />
      <div className="space-y-6">
        <ComponentCard title="Coupons">
          <CouponTable
            key={componentKey} // Add the key here
            initialCoupons={coupons}
            initialPage={currentPage}
            totalPages={totalPages}
          />
        </ComponentCard>
      </div>
    </div>
  );
}
