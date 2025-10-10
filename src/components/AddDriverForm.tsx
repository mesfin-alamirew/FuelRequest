// src/app/admin/manage-vehicles/_components/AddVehicleForm.tsx
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { toast } from 'react-toastify';
import { createDriver, createVehicle } from '@/lib/actions/admin';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { FuelTypeEnum } from '@prisma/client';
import { useActionState } from 'react';

type FormState = { success?: boolean; error?: string } | null;

export default function AddDriverForm({
  onDriverAdded,
}: {
  onDriverAdded: () => Promise<void>;
}) {
  const [state, formAction] = useActionState<FormState, FormData>(
    async (_previousState, formData) => {
      try {
        await createDriver(formData);
        toast.success('Driver created successfully!');
        await onDriverAdded();
        return { success: true };
      } catch (error: unknown) {
        let errorMessage = 'Failed to create driver.';
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
    <div className="bg-white p-6 rounded-lg shadow-md mt-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Add New Driver
      </h2>
      <form action={formAction} className="space-y-4">
        <Input name="name" placeholder="Driver Name" required />

        <button
          type="submit"
          disabled={pending}
          className={`px-6 py-2 text-sm font-medium rounded-md text-white transition-colors ${
            pending ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {pending ? 'Adding...' : 'Add Driver'}
        </button>
      </form>
    </div>
  );
}
