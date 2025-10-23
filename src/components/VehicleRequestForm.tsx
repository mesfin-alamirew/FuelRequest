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
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <form
        action={formAction}
        className="space-y-6 border-t border-gray-100 p-5 sm:p-6 dark:border-gray-800"
      >
        <h2 className="text-base font-medium text-gray-800 dark:text-white/90">
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
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Department:
            </label>
            <select
              name="departmentId"
              className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
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
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Driver:
            </label>
            <select
              name="driverId"
              className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
              required
            >
              {drivers.map((driver) => (
                <option key={driver.id} value={driver.id}>
                  {driver.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Last Odometer Reading:
            </label>
            <input
              onChange={(e) => changeHandler(e)}
              type="text"
              value={vehicle.lastOdometer}
              disabled
              className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Current Odometer Reading:
            </label>
            <input
              type="number"
              name="currentOdometer"
              min={0}
              className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
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
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              OM Difference:
            </label>
            <input
              type="number"
              name="difference"
              onChange={(e) => changeHandler(e)}
              className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
              value={(inputs.currentOdometer !== undefined
                ? inputs.currentOdometer - vehicle.lastOdometer
                : 0
              ).toString()}
              disabled
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Quantity:
            </label>
            <input
              type="number"
              name="quantity"
              min={1}
              className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
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
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Coupon Value:
            </label>
            <input
              type="number"
              name="CouponValue"
              className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
              value={couponValue}
              disabled
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Total Coupon Value:
            </label>
            <input
              type="number"
              name="TotalCouponValue"
              className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
              value={(couponValue * inputs.quantity).toString()}
              disabled
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Liters
            </label>
            <input
              type="text"
              name="liters"
              className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
              defaultValue={liter}
              disabled
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Total Liters
            </label>
            <input
              type="text"
              name="liters"
              className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
              value={(inputs.quantity !== undefined
                ? liter * inputs.quantity
                : 0
              ).toString()}
              disabled
            />
          </div>
        </div>
        <div className="flex flex-col mt-4">
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
            Remark
          </label>
          <textarea
            name="remark"
            placeholder="Put some remark...."
            className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
          />
          {(state?.errors?.remark?.length ?? 0) > 0 && (
            <p className="text-red-500 text-sm mt-1">{state.errors?.remark}</p>
          )}
        </div>
        <SubmitButton isPending={isPending} />
        {/* {state?.message && <p className="text-red-500 mt-4">{state.message}</p>} */}
      </form>
    </div>
  );
}

function SubmitButton({ isPending }: { isPending: boolean }) {
  return (
    <button
      type="submit"
      disabled={isPending}
      className="inline-flex items-center justify-center gap-2 rounded-lg transition px-4 py-3 text-sm bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300"
    >
      {isPending ? 'Creating Request...' : 'Submit Fuel Request'}
    </button>
  );
}
