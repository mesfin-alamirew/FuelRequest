// src/app/(protected)/admin/report/page.tsx
import {
  PrismaClient,
  FuelRequest,
  User,
  Vehicle,
  Driver,
  RequestStatusEnum,
  Prisma,
} from '@prisma/client';
import { format } from 'date-fns';

import Link from 'next/link';

import PaginationControls from '@/components/ui/PaginationControls';
import ExportButton from '../balance-report/ExportButton';
import ReportSearchBar from '../balance-report/ReportSearchBar';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const prisma = new PrismaClient();
const ITEMS_PER_PAGE = 10; // Reports can show more items per page

type ExtendedFuelRequest = FuelRequest & {
  vehicle: Vehicle;
  focalPerson: User;
  driver: Driver;
};

export default async function RequestReportPage({
  searchParams,
}: {
  searchParams?: Promise<{
    page?: string;
    requestNumber?: string;
    plate?: string;
    driverId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }>;
}) {
  const awaitedSearchParams = await searchParams;
  const currentPage = parseInt(awaitedSearchParams?.page || '1');
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  const whereClause: Prisma.FuelRequestWhereInput = {
    ...(awaitedSearchParams?.requestNumber && {
      requestNumber: { contains: awaitedSearchParams.requestNumber },
    }),
    ...(awaitedSearchParams?.plate && {
      vehicle: {
        plate: { contains: awaitedSearchParams.plate, mode: 'insensitive' },
      },
    }),
    ...(awaitedSearchParams?.driverId && {
      driverId: parseInt(awaitedSearchParams.driverId),
    }),
    ...(awaitedSearchParams?.status && {
      status: awaitedSearchParams.status as RequestStatusEnum,
    }),
    ...(awaitedSearchParams?.startDate &&
      awaitedSearchParams?.endDate && {
        createdAt: {
          gte: new Date(awaitedSearchParams.startDate),
          lte: new Date(awaitedSearchParams.endDate),
        },
      }),
  };

  const totalRequests = await prisma.fuelRequest.count({ where: whereClause });
  const reportData: ExtendedFuelRequest[] = await prisma.fuelRequest.findMany({
    where: whereClause,
    include: { vehicle: true, focalPerson: true, driver: true },
    orderBy: { createdAt: 'desc' },
    skip,
    take: ITEMS_PER_PAGE,
  });

  const totalPages = Math.ceil(totalRequests / ITEMS_PER_PAGE);
  const drivers = await prisma.driver.findMany({ orderBy: { name: 'asc' } });
  const vehicles = await prisma.vehicle.findMany({ orderBy: { plate: 'asc' } });

  return (
    <main className="p-8 max-w-6xl mx-auto text-sm">
      <h2
        className="text-xl font-semibold text-gray-800 dark:text-white/90"
        x-text="pageName"
      >
        Fuel Request Report
      </h2>
      <div className="mb-6 flex justify-between items-center">
        <Link href="/admin" className="text-blue-600 hover:underline">
          &larr; Back to Admin Dashboard
        </Link>
        <ExportButton />
      </div>

      <ReportSearchBar drivers={drivers} vehicles={vehicles} />

      {reportData.length === 0 ? (
        <p>No requests match the selected filters.</p>
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <div className="min-w-[1102px]">
                <Table>
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                      <TableCell className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                        Request No.
                      </TableCell>
                      <TableCell className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                        Vehicle
                      </TableCell>
                      <TableCell className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                        Driver
                      </TableCell>
                      <TableCell className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                        Status
                      </TableCell>
                      <TableCell className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                        Focal Person
                      </TableCell>
                      <TableCell className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                        Odometer
                      </TableCell>
                      <TableCell className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                        Litres
                      </TableCell>
                      <TableCell className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                        Submitted At
                      </TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {reportData.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {request.requestNumber}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {request.vehicle.plate}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {request.driver.name}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              request.status === 'COMPLETED'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {request.status}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {request.focalPerson.name}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {request.currentOdometer}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {request.totalLiters.toFixed(2)}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {format(request.createdAt, 'yyyy-MM-dd HH:mm')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
              />
            </div>
          </div>
        </>
      )}
    </main>
  );
}
