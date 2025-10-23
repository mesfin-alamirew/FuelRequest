// src/app/admin/manage-vehicles/_components/AddVehicleForm.tsx
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { toast } from 'react-toastify';
import { createVehicle } from '@/lib/actions/admin';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { FuelTypeEnum } from '@prisma/client';
import { useActionState } from 'react';

type FormState = { success?: boolean; error?: string } | null;

export default function AddVehicleForm({
  onVehicleAdded,
}: {
  onVehicleAdded: () => Promise<void>;
}) {
  const [state, formAction] = useActionState<FormState, FormData>(
    async (_previousState, formData) => {
      try {
        await createVehicle(formData);
        toast.success('Vehicle created successfully!');
        await onVehicleAdded();
        return { success: true };
      } catch (error: unknown) {
        let errorMessage = 'Failed to create vehicle.';
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
      <h2 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
        Add New Vehicle
      </h2>

      <Input
        name="plate"
        placeholder="Plate Number"
        required
        className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-2 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 "
      />
      <Select
        name="fuelType"
        required
        className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-2 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
      >
        <option value="">Select Fuel Type</option>
        {Object.values(FuelTypeEnum).map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </Select>
      <Input
        name="lastOdometer"
        type="number"
        placeholder="Last Odometer Reading"
        required
        className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-2 pr-2 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 "
      />
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center gap-2 rounded-lg transition px-4 py-3 text-sm bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300"
        // className={`px-6 py-2 text-sm font-medium rounded-md text-white transition-colors ${
        //   pending ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'
        // }`}
      >
        {pending ? 'Adding...' : 'Add Vehicle'}
      </button>
    </form>
  );
}
