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
    <form action={formAction} className="p-6 border rounded-lg bg-gray-50">
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
        className="bg-blue-600 text-white p-2 rounded-md w-full disabled:opacity-50"
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
