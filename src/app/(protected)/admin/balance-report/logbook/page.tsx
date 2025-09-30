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
import ReportSearchBar from '../ReportSearchBar';
import PaginationControls from '@/components/ui/PaginationControls';
import ExportButton from '../ExportButton';

const prisma = new PrismaClient();
const ITEMS_PER_PAGE = 20; // Reports can show more items per page

type ExtendedFuelRequest = FuelRequest & {
  vehicle: Vehicle;
  focalPerson: User;
  driver: Driver;
};

export default async function AdminReportPage({
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
    <main className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Fuel Request Report</h1>
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
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 border-b text-left">Request No.</th>
                  <th className="py-2 px-4 border-b text-left">Vehicle</th>
                  <th className="py-2 px-4 border-b text-left">Driver</th>
                  <th className="py-2 px-4 border-b text-left">Status</th>
                  <th className="py-2 px-4 border-b text-left">Focal Person</th>
                  <th className="py-2 px-4 border-b text-left">Odometer</th>
                  <th className="py-2 px-4 border-b text-left">Litres</th>
                  <th className="py-2 px-4 border-b text-left">Submitted At</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((request) => (
                  <tr
                    key={request.id}
                    className="hover:bg-gray-50 border-b border-b-gray-200"
                  >
                    <td className="py-2 px-4">{request.requestNumber}</td>
                    <td className="py-2 px-4">{request.vehicle.plate}</td>
                    <td className="py-2 px-4">{request.driver.name}</td>
                    <td className="py-2 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          request.status === 'COMPLETED'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {request.status}
                      </span>
                    </td>
                    <td className="py-2 px-4">{request.focalPerson.name}</td>
                    <td className="py-2 px-4">{request.currentOdometer}</td>
                    <td className="py-2 px-4">
                      {request.totalLiters.toFixed(2)}
                    </td>
                    <td className="py-2 px-4">
                      {format(request.createdAt, 'yyyy-MM-dd HH:mm')}
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
