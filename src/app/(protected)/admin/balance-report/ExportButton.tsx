// src/app/(protected)/admin/report/ExportButton.tsx
'use client';

import { useTransition, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { exportReportToCsv } from '@/lib/actions/admin';
import { UploadIcon } from 'lucide-react';

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
        className="inline-flex items-center justify-center font-medium gap-2 rounded-lg transition  px-5 py-3.5 text-sm bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300 "
      >
        {isPending ? (
          'Exporting...'
        ) : (
          <>
            <UploadIcon />
            <span>Export to CSV</span>
          </>
        )}
      </button>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}
