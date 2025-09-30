// src/app/(protected)/store/ApproveRequestForm.tsx
'use client';

import { useActionState } from 'react';
import { updateRequestStatus, FormState } from '@/lib/actions/requests';

const initialState: FormState = {
  message: '',
  errors: {},
};

export default function ApproveRequestForm({
  requestId,
}: {
  requestId: number;
}) {
  const [state, formAction, isPending] = useActionState(
    updateRequestStatus,
    initialState
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="requestId" value={requestId} />
      <button
        type="submit"
        disabled={isPending}
        className="bg-green-600 text-white py-1 px-3 rounded-md text-sm disabled:opacity-50"
      >
        {isPending ? 'Processing...' : 'Approve & Deliver'}
      </button>
      {/* Optional: Display success/error message */}
      {state.message && <p className="text-sm mt-1">{state.message}</p>}
    </form>
  );
}
