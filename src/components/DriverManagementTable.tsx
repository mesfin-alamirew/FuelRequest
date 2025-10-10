// src/app/admin/manage-vehicles/_components/VehicleManagementTable.tsx
'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { deleteDriver } from '@/lib/actions/admin';
import type { Driver } from '@prisma/client';

import EditDriverForm from './EditDriverForm';
import AddDriverForm from './AddDriverForm';
import { fetchDrivers } from '@/lib/actions/admin';

type DriverManagementTableProps = {
  initialDrivers: Driver[];
};

export default function DriverManagementTable({
  initialDrivers,
}: DriverManagementTableProps) {
  const [drivers, setDrivers] = useState(initialDrivers);
  const [editingDriverId, setEditingDriverId] = useState<number | null>(null);

  const handleDataRefresh = async () => {
    try {
      const updatedDrivers = await fetchDrivers();
      setDrivers(updatedDrivers);
    } catch (error) {
      toast.error('Failed to update driver list.');
    }
  };

  const handleDeleteDriver = async (driverId: number) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await deleteDriver(driverId);
        toast.success('Vehicle deleted successfully!');
        handleDataRefresh();
      } catch (error) {
        toast.error('Failed to delete vehicle.');
      }
    }
  };

  const handleDriverUpdated = async () => {
    await handleDataRefresh();
    setEditingDriverId(null);
  };

  return (
    <div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        {/* ... (table header) */}
        <table>
          <tbody className="bg-white divide-y divide-gray-200">
            {drivers.map((driver) => (
              <tr key={driver.id}>
                <td className="px-6 py-4 whitespace-nowrap">{driver.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">{driver.name}</td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => setEditingDriverId(driver.id)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteDriver(driver.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editingDriverId && (
        <EditDriverForm
          driver={drivers.find((v) => v.id === editingDriverId)!}
          onCancel={() => setEditingDriverId(null)}
          onDriverUpdated={handleDriverUpdated}
        />
      )}
      <AddDriverForm onDriverAdded={handleDataRefresh} />
    </div>
  );
}
