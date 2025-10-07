'use client';

import {
  Vehicle,
  Driver,
  Department,
  FuelRequest,
  FuelTypeEnum,
} from '@prisma/client';
import { ChangeEvent, useActionState, useState, useEffect } from 'react';
import {
  createFuelRequest,
  updateFuelRequest,
  FormState,
} from '@/lib/actions/requests';

interface VehicleRequestFormProps {
  vehicles: Vehicle[];
  drivers: Driver[];
  departments: Department[];
  liter: number;
  couponValue: number;
  request?: FuelRequest;
}

const initialState: FormState = {
  message: '',
  errors: {},
};

export default function VehicleRequestForm({
  vehicles,
  drivers,
  departments,
  liter,
  couponValue,
  request,
}: VehicleRequestFormProps) {
  const isEditMode = !!request;
  const action = isEditMode
    ? updateFuelRequest.bind(null, request.id)
    : createFuelRequest;

  const [state, formAction, isPending] = useActionState(action, initialState);

  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(() => {
    return isEditMode
      ? vehicles.find((v) => v.id === request.vehicleId) || null
      : vehicles?.[0] || null;
  });

  const [formInputs, setFormInputs] = useState({
    vehicleId: request?.vehicleId || vehicles?.[0]?.id || 0,
    currentOdometer: 0, // Initialized in useEffect
    lastOdometer: 0, // Initialized in useEffect
    quantity: request?.quantity || 0,
    fuelType:
      request?.fuelType ||
      vehicles?.[0]?.fuelType ||
      ('DIESEL' as FuelTypeEnum),
  });

  useEffect(() => {
    if (selectedVehicle) {
      setFormInputs((prev) => ({
        ...prev,
        lastOdometer: selectedVehicle.lastOdometer,
        fuelType: selectedVehicle.fuelType,
      }));
    }
  }, [selectedVehicle]);

  useEffect(() => {
    if (isEditMode) {
      setFormInputs((prev) => ({
        ...prev,
        currentOdometer: request.currentOdometer,
      }));
    }
  }, [isEditMode, request]);

  const changeHandler = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === 'vehicleId') {
      const newVehicleId = parseInt(value, 10);
      const newVehicle = vehicles.find((v) => v.id === newVehicleId) || null;
      setSelectedVehicle(newVehicle);

      setFormInputs((prev) => ({
        ...prev,
        [name]: newVehicleId,
        // Set current odometer to last odometer of new vehicle
        currentOdometer: newVehicle?.lastOdometer || 0,
      }));
    } else {
      setFormInputs((prev) => ({ ...prev, [name]: value }));
    }
  };

  const odometerDifference =
    (formInputs.currentOdometer || 0) - (formInputs.lastOdometer || 0);

  return (
    <form action={formAction} className="mt-8 p-6 border rounded-lg bg-gray-50">
      <h2 className="text-sm font-semibold mb-4 text-green-600">
        {isEditMode
          ? `Edit Fuel Request #${request?.requestNumber}`
          : `Create Fuel Request for ${selectedVehicle?.plate}`}
      </h2>

      {isEditMode && (
        <input type="hidden" name="requestId" value={request.id} />
      )}
      {isEditMode && (
        <input
          type="hidden"
          name="previousOdometer"
          value={request.previousOdometer}
        />
      )}
      <input type="hidden" name="fuelType" value={selectedVehicle?.fuelType} />

      {state.message && (
        <div className="p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50">
          {state.message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div className="flex flex-col">
          <label className="mb-1">Vehicle:</label>
          <select
            name="vehicleId"
            className="border p-2 rounded-md"
            required
            onChange={changeHandler}
            value={formInputs.vehicleId}
          >
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.plate}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="mb-1">Department:</label>
          <select
            name="departmentId"
            className="border p-2 rounded-md"
            required
            defaultValue={request?.departmentId}
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
          <select
            name="driverId"
            className="border p-2 rounded-md"
            required
            defaultValue={request?.driverId}
          >
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
            type="text"
            value={formInputs.lastOdometer || ''}
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
            onChange={changeHandler}
            value={formInputs.currentOdometer || ''}
          />
          {state.errors?.currentOdometer &&
            state.errors.currentOdometer.length > 0 && (
              <p className="text-red-500 text-sm mt-1">
                {state.errors.currentOdometer}
              </p>
            )}
        </div>
        <div className="flex flex-col">
          <label className="mb-1">OM Difference:</label>
          <input
            type="number"
            name="difference"
            className="border p-2 rounded-md bg-gray-200"
            value={odometerDifference}
            disabled
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-1">Quantity:</label>
          <input
            type="number"
            name="quantity"
            className="border p-2 rounded-md"
            onChange={changeHandler}
            required
            value={formInputs.quantity || ''}
          />
          {state.errors?.quantity && state.errors.quantity.length > 0 && (
            <p className="text-red-500 text-sm mt-1">{state.errors.quantity}</p>
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
            value={couponValue * formInputs.quantity}
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
            value={liter * formInputs.quantity}
            disabled
          />
        </div>
      </div>
      <div className="flex flex-col mt-4">
        <label className="mb-1">Remark</label>
        <textarea
          name="remark"
          placeholder="Put some remark...."
          className="border p-2 rounded-md w-full"
          defaultValue={request?.remark || ''}
        />
        {state.errors?.remark && state.errors.remark.length > 0 && (
          <p className="text-red-500 text-sm mt-1">{state.errors.remark}</p>
        )}
      </div>
      <SubmitButton isPending={isPending} isEditMode={isEditMode} />
    </form>
  );
}

function SubmitButton({
  isPending,
  isEditMode,
}: {
  isPending: boolean;
  isEditMode: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={isPending}
      className="bg-green-600 text-white p-2 rounded-md mt-6 w-full disabled:opacity-50"
    >
      {isPending
        ? 'Submitting...'
        : isEditMode
        ? 'Update Request'
        : 'Submit Fuel Request'}
    </button>
  );
}
