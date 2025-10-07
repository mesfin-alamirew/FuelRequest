'use client';

import { useActionState } from 'react';
import { deleteFuelRequest } from '@/lib/actions/requests';

type ActionState = { message?: string; error?: boolean };

export default function DeleteRequestButton({
  requestId,
}: {
  requestId: number;
}) {
  const [deleteState, deleteAction] = useActionState(
    deleteFuelRequest,
    {} as ActionState
  );

  return (
    <form action={deleteAction}>
      <input type="hidden" name="requestId" value={requestId} />
      <button type="submit" className="text-red-600 hover:text-red-900">
        Delete
      </button>
      {deleteState.message && (
        <div
          className={`mt-2 p-2 text-sm rounded ${
            deleteState.error
              ? 'bg-red-100 text-red-700'
              : 'bg-green-100 text-green-700'
          }`}
        >
          {deleteState.message}
        </div>
      )}
    </form>
  );
}
