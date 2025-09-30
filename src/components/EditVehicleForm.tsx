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
    <div className="bg-white p-6 rounded-lg shadow-md mt-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Edit Vehicle: {vehicle.plate}
      </h2>
      <form action={formAction} className="space-y-4">
        <Input
          name="plate"
          placeholder="Plate Number"
          defaultValue={vehicle.plate}
          required
        />
        <Select name="fuelType" defaultValue={vehicle.fuelType} required>
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
          defaultValue={vehicle.lastOdometer}
          required
        />
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={pending}
            className={`px-6 py-2 text-sm font-medium rounded-md text-white transition-colors ${
              pending ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {pending ? 'Updating...' : 'Update Vehicle'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
