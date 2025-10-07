// src/app/(protected)/transport/VehicleRequestForm.tsx
'use client';

import { Vehicle, Driver, Department } from '@prisma/client';
import { ChangeEvent, useActionState, useState } from 'react';
import { createFuelRequest, FormAndActionState } from '@/lib/actions/requests';

const initialState: FormAndActionState = {
  message: '',
  error: false,
  errors: {},
};
interface FormData {
  currentOdometer: number;
  lastOdometer: number;
  difference: number;
  quantity: number;
}
export default function VehicleRequestForm({
  vehicle,
  drivers,
  departments,
  liter,
  couponValue,
}: {
  vehicle: Vehicle;
  drivers: Driver[];
  departments: Department[];
  liter: number;
  couponValue: number;
}) {
  const [state, formAction, isPending] = useActionState(
    createFuelRequest,
    initialState
  );

  const [inputs, setInputs] = useState<FormData>(Object);

  const changeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs((values) => ({ ...values, [name]: value }));
    // setCurrentOM(parseInt(e.target.value));
  };

  return (
    <form action={formAction} className="mt-8 p-6 border rounded-lg bg-gray-50">
      <h2 className="text-sm font-semibold mb-4 text-green-600">
        Create Fuel Request for {vehicle.plate}
      </h2>

      {/* Add a hidden input to pass the vehicle plate */}
      <input type="hidden" name="plate" value={vehicle.plate} />
      {state.message && (
        <div className="p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50">
          {state.message}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div className="flex flex-col">
          <label className="mb-1">Department:</label>
          <select
            name="departmentId"
            className="border p-2 rounded-md"
            required
          >
            {departments.map((dpt) => (
              <option key={dpt.id} value={dpt.id}>
                {dpt.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="mb-1">Driver:</label>
          <select name="driverId" className="border p-2 rounded-md" required>
            {drivers.map((driver) => (
              <option key={driver.id} value={driver.id}>
                {driver.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="mb-1">Last Odometer Reading:</label>
          <input
            onChange={(e) => changeHandler(e)}
            type="text"
            value={vehicle.lastOdometer}
            disabled
            className="border p-2 rounded-md bg-gray-200"
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-1">Current Odometer Reading:</label>
          <input
            type="number"
            name="currentOdometer"
            className="border p-2 rounded-md"
            required
            onChange={(e) => changeHandler(e)}
          />
          {(state?.errors?.currentOdometer?.length ?? 0) > 0 && (
            <p className="text-red-500 text-sm mt-1">
              {state.errors?.currentOdometer}
            </p>
          )}
        </div>
        <div className="flex flex-col">
          <label className="mb-1">OM Difference:</label>
          <input
            type="number"
            name="difference"
            onChange={(e) => changeHandler(e)}
            className="border p-2 rounded-md bg-gray-200"
            value={(inputs.currentOdometer !== undefined
              ? inputs.currentOdometer - vehicle.lastOdometer
              : 0
            ).toString()}
            disabled
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-1">Quantity:</label>
          <input
            type="number"
            name="quantity"
            className="border p-2 rounded-md"
            onChange={(e) => changeHandler(e)}
            required
          />
          {(state?.errors?.quantity?.length ?? 0) > 0 && (
            <p className="text-red-500 text-sm mt-1">
              {state.errors?.quantity}
            </p>
          )}
        </div>

        <div className="flex flex-col">
          <label className="mb-1">Coupon Value:</label>
          <input
            type="number"
            name="CouponValue"
            className="border p-2 rounded-md bg-gray-200"
            value={couponValue}
            disabled
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-1">Total Coupon Value:</label>
          <input
            type="number"
            name="TotalCouponValue"
            className="border p-2 rounded-md bg-gray-200"
            value={(couponValue * inputs.quantity).toString()}
            disabled
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-1">Liters</label>
          <input
            type="text"
            name="liters"
            className="border p-2 rounded-md bg-gray-200"
            defaultValue={liter}
            disabled
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-1">Total Liters</label>
          <input
            type="text"
            name="liters"
            className="border p-2 rounded-md bg-gray-200"
            value={(inputs.quantity !== undefined
              ? liter * inputs.quantity
              : 0
            ).toString()}
            disabled
          />
        </div>
      </div>
      <div className="flex flex-col mt-4">
        <label className="mb-1">Remark</label>
        <textarea
          name="remark"
          placeholder="Put some remark...."
          className="border p-2 rounded-md  w-full"
        />
        {(state?.errors?.remark?.length ?? 0) > 0 && (
          <p className="text-red-500 text-sm mt-1">{state.errors?.remark}</p>
        )}
      </div>
      <SubmitButton isPending={isPending} />
      {/* {state?.message && <p className="text-red-500 mt-4">{state.message}</p>} */}
    </form>
  );
}

function SubmitButton({ isPending }: { isPending: boolean }) {
  return (
    <button
      type="submit"
      disabled={isPending}
      className="bg-green-600 text-white p-2 rounded-md mt-6 w-full disabled:opacity-50"
    >
      {isPending ? 'Creating Request...' : 'Submit Fuel Request'}
    </button>
  );
}
