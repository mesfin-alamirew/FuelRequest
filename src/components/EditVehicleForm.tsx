// src/app/admin/manage-vehicles/_components/EditVehicleForm.tsx
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { toast } from 'react-toastify';
import { updateVehicle } from '@/lib/actions/admin';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { FuelTypeEnum, Vehicle } from '@prisma/client';
import { useActionState } from 'react';

type FormState = { success?: boolean; error?: string } | null;

export default function EditVehicleForm({
  vehicle,
  onCancel,
  onVehicleUpdated,
}: {
  vehicle: Vehicle;
  onCancel: () => void;
  onVehicleUpdated: () => Promise<void>;
}) {
  const [state, formAction] = useActionState<FormState, FormData>(
    async (_previousState, formData) => {
      try {
        await updateVehicle(vehicle.id, formData);
        toast.success('Vehicle updated successfully!');
        await onVehicleUpdated();
        onCancel();
        return { success: true };
      } catch (error: unknown) {
        let errorMessage = 'Failed to update vehicle.';
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
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <h2 className="text-base font-medium text-gray-800 dark:text-white/90">
        Edit Vehicle: {vehicle.plate}
      </h2>
      <form action={formAction} className="space-y-4">
        <Input
          name="plate"
          placeholder="Plate Number"
          defaultValue={vehicle.plate}
          required
          className=" h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3  dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30  bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90  dark:focus:border-brand-800"
        />
        <div className="relative z-20 bg-transparent">
          <Select
            name="fuelType"
            defaultValue={vehicle.fuelType}
            required
            className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pr-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
          >
            {Object.values(FuelTypeEnum).map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
          <span className="pointer-events-none absolute top-1/2 right-4 z-30 -translate-y-1/2 text-gray-500 dark:text-gray-400">
            <svg
              className="stroke-current"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4.79175 7.396L10.0001 12.6043L15.2084 7.396"
                stroke=""
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
            </svg>
          </span>
        </div>
        <Input
          name="lastOdometer"
          type="number"
          placeholder="Last Odometer Reading"
          defaultValue={vehicle.lastOdometer}
          required
          className=" h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3  dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30  bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90  dark:focus:border-brand-800"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center justify-center gap-2 rounded-lg transition px-4 py-3 text-sm bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300"
            // className={`px-6 py-2 text-sm font-medium rounded-md text-white transition-colors ${
            //   pending ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'
            // }`}
          >
            {pending ? 'Updating...' : 'Update Vehicle'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center justify-center gap-2 rounded-lg transition px-4 py-3 text-sm bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
