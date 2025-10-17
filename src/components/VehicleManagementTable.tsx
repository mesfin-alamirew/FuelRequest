// src/app/admin/manage-vehicles/_components/VehicleManagementTable.tsx
'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { deleteVehicle, fetchVehicles } from '@/lib/actions/admin';
import type { Vehicle } from '@prisma/client';
import AddVehicleForm from './AddVehicleForm';
import EditVehicleForm from './EditVehicleForm'; // Import the new component
import { Table, TableBody, TableCell, TableHeader, TableRow } from './ui/table';

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
    <>
      <AddVehicleForm onVehicleAdded={handleDataRefresh} />
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1102px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Plate Number
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Fuel Type
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Last Odometer
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {vehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {vehicle.plate}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {vehicle.fuelType}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {vehicle.lastOdometer}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {editingVehicleId && (
            <EditVehicleForm
              vehicle={vehicles.find((v) => v.id === editingVehicleId)!}
              onCancel={() => setEditingVehicleId(null)}
              onVehicleUpdated={handleVehicleUpdated}
            />
          )}
        </div>
      </div>
    </>
  );
}
