import { notFound } from 'next/navigation';

import { getCouponById } from '@/lib/actions/admin';
import EditCouponForm from '@/components/EditCouponForm';

export default async function EditCouponPage({
  params,
}: {
  params: { id: string };
}) {
  const couponId = parseInt(params.id, 10);

  if (isNaN(couponId)) {
    notFound(); // Handle invalid ID format
  }

  const coupon = await getCouponById(couponId);

  if (!coupon) {
    notFound(); // Handle coupon not found
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-base font-medium text-gray-800 dark:text-white/90 mb-4">
        Edit Coupon
      </h1>
      <EditCouponForm coupon={coupon} />
    </div>
  );
}
