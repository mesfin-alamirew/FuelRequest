// src/app/(protected)/admin/BalanceTopUpForm.tsx
'use client';

import { useActionState } from 'react';
import { topUpBalance, FormState } from '@/lib/actions/admin';

const initialState: FormState = {
  message: '',
  errors: {},
};

export default function BalanceTopUpForm() {
  const [state, formAction, isPending] = useActionState(
    topUpBalance,
    initialState
  );

  return (
    <form
      action={formAction}
      className="p-6 border rounded-lg text-gray-800 dark:text-white/90"
    >
      <h3 className="text-xl font-semibold mb-4">Add Funds to Balance</h3>
      <div className="flex flex-col mb-4">
        <label htmlFor="amount" className="mb-1">
          Amount to Add
        </label>
        <input
          type="number"
          id="amount"
          name="amount"
          step="0.01"
          className="border p-2 rounded-md"
          required
        />
        {(state?.errors?.amount?.length ?? 0) > 0 && (
          <p className="text-red-500 text-sm mt-1">{state?.errors?.amount}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center justify-center gap-2 rounded-lg transition px-4 py-3 text-sm bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300"
      >
        {isPending ? 'Processing...' : 'Add Funds'}
      </button>
      {state.message && (
        <p
          className={`mt-4 text-sm ${
            state.errors ? 'text-red-500' : 'text-green-600'
          }`}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
