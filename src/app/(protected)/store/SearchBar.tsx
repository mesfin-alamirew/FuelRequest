// src/app/(protected)/transport/my-requests/SearchBar.tsx
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

export default function SearchBar() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [requestNumber, setRequestNumber] = useState(
    searchParams.get('requestNumber') || ''
  );
  const [plate, setPlate] = useState(searchParams.get('plate') || '');

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (requestNumber) {
        params.set('requestNumber', requestNumber);
      } else {
        params.delete('requestNumber');
      }
      if (plate) {
        params.set('plate', plate);
      } else {
        params.delete('plate');
      }
      // Reset to page 1 on a new search
      params.set('page', '1');
      router.push(`?${params.toString()}`);
    });
  };

  return (
    <form onSubmit={handleSearch} className="flex gap-2 items-center ">
      <input
        type="text"
        placeholder="Search by request number..."
        value={requestNumber}
        onChange={(e) => setRequestNumber(e.target.value)}
        className="shadow-sm focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pr-4 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-none sm:w-[300px] sm:min-w-[300px] dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
      />
      <input
        type="text"
        placeholder="Search by plate..."
        value={plate}
        onChange={(e) => setPlate(e.target.value)}
        className="shadow-sm focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pr-4 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-none sm:w-[300px] sm:min-w-[300px] dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
      />
      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center justify-center font-medium gap-2 rounded-lg transition  px-5 py-3.5 text-sm bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300 "
      >
        {isPending ? 'Searching...' : 'Search'}
      </button>
    </form>
  );
}
