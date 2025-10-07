'use client';

import React, { useActionState } from 'react';
import {
  createFuelRequest,
  fetchDrivers,
  FormAndActionState,
} from '@/lib/actions/requests';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { toast } from 'react-toastify';
import { useFormState, useFormStatus } from 'react-dom';
import type { Driver } from '@prisma/client';

type FormState = {
  success?: boolean;
  message: string;
  error?: string;
} | null;
const initialState: FormAndActionState = {
  message: '',
  errors: {},
};
export default function CreateRequestForm({ drivers }: { drivers: Driver[] }) {
  const [state, formAction, pending] = useActionState<
    FormAndActionState,
    FormData
  >(createFuelRequest, initialState);
  return (
    <form action={formAction} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="plate"
            className="block text-sm font-medium text-gray-700"
          >
            Plate Number
          </label>
          <Input id="plate" name="plate" placeholder="e.g., ABC-123" required />
        </div>
        <div>
          <label
            htmlFor="currentOdometer"
            className="block text-sm font-medium text-gray-700"
          >
            Current Odometer
          </label>
          <Input
            id="currentOdometer"
            name="currentOdometer"
            type="number"
            placeholder="e.g., 12500"
            required
          />
        </div>
      </div>
      <div>
        <label
          htmlFor="driverId"
          className="block text-sm font-medium text-gray-700"
        >
          Driver
        </label>
        <Select id="driverId" name="driverId" required>
          <option value="">Select a driver</option>
          {drivers.map(
            (
              driver // <-- Dynamically populate from props
            ) => (
              <option key={driver.id} value={driver.id}>
                {driver.name}
              </option>
            )
          )}
        </Select>
      </div>
      <div>
        <label
          htmlFor="quantity"
          className="block text-sm font-medium text-gray-700"
        >
          Quantity
        </label>
        <Input
          id="quantity"
          name="quantity"
          type="number"
          placeholder="e.g., 2"
          required
        />
      </div>
      <div className="pt-5">
        <button
          type="submit"
          disabled={pending}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors ${
            pending ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {pending ? 'Submitting...' : 'Submit Request'}
        </button>
      </div>
    </form>
  );
}
