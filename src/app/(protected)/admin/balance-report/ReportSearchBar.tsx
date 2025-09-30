// src/app/(protected)/admin/report/ReportSearchBar.tsx
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Driver, Vehicle, RequestStatusEnum } from '@prisma/client';
import Link from 'next/link';

interface ReportSearchBarProps {
  drivers: Driver[];
  vehicles: Vehicle[];
}

export default function ReportSearchBar({
  drivers,
  vehicles,
}: ReportSearchBarProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [filters, setFilters] = useState({
    requestNumber: searchParams.get('requestNumber') || '',
    plate: searchParams.get('plate') || '',
    driverId: searchParams.get('driverId') || '',
    status: searchParams.get('status') || '',
    startDate: searchParams.get('startDate') || '',
    endDate: searchParams.get('endDate') || '',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startTransition(() => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        }
      });
      params.set('page', '1');
      router.push(`?${params.toString()}`);
    });
  };

  return (
    <form
      onSubmit={handleSearch}
      className="mb-6 p-4 border border-gray-300 rounded-lg bg-gray-50 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      <div className="flex flex-col">
        <label className="mb-1">Request No.</label>
        <input
          type="text"
          name="requestNumber"
          value={filters.requestNumber}
          onChange={handleInputChange}
          placeholder="Search by request number..."
          className="border border-gray-200 p-2 rounded-md"
        />
      </div>
      <div className="flex flex-col">
        <label className="mb-1">Plate</label>
        <select
          name="plate"
          value={filters.plate}
          onChange={handleInputChange}
          className="border border-gray-200 p-2 rounded-md"
        >
          <option value="">All Vehicles</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.plate}>
              {v.plate}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col">
        <label className="mb-1">Driver</label>
        <select
          name="driverId"
          value={filters.driverId}
          onChange={handleInputChange}
          className="border border-gray-200 p-2 rounded-md"
        >
          <option value="">All Drivers</option>
          {drivers.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col">
        <label className="mb-1">Status</label>
        <select
          name="status"
          value={filters.status}
          onChange={handleInputChange}
          className="border border-gray-200 p-2 rounded-md"
        >
          <option value="">All Statuses</option>
          {Object.values(RequestStatusEnum).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col">
        <label className="mb-1">Start Date</label>
        <input
          type="date"
          name="startDate"
          value={filters.startDate}
          onChange={handleInputChange}
          className="border  border-gray-200 p-2 rounded-md"
        />
      </div>
      <div className="flex flex-col">
        <label className="mb-1">End Date</label>
        <input
          type="date"
          name="endDate"
          value={filters.endDate}
          onChange={handleInputChange}
          className="border border-gray-200 p-2 rounded-md"
        />
      </div>
      <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-2 mt-4">
        <button
          type="submit"
          disabled={isPending}
          className="bg-blue-600 text-white p-2 rounded-md disabled:opacity-50"
        >
          {isPending ? 'Filtering...' : 'Apply Filters'}
        </button>
        <Link
          href="/admin/reports/logbook"
          className="bg-gray-200 text-gray-800 p-2 rounded-md"
        >
          Reset
        </Link>
      </div>
    </form>
  );
}
