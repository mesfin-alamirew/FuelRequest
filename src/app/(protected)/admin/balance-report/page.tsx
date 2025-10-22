// src/app/(protected)/admin/balance-report/page.tsx
import { PrismaClient, Prisma, BalanceTransactionType } from '@prisma/client';
import { format } from 'date-fns';
import BalanceTransactionSearchBar from './BalanceTransactionSearchBar';

import Link from 'next/link';
import ExportButton from '@/components/ExportButton';
import { exportBalanceReportToCsv } from '@/lib/actions/balance-actions';
import PaginationControls from '@/components/ui/PaginationControls';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const prisma = new PrismaClient();
const ITEMS_PER_PAGE = 10;

export default async function BalanceReportPage({
  searchParams,
}: {
  searchParams?: Promise<{
    page?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
  }>;
}) {
  const awaitedSearchParams = await searchParams;
  const currentPage = parseInt(awaitedSearchParams?.page || '1');
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  const whereClause: Prisma.BalanceTransactionWhereInput = {
    ...(awaitedSearchParams?.type && {
      type: awaitedSearchParams.type as BalanceTransactionType,
    }),
    ...(awaitedSearchParams?.startDate &&
      awaitedSearchParams?.endDate && {
        createdAt: {
          gte: new Date(awaitedSearchParams.startDate),
          lte: new Date(awaitedSearchParams.endDate),
        },
      }),
  };

  const totalTransactions = await prisma.balanceTransaction.count({
    where: whereClause,
  });
  const transactions = await prisma.balanceTransaction.findMany({
    where: whereClause,
    include: {
      user: true,
      couponDelivery: {
        include: {
          fuelRequest: {
            include: {
              vehicle: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    skip,
    take: ITEMS_PER_PAGE,
  });

  const totalPages = Math.ceil(totalTransactions / ITEMS_PER_PAGE);
  let couponDelivered = 0;
  let topUp = 0;
  const balance = await prisma.balance.findFirst();

  transactions.forEach((item) => {
    couponDelivered += item.type === 'COUPON_DEDUCTION' ? -item.amount : 0;
    topUp += item.type === 'TOP_UP' ? item.amount : 0;
  });
  return (
    <main className="p-8 max-w-6xl mx-auto text-sm">
      <h2
        className="text-xl font-semibold text-gray-800 dark:text-white/90"
        x-text="pageName"
      >
        Balance Transaction Report
      </h2>
      <div className="mb-6 flex flex-col">
        <Link href="/admin" className="text-blue-600 hover:underline">
          &larr; Back to Admin Dashboard
        </Link>
      </div>
      <BalanceTransactionSearchBar />
      <ExportButton
        exportAction={exportBalanceReportToCsv}
        fileName="balance-report.csv"
      />
      {transactions.length === 0 ? (
        <p className="mb-1.5 dark:text-gray-400 block text-sm font-medium">
          No transactions match the selected filters.
        </p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <div className="flex gap-6 p-2 mb-4 bg-gray-600 text-white">
              <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                Total Coupon Delivered: {couponDelivered}
              </p>
              <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                Top Up: {topUp}
              </p>
              <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                Current Balance: {balance?.currentAmount}
              </p>
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
                        Request#
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Type
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Amount
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        User
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Date
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Details
                      </TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {transactions.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {t.type === 'COUPON_DEDUCTION'
                            ? t.couponDelivery?.fuelRequest.requestNumber
                            : 0}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {t.type}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {t.amount.toFixed(2)}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {t.user.name}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {format(t.createdAt, 'yyyy-MM-dd HH:mm')}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {t.type === BalanceTransactionType.COUPON_DEDUCTION &&
                            t.couponDelivery &&
                            `Coupon for Request #${t.couponDelivery.fuelRequest.requestNumber} (${t.couponDelivery.fuelRequest.vehicle.plate})`}
                          {t.type === BalanceTransactionType.TOP_UP &&
                            `Funds added`}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
          />
        </>
      )}
    </main>
  );
}
