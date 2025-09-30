// src/app/ToastHandler.tsx
'use client';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';

export function ToastHandler() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const type = searchParams.get('toast');
    const message = searchParams.get('message');

    if (type && message) {
      if (type === 'success') {
        toast.success(message);
      } else if (type === 'error') {
        toast.error(message);
      }

      // Clear the URL parameters
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.delete('toast');
      newSearchParams.delete('message');
      router.replace(`${pathname}?${newSearchParams.toString()}`, {
        scroll: false,
      });
    }
  }, [searchParams, pathname, router]);

  return null;
}
