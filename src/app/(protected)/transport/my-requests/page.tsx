// src/app/(protected)/transport/my-requests/page.tsx
import {
  PrismaClient,
  Prisma,
  FuelRequest,
  User,
  Vehicle,
  Driver,
  RequestStatusEnum,
} from '@prisma/client';
import { format } from 'date-fns';
import { getAuthSession } from '@/lib/auth';
import Link from 'next/link';
import PaginationControls from '@/components/ui/PaginationControls'; // New component
import SearchBar from './SearchBar';
import StatusFilter from '@/components/ui/StatusFilter';

const prisma = new PrismaClient();
const ITEMS_PER_PAGE = 10;

// Helper type for requests with relations
type ExtendedFuelRequest = FuelRequest & {
  vehicle: Vehicle;
} & { driver: Driver };

export default async function MyRequestsPage({
  searchParams,
}: {
  searchParams?: Promise<{
    page?: string;
    requestNumber?: string;
    plate?: string;
    status?: string;
  }>;
}) {
  const session = await getAuthSession();

  if (!session || session.role !== 'TRANSPORT_FOCAL') {
    return (
      <main className="p-8 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Access Denied</h1>
        <p>You do not have permission to view this page.</p>
      </main>
    );
  }

  const focalPersonId = parseInt(session.id);
  if (isNaN(focalPersonId)) {
    return (
      <main className="p-8 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Error</h1>
        <p>Invalid user session. Please log in again.</p>
      </main>
    );
  }

  const awaitedSearchParams = await searchParams;
  const currentPage = parseInt(awaitedSearchParams?.page || '1');
  const requestNumberQuery = awaitedSearchParams?.requestNumber;
  const plateQuery = awaitedSearchParams?.plate;
  const statusQuery = awaitedSearchParams?.status;
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  const whereClause: Prisma.FuelRequestWhereInput = {
    focalPersonId,
    ...(requestNumberQuery && {
      requestNumber: { contains: requestNumberQuery },
    }),
    ...(plateQuery && {
      vehicle: {
        plate: { contains: plateQuery, mode: 'insensitive' as const },
      },
    }),
    ...(statusQuery && { status: statusQuery as RequestStatusEnum }),
  };

  const totalRequests = await prisma.fuelRequest.count({ where: whereClause });
  const myRequests: ExtendedFuelRequest[] = await prisma.fuelRequest.findMany({
    where: whereClause,
    include: { vehicle: true, driver: true },
    orderBy: { createdAt: 'desc' },
    skip,
    take: ITEMS_PER_PAGE,
  });

  const totalPages = Math.ceil(totalRequests / ITEMS_PER_PAGE);

  return (
    <main className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">My Fuel Requests</h1>

      <div className="flex gap-10 items-center mb-6">
        <Link href="/transport" className="text-blue-600 hover:underline">
          &larr; Back to Dashboard
        </Link>
        <SearchBar />
        <StatusFilter initialStatus={statusQuery || ''} />
      </div>

      {myRequests.length === 0 ? (
        <p>No matching fuel requests found.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y text-sm divide-gray-200  bg-white border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 border-b text-left">Request No.</th>
                  <th className="py-2 px-4 border-b text-left">Vehicle</th>
                  <th className="py-2 px-4 border-b text-left">Driver</th>
                  <th className="py-2 px-4 border-b text-left">
                    Prev Odometer
                  </th>
                  <th className="py-2 px-4 border-b text-left">
                    Current Odometer
                  </th>
                  <th className="py-2 px-4 border-b text-left">Difference</th>
                  <th className="py-2 px-4 border-b text-left">Litres</th>
                  <th className="py-2 px-4 border-b text-left">Status</th>
                  <th className="py-2 px-4 border-b text-left">Submitted At</th>
                  <th className="py-2 px-4 border-b text-left">Quantity</th>

                  <th className="py-2 px-4 border-b text-left">Remark</th>
                </tr>
              </thead>
              <tbody>
                {myRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50 border-b">
                    <td className="py-2 px-4">{request.requestNumber}</td>
                    <td className="py-2 px-4">{request.vehicle.plate}</td>
                    <td className="py-2 px-4">{request.driver.name}</td>
                    <td className="py-2 px-4">{request.previousOdometer}</td>
                    <td className="py-2 px-4">{request.currentOdometer}</td>
                    <td className="py-2 px-4">
                      {request.calculatedDifference}
                    </td>
                    <td className="py-2 px-4">
                      {request.totalLiters.toFixed(2)}
                    </td>
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
                    <td className="py-2 px-4">
                      {format(request.createdAt, 'yyyy-MM-dd HH:mm')}
                    </td>

                    <td className="py-2 px-4">{request.quantity}</td>
                    <td className="py-2 px-4">{request.remark}</td>
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
