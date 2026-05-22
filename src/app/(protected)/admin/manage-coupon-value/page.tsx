import ComponentCard from '@/components/ComponentCard';
import CouponTable from '@/components/CouponTable';
import CouponValueTable from '@/components/CouponValueTable';
import PageBreadcrumb from '@/components/PageBreadCrumb';
import { fetchCoupons, fetchCouponValues } from '@/lib/actions/admin';

import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function CouponValuePage() {
  const couponValues = await fetchCouponValues();

  return (
    <div>
      <PageBreadcrumb pageTitle="Manage Coupon Value" />
      <div className="space-y-6">
        <ComponentCard title="Coupon Value">
          <CouponValueTable initialCouponValues={couponValues} />
        </ComponentCard>
      </div>
    </div>
  );
}
