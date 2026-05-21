// src/app/admin/manage-vehicles/_components/VehicleManagementTable.tsx
'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { deleteFuelPrice, fetchFuelPrices } from '@/lib/actions/admin';
import type { FuelPrice } from '@prisma/client';

import { Table, TableBody, TableCell, TableHeader, TableRow } from './ui/table';
import EditFuelPriceForm from './EditFuelPriceForm';

type FuelPriceManagementTableProps = {
  initialFuelPrices: FuelPrice[];
};

export default function FuelPriceManagementTable({
  initialFuelPrices,
}: FuelPriceManagementTableProps) {
  const [fuelPrices, setFuelPrices] = useState(initialFuelPrices);
  const [editingFuelPriceId, setEditingFuelPriceId] = useState<number | null>(
    null,
  );

  const handleDataRefresh = async () => {
    try {
      const updatedFuelPrices = await fetchFuelPrices();
      setFuelPrices(updatedFuelPrices);
    } catch (error) {
      toast.error('Failed to update fuel price list.');
    }
  };

  const handleDeleteFuelPrice = async (fuelPriceId: number) => {
    if (window.confirm('Are you sure you want to delete this fuel price?')) {
      try {
        await deleteFuelPrice(fuelPriceId);
        toast.success('Fuel price deleted successfully!');
        handleDataRefresh();
      } catch (error) {
        toast.error('Failed to delete fuel price.');
      }
    }
  };

  const handleFuelPriceUpdated = async () => {
    await handleDataRefresh();
    setEditingFuelPriceId(null);
  };

  return (
    <>
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
                    Fuel Type
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Price
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
                {fuelPrices.map((fuelPrice) => (
                  <TableRow key={fuelPrice.id}>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {fuelPrice.type}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {fuelPrice.price}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      <button
                        onClick={() => setEditingFuelPriceId(fuelPrice.id)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteFuelPrice(fuelPrice.id)}
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
        </div>
      </div>
      {editingFuelPriceId && (
        <EditFuelPriceForm
          fuelPrice={fuelPrices.find((fp) => fp.id === editingFuelPriceId)!}
          onCancel={() => setEditingFuelPriceId(null)}
          onFuelPriceUpdated={handleFuelPriceUpdated}
        />
      )}
    </>
  );
}
