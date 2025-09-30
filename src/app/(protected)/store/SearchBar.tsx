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
    <form onSubmit={handleSearch} className="flex gap-2 items-center mb-6">
      <input
        type="text"
        placeholder="Search by request number..."
        value={requestNumber}
        onChange={(e) => setRequestNumber(e.target.value)}
        className="border p-2 rounded-md"
      />
      <input
        type="text"
        placeholder="Search by plate..."
        value={plate}
        onChange={(e) => setPlate(e.target.value)}
        className="border p-2 rounded-md"
      />
      <button
        type="submit"
        disabled={isPending}
        className="bg-blue-600 text-white p-2 rounded-md disabled:opacity-50"
      >
        {isPending ? 'Searching...' : 'Search'}
      </button>
    </form>
  );
}
