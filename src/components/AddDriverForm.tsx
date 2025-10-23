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
    <form
      action={formAction}
      className="space-y-4 border p-4 border-gray-200 rounded-2xl"
    >
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
        Add New Driver
      </h2>
      <Input
        name="name"
        placeholder="Driver Name"
        required
        className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 "
      />

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center gap-2 rounded-lg transition px-4 py-3 text-sm bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300"
        // className={`px-6 py-2 text-sm font-medium rounded-md text-white transition-colors ${
        //   pending ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'
        // }`}
      >
        {pending ? 'Adding...' : 'Add Driver'}
      </button>
    </form>
  );
}
