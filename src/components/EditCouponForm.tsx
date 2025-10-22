'use client';

import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { updateCoupon } from '@/lib/actions/admin'; // We will create this in the next step

// Define types based on your Prisma schema
type Coupon = {
  id: number;
  couponNumber: string;
  priceValue: number;
  isDelivered: boolean;
};

type FormState = {
  message?: string;
  errors?: {
    couponNumber?: string | null;
    priceValue?: string | null;
  };
};

export default function EditCouponForm({ coupon }: { coupon: Coupon }) {
  const router = useRouter();

  const initialState: FormState = {
    message: undefined,
    errors: undefined,
  };

  // We need to bind the `updateCoupon` action with the coupon's ID
  const [formState, formAction] = useActionState(
    updateCoupon.bind(null, coupon.id),
    initialState
  );

  return (
    <form action={formAction} className="space-y-4">
      {formState?.message && (
        <p
          className={`p-2 rounded ${
            formState.message.includes('success')
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {formState.message}
        </p>
      )}

      <div>
        <label
          htmlFor="couponNumber"
          className="block text-sm font-medium text-gray-700"
        >
          Coupon Number
        </label>
        <input
          type="text"
          id="couponNumber"
          name="couponNumber"
          className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pr-4 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden sm:w-[300px] sm:min-w-[300px] dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
          defaultValue={coupon.couponNumber}
          required
        />
        {formState?.errors?.couponNumber && (
          <p className="text-red-500 text-sm mt-1">
            {formState.errors.couponNumber}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="priceValue"
          className="block text-sm font-medium text-gray-700"
        >
          Price Value
        </label>
        <input
          type="number"
          id="priceValue"
          name="priceValue"
          className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pr-4 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden sm:w-[300px] sm:min-w-[300px] dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
          defaultValue={coupon.priceValue}
          required
          step="0.01"
        />
        {formState?.errors?.priceValue && (
          <p className="text-red-500 text-sm mt-1">
            {formState.errors.priceValue}
          </p>
        )}
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isDelivered"
          name="isDelivered"
          defaultChecked={coupon.isDelivered}
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
        <label
          htmlFor="isDelivered"
          className="ml-2 text-sm font-medium text-gray-800 dark:text-gray-200"
        >
          Is Delivered
        </label>
      </div>

      <div className="flex space-x-4">
        <button
          type="submit"
          className="shadow-theme-xs inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-medium text-gray-700 ring-1 ring-gray-300 transition hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03]"
        >
          Update Coupon
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="shadow-theme-xs inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-medium text-gray-700 ring-1 ring-gray-300 transition hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
