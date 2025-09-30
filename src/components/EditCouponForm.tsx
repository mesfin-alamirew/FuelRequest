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
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
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
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
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
          className="ml-2 block text-sm text-gray-900"
        >
          Is Delivered
        </label>
      </div>

      <div className="flex space-x-4">
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Update Coupon
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
