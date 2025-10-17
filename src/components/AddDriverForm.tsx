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
    <div className=" p-6 rounded-lg shadow-md">
      <h2 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
        Add New Driver
      </h2>
      <form
        action={formAction}
        className="mt-8 space-y-4 border p-4 border-gray-200 rounded-2xl"
      >
        <Input
          name="name"
          placeholder="Driver Name"
          required
          className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 "
        />

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
