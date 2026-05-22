// src/app/admin/manage-vehicles/_components/VehicleManagementTable.tsx
'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { deleteDriver, fetchCouponValues } from '@/lib/actions/admin';
import type { CouponValue, Driver } from '@prisma/client';

import EditDriverForm from './EditDriverForm';
import AddDriverForm from './AddDriverForm';
import { fetchDrivers } from '@/lib/actions/admin';
import { Table, TableBody, TableCell, TableHeader, TableRow } from './ui/table';
import EditCouponValueForm from './EditCouponValueForm';

type CouponValueTableProps = {
  initialCouponValues: CouponValue[];
};

export default function CouponValueTable({
  initialCouponValues,
}: CouponValueTableProps) {
  const [couponValues, setCouponValues] = useState(initialCouponValues);
  const [editingCouponValueId, setEditingCouponValueId] = useState<
    number | null
  >(null);

  const handleDataRefresh = async () => {
    try {
      const updatedCouponValues = await fetchCouponValues();
      setCouponValues(updatedCouponValues);
    } catch (error) {
      toast.error('Failed to update coupon value list.');
    }
  };

  const handleCouponValueUpdated = async () => {
    await handleDataRefresh();
    setEditingCouponValueId(null);
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
                    ID
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Value
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
                {couponValues.map((couponValue) => (
                  <TableRow key={couponValue.id}>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {couponValue.id}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {couponValue.value}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <button
                        onClick={() => setEditingCouponValueId(couponValue.id)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
      {editingCouponValueId && (
        <EditCouponValueForm
          couponValue={couponValues.find((v) => v.id === editingCouponValueId)!}
          onCancel={() => setEditingCouponValueId(null)}
          onCouponValueUpdated={handleCouponValueUpdated}
        />
      )}
    </>
  );
}
