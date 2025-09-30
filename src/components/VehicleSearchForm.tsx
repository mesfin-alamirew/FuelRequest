// src/app/(protected)/transport/VehicleSearchForm.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';

export default function VehicleSearchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [plate, setPlate] = useState(searchParams.get('plate') || '');

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('plate', plate);
      router.push(`/transport?${params.toString()}`);
    });
  };

  return (
    <form onSubmit={handleSearch} className="flex gap-2">
      <input
        type="text"
        placeholder="Enter vehicle plate number"
        value={plate}
        onChange={(e) => setPlate(e.target.value)}
        className="border p-2 rounded-md flex-grow"
        required
      />
      <button
        type="submit"
        disabled={isPending}
        className="bg-blue-600 text-white p-2 rounded-md"
      >
        {isPending ? 'Searching...' : 'Search'}
      </button>
    </form>
  );
}
