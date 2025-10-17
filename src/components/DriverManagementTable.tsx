// src/app/admin/manage-vehicles/_components/VehicleManagementTable.tsx
'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { deleteDriver } from '@/lib/actions/admin';
import type { Driver } from '@prisma/client';

import EditDriverForm from './EditDriverForm';
import AddDriverForm from './AddDriverForm';
import { fetchDrivers } from '@/lib/actions/admin';
import { Table, TableBody, TableCell, TableHeader, TableRow } from './ui/table';

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
    <>
      <AddDriverForm onDriverAdded={handleDataRefresh} />

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
                    ID
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Name
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
                {drivers.map((driver) => (
                  <TableRow key={driver.id}>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {driver.id}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {driver.name}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {editingDriverId && (
            <EditDriverForm
              driver={drivers.find((v) => v.id === editingDriverId)!}
              onCancel={() => setEditingDriverId(null)}
              onDriverUpdated={handleDriverUpdated}
            />
          )}
        </div>
      </div>
    </>
  );
}
