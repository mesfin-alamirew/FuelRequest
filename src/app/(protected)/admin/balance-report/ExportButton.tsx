// src/app/(protected)/admin/report/ExportButton.tsx
'use client';

import { useTransition, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { exportReportToCsv } from '@/lib/actions/admin';

export default function ExportButton() {
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');

  const handleExport = async () => {
    setError('');
    startTransition(async () => {
      // Create a plain object from searchParams to pass to the server action
      const filters = Object.fromEntries(searchParams.entries());
      const result = await exportReportToCsv(filters);

      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.downloadUrl) {
        const link = document.createElement('a');
        link.href = result.downloadUrl;
        link.download = `balance-report-${new Date().toISOString()}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    });
  };

  return (
    <div>
      <button
        onClick={handleExport}
        disabled={isPending}
        className="bg-green-600 text-white p-2 rounded-md disabled:opacity-50"
      >
        {isPending ? 'Exporting...' : 'Export to CSV'}
      </button>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}
