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
        className={`px-4 py-2 text-sm rounded-md ${
          currentPage > 1
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        Previous
      </Link>
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => handlePageChange(page)}
          className={`px-4 py-1 text-sm rounded-md ${
            page === currentPage
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          {page}
        </button>
      ))}
      <Link
        href={currentPage < totalPages ? `?page=${currentPage + 1}` : '#'}
        className={`px-4 py-2 rounded-md text-sm ${
          currentPage < totalPages
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        Next
      </Link>
    </div>
  );
}
