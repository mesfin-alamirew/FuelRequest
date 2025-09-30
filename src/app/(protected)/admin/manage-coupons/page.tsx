import CouponTable from '@/components/CouponTable';
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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Coupons Dashboard</h1>
      <CouponTable
        key={componentKey} // Add the key here
        initialCoupons={coupons}
        initialPage={currentPage}
        totalPages={totalPages}
      />
    </div>
  );
}
