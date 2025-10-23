// src/app/(protected)/transport/VehicleSelectForm.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition, useState } from 'react';
import { Vehicle } from '@prisma/client';

export default function VehicleSelectForm({
  vehicles,
}: {
  vehicles: Vehicle[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [selectedPlate, setSelectedPlate] = useState(
    searchParams.get('plate') || ''
  );

  const handleSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newPlate = event.target.value;
    setSelectedPlate(newPlate);
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (newPlate) {
        params.set('plate', newPlate);
      } else {
        params.delete('plate');
      }
      router.push(`/transport?${params.toString()}`);
    });
  };

  return (
    <div className="relative z-20 bg-transparent">
      <select
        value={selectedPlate}
        onChange={handleSelect}
        className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pr-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
        disabled={isPending}
      >
        <option value="" disabled>
          Select a vehicle
        </option>
        {vehicles.map((vehicle) => (
          <option key={vehicle.id} value={vehicle.plate}>
            {vehicle.plate}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute top-1/2 right-4 z-30 -translate-y-1/2 text-gray-500 dark:text-gray-400">
        <svg
          className="stroke-current"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.79175 7.396L10.0001 12.6043L15.2084 7.396"
            stroke=""
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
        </svg>
      </span>
    </div>
  );
}
