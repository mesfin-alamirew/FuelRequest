// src/app/(protected)/admin/report/BalanceTransactionSearchBar.tsx
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { BalanceTransactionType } from '@prisma/client';
import Link from 'next/link';

export default function BalanceTransactionSearchBar() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [filters, setFilters] = useState({
    type: searchParams.get('type') || '',
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
      className="mb-6 p-4 border rounded-lg dark:border-white/[0.05] dark:bg-white/[0.03] bg-gray-50 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      <div className="flex flex-col">
        <label className="mb-1.5 dark:text-gray-400 block text-sm font-medium">
          Transaction Type
        </label>
        <select
          name="type"
          value={filters.type}
          onChange={handleInputChange}
          className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
        >
          <option value="">All Types</option>
          {Object.values(BalanceTransactionType).map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col">
        <label className="mb-1.5 dark:text-gray-400 block text-sm font-medium">
          Start Date
        </label>
        <input
          type="date"
          name="startDate"
          value={filters.startDate}
          onChange={handleInputChange}
          className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
        />
      </div>
      <div className="flex flex-col">
        <label className="mb-1.5 dark:text-gray-400 block text-sm font-medium">
          End Date
        </label>
        <input
          type="date"
          name="endDate"
          value={filters.endDate}
          onChange={handleInputChange}
          className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
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
          href="/admin/report"
          className="bg-gray-200 text-gray-800 p-2 rounded-md"
        >
          Reset
        </Link>
      </div>
    </form>
  );
}
