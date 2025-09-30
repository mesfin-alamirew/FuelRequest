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
    <div className="flex gap-2">
      <select
        value={selectedPlate}
        onChange={handleSelect}
        className="border p-2 rounded-md flex-grow"
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
    </div>
  );
}
