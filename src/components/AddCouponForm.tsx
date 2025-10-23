'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { toast } from 'react-toastify';
import { createCoupon } from '@/lib/actions/admin';
import { Input } from '@/components/ui/Input';

type FormState = {
  success?: boolean;
  error?: string;
} | null;

export default function AddCouponForm({
  onCouponAdded,
}: {
  onCouponAdded: () => Promise<void>;
}) {
  // <-- Change: Prop type is now `async`
  const [state, formAction] = useActionState<FormState, FormData>(
    async (_previousState: FormState, formData: FormData) => {
      try {
        await createCoupon(formData);
        toast.success('Coupon created successfully!');
        await onCouponAdded(); // <-- This now correctly awaits an async function
        return { success: true };
      } catch (error: unknown) {
        let errorMessage = 'Failed to create coupon.';
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        toast.error(errorMessage);
        return { error: errorMessage };
      }
    },
    null
  );

  const { pending } = useFormStatus();

  return (
    <form
      action={formAction}
      className="space-y-4 border p-4 border-gray-200 rounded-2xl"
    >
      {state?.error && (
        <div className="p-4 rounded-md bg-red-100 text-red-700">
          {state.error}
        </div>
      )}
      <h2 className="text-xl font-semibold text-gray-800">Add New Coupon</h2>
      <div className="flex gap-4">
        <div className="flex-1">
          <label htmlFor="couponNumber" className="sr-only">
            Coupon Number
          </label>
          <Input
            id="couponNumber"
            name="couponNumber"
            placeholder="Coupon Number"
            required
            className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 "
          />
        </div>
        <div className="flex-1">
          <label htmlFor="priceValue" className="sr-only">
            Price Value
          </label>
          <Input
            id="priceValue"
            name="priceValue"
            type="number"
            placeholder="Price Value"
            required
            className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 "
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center gap-2 rounded-lg transition px-4 py-3 text-sm bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300"
          // className={`px-6 py-2 text-sm font-medium rounded-md text-white transition-colors ${
          //   pending ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'
          // }`}
        >
          {pending ? 'Adding...' : 'Add Coupon'}
        </button>
      </div>
    </form>
  );
}
