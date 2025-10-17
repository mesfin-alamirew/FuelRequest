'use client';

import { fetchCoupons } from '@/lib/actions/admin';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useActionState, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

import Link from 'next/link';
import AddCouponForm from './AddCouponForm';
import { toast } from 'react-toastify';
import { Table, TableBody, TableCell, TableHeader, TableRow } from './ui/table';

type Coupon = {
  id: number;
  couponNumber: string;
  priceValue: number;
  isDelivered: boolean;

  // ... other properties
};

type ActionState = {
  coupons: Coupon[];
  currentPage: number;
  totalPages: number;
};

type Props = {
  initialCoupons: Coupon[];
  initialPage: number;
  totalPages: number;
};

// This wrapper action lets us pass extra parameters to the fetchCoupons action
async function fetchPageWithParams(
  state: ActionState,
  formData: FormData
): Promise<ActionState> {
  const newPage = Number(formData.get('page'));
  const searchQuery = String(formData.get('query') || '');
  const pageSize = Number(formData.get('pageSize'));

  const { coupons, totalPages } = await fetchCoupons(
    searchQuery,
    newPage,
    pageSize
  );
  return { coupons, currentPage: newPage, totalPages };
}

export default function CouponTable({
  initialCoupons,
  initialPage,
  totalPages,
}: Props) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [coupons, setCoupons] = useState(initialCoupons);

  const { replace } = useRouter();

  const initialState = {
    coupons: initialCoupons,
    currentPage: initialPage,
    totalPages,
  };

  // const [paginationState, formAction] = useActionState(
  //   fetchPageWithParams,
  //   initialState
  // );
  const [paginationState, formAction] = useActionState<ActionState, FormData>(
    fetchPageWithParams, // Your server action
    {
      coupons: initialCoupons,
      totalPages: initialPage,
      currentPage: initialPage,
    }
  );

  const handleSearch = useDebouncedCallback((query: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1');
    if (query) {
      params.set('query', query);
    } else {
      params.delete('query');
    }
    replace(`${pathname}?${params.toString()}`);
  }, 500);

  const router = useRouter();
  const handleCouponAdded = async () => {
    try {
      const updatedCoupons = await fetchCoupons();
      setCoupons(updatedCoupons.coupons);
    } catch (error) {
      toast.error('Failed to update department list.');
    }
  };
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`?${params.toString()}`);
  };

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <>
      <AddCouponForm onCouponAdded={handleCouponAdded} />

      <div className="mb-4">
        {/* <input
          key={searchParams.get('query') || ''}
          type="text"
          placeholder="Search by coupon number..."
          onChange={(e) => handleSearch(e.target.value)}
          defaultValue={searchParams.get('query')?.toString()}
          className="border rounded px-2 py-1 w-full"
        /> */}
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1102px]"></div>

          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Coupon Number
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Price Value
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Status
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {paginationState.coupons.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {coupon.couponNumber}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    ${coupon.priceValue}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {coupon.isDelivered ? (
                      <span className="text-red-400 font-bold ">Delivered</span>
                    ) : (
                      <span className="text-green-400 font-bold ">
                        Available
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <div className="flex gap-4">
                      <Link href={`/admin/manage-coupons/${coupon.id}/edit`}>
                        <button className="text-blue-600 hover:text-blue-900 cursor-pointer">
                          Edit
                        </button>
                      </Link>
                      <Link href={`/coupons/${coupon.id}/edit`}>
                        <button className="text-red-600 hover:text-red-900 cursor-pointer">
                          Delete
                        </button>
                      </Link>
                    </div>
                  </TableCell>
                  <td className="px-6 py-4 whitespace-nowrap"></td>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination controls */}
      <div className="flex justify-center mt-8 space-x-2">
        <form action={formAction}>
          <input
            type="hidden"
            name="page"
            value={paginationState.currentPage - 1}
          />
          <input
            type="hidden"
            name="query"
            value={searchParams.get('query') || ''}
          />
          <input type="hidden" name="pageSize" value={10} />
          <button
            type="submit"
            disabled={paginationState.currentPage <= 1}
            className=" px-4 py-2  bg-blue-600 text-white rounded disabled:opacity-50"
          >
            Previous
          </button>
        </form>
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`px-4 py-2 rounded-md ${
              page === paginationState.currentPage
                ? 'bg-blue-600 text-white'
                : 'bg-gray-300 text-gray-700 cursor-pointer'
            }`}
          >
            {page}
          </button>
        ))}
        <form action={formAction}>
          <input
            type="hidden"
            name="page"
            value={paginationState.currentPage + 1}
          />
          <input
            type="hidden"
            name="query"
            value={searchParams.get('query') || ''}
          />
          <input type="hidden" name="pageSize" value={10} />
          <button
            type="submit"
            disabled={paginationState.currentPage >= paginationState.totalPages}
            className=" px-4 py-2  bg-blue-600 text-white rounded disabled:opacity-50"
          >
            Next
          </button>
        </form>
      </div>
    </>
  );
}
