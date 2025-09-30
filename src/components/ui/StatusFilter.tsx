// src/components/ui/StatusFilter.tsx
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { RequestStatusEnum } from '@prisma/client';

interface StatusFilterProps {
  initialStatus: string;
}

export default function StatusFilter({ initialStatus }: StatusFilterProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [status, setStatus] = useState(initialStatus);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (newStatus) {
        params.set('status', newStatus);
      } else {
        params.delete('status');
      }
      params.set('page', '1'); // Reset to page 1 on new filter
      router.push(`?${params.toString()}`);
    });
  };

  return (
    <div className="text-sm">
      <select
        value={status}
        onChange={handleStatusChange}
        disabled={isPending}
        className="border p-2 rounded-md disabled:opacity-50"
      >
        <option value="">All Statuses</option>
        {Object.values(RequestStatusEnum).map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </div>
  );
}
