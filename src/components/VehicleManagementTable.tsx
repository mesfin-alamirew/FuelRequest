// src/app/admin/manage-vehicles/_components/VehicleManagementTable.tsx
'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { deleteVehicle, fetchVehicles } from '@/lib/actions/admin';
import type { Vehicle } from '@prisma/client';
import AddVehicleForm from './AddVehicleForm';
import EditVehicleForm from './EditVehicleForm'; // Import the new component

type VehicleManagementTableProps = {
  initialVehicles: Vehicle[];
};

export default function VehicleManagementTable({
  initialVehicles,
}: VehicleManagementTableProps) {
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [editingVehicleId, setEditingVehicleId] = useState<number | null>(null);

  const handleDataRefresh = async () => {
    try {
      const updatedVehicles = await fetchVehicles();
      setVehicles(updatedVehicles);
    } catch (error) {
      toast.error('Failed to update vehicle list.');
    }
  };

  const handleDeleteVehicle = async (vehicleId: number) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await deleteVehicle(vehicleId);
        toast.success('Vehicle deleted successfully!');
        handleDataRefresh();
      } catch (error) {
        toast.error('Failed to delete vehicle.');
      }
    }
  };

  const handleVehicleUpdated = async () => {
    await handleDataRefresh();
    setEditingVehicleId(null);
  };

  return (
    <div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        {/* ... (table header) */}
        <table>
          <tbody className="bg-white divide-y divide-gray-200">
            {vehicles.map((vehicle) => (
              <tr key={vehicle.id}>
                <td className="px-6 py-4 whitespace-nowrap">{vehicle.plate}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {vehicle.fuelType}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {vehicle.lastOdometer}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => setEditingVehicleId(vehicle.id)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteVehicle(vehicle.id)}
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
      {editingVehicleId && (
        <EditVehicleForm
          vehicle={vehicles.find((v) => v.id === editingVehicleId)!}
          onCancel={() => setEditingVehicleId(null)}
          onVehicleUpdated={handleVehicleUpdated}
        />
      )}
      <AddVehicleForm onVehicleAdded={handleDataRefresh} />
    </div>
  );
}
