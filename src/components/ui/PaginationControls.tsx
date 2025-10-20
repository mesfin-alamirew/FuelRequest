// src/app/(protected)/transport/my-requests/PaginationControls.tsx
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
}

export default function PaginationControls({
  currentPage,
  totalPages,
}: PaginationControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`?${params.toString()}`);
  };

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex justify-center mt-8 space-x-2">
      <Link
        href={currentPage > 1 ? `?page=${currentPage - 1}` : '#'}
        className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 sm:px-3.5 sm:py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
        // className={`px-4 py-2 text-sm rounded-md ${
        //   currentPage > 1
        //     ? 'bg-blue-600 text-white'
        //     : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        // }`}
      >
        Previous
      </Link>
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => handlePageChange(page)}
          className="flex items-center justify-center w-10 h-10 text-sm font-medium rounded-lg text-white bg-brand-500 hover:bg-brand-600"
          // className={`px-4 py-1 text-sm rounded-md ${
          //   page === currentPage
          //     ? 'bg-blue-600 text-white'
          //     : 'bg-gray-200 text-gray-700'
          // }`}
        >
          {page}
        </button>
      ))}
      <Link
        href={currentPage < totalPages ? `?page=${currentPage + 1}` : '#'}
        className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 sm:px-3.5 sm:py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
        // className={`px-4 py-2 rounded-md text-sm ${
        //   currentPage < totalPages
        //     ? 'bg-blue-600 text-white'
        //     : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        // }`}
      >
        Next
      </Link>
    </div>
  );
}
