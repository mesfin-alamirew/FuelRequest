// src/app/(protected)/admin/balance-report/page.tsx
import { PrismaClient, Prisma, BalanceTransactionType } from '@prisma/client';
import { format } from 'date-fns';
import BalanceTransactionSearchBar from './BalanceTransactionSearchBar';

import Link from 'next/link';
import ExportButton from '@/components/ExportButton';
import { exportBalanceReportToCsv } from '@/lib/actions/balance-actions';
import PaginationControls from '@/components/ui/PaginationControls';

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
      <h1 className="text-2xl font-bold mb-6">Balance Transaction Report</h1>
      <div className="mb-6 flex flex-col items-center">
        <Link href="/admin" className="text-blue-600 hover:underline">
          &larr; Back to Admin Dashboard
        </Link>
        <BalanceTransactionSearchBar />
        <ExportButton
          exportAction={exportBalanceReportToCsv}
          fileName="balance-report.csv"
        />
      </div>

      {transactions.length === 0 ? (
        <p>No transactions match the selected filters.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <div className="flex gap-6 p-2 mb-4 bg-gray-600 text-white">
              <p>Total Coupon Delivered: {couponDelivered}</p>
              <p>Top Up: {topUp}</p>
              <p>Current Balance: {balance?.currentAmount}</p>
            </div>
            <table className="min-w-full bg-white border border-gray-200 text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 border-b text-left">Request#</th>
                  <th className="py-2 px-4 border-b text-left">Type</th>
                  <th className="py-2 px-4 border-b text-left">Amount</th>
                  <th className="py-2 px-4 border-b text-left">User</th>
                  <th className="py-2 px-4 border-b text-left">Date</th>
                  <th className="py-2 px-4 border-b text-left">Details</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id}>
                    <td className="py-2 px-4 border-b">
                      {t.type === 'COUPON_DEDUCTION'
                        ? t.couponDelivery?.fuelRequest.requestNumber
                        : 0}
                    </td>
                    <td className="py-2 px-4 border-b">{t.type}</td>
                    <td className="py-2 px-4 border-b">
                      {t.amount.toFixed(2)}
                    </td>
                    <td className="py-2 px-4 border-b">{t.user.name}</td>
                    <td className="py-2 px-4 border-b">
                      {format(t.createdAt, 'yyyy-MM-dd HH:mm')}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {t.type === BalanceTransactionType.COUPON_DEDUCTION &&
                        t.couponDelivery &&
                        `Coupon for Request #${t.couponDelivery.fuelRequest.requestNumber} (${t.couponDelivery.fuelRequest.vehicle.plate})`}
                      {t.type === BalanceTransactionType.TOP_UP &&
                        `Funds added`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
