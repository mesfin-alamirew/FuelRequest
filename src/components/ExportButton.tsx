// src/app/ui/ExportButton.tsx
'use client';

import { useTransition, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';

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
      className="bg-green-600 text-white p-2 rounded-md disabled:opacity-50"
    >
      {isPending ? 'Exporting...' : 'Export to CSV'}
    </button>
  );
}
