// src/app/ui/ExportButton.tsx
'use client';

import { useTransition, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { UploadIcon } from 'lucide-react';

interface ExportButtonProps {
  exportAction: (
    filters: Record<string, string | undefined>
  ) => Promise<{ downloadUrl?: string; error?: string }>;
  fileName: string;
}

export default function ExportButton({
  exportAction,
  fileName,
}: ExportButtonProps) {
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();

  const handleExport = async () => {
    startTransition(async () => {
      const filters = Object.fromEntries(searchParams.entries());
      const result = await exportAction(filters);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.downloadUrl) {
        const link = document.createElement('a');
        link.href = result.downloadUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Report export successful!');
      }
    });
  };

  return (
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
  );
}
