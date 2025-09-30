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

import SearchBar from './SearchBar';
import StatusFilter from '@/components/ui/StatusFilter'; // Import the new StatusFilter
import ApproveRequestForm from '@/components/ApproveRequestForm';
import PaginationControls from '@/components/ui/PaginationControls';
import { getAuthSession } from '@/lib/auth';

const prisma = new PrismaClient();
const ITEMS_PER_PAGE = 10;

type ExtendedFuelRequest = FuelRequest & {
  vehicle: Vehicle;
  focalPerson: User;
  driver: Driver;
};

export default async function StorePage({
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

  if (!session || session.role !== 'STORE_ATTENDANT') {
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
    // Only apply the status filter if a specific status is selected.
    ...(statusQuery && { status: statusQuery as RequestStatusEnum }),
    ...(requestNumberQuery && {
      requestNumber: { contains: requestNumberQuery },
    }),
    ...(plateQuery && {
      vehicle: {
        plate: { contains: plateQuery, mode: 'insensitive' as const },
      },
    }),
  };

  const totalRequests = await prisma.fuelRequest.count({ where: whereClause });
  const pendingRequests: ExtendedFuelRequest[] =
    await prisma.fuelRequest.findMany({
      where: whereClause,
      include: { vehicle: true, focalPerson: true, driver: true },
      orderBy: { createdAt: 'asc' },
      skip,
      take: ITEMS_PER_PAGE,
    });

  const totalPages = Math.ceil(totalRequests / ITEMS_PER_PAGE);

  return (
    <main className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Store Attendant Dashboard</h1>
      <div className="flex justify-between items-center mb-6">
        <SearchBar />
        <StatusFilter initialStatus={statusQuery || ''} />
      </div>
      <h2 className="text-2xl font-semibold mb-4">
        {statusQuery ? `${statusQuery} Fuel Requests` : 'Pending Fuel Requests'}
      </h2>
      {pendingRequests.length === 0 ? (
        <p>No pending fuel requests found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b">Request No.</th>
                <th className="py-2 px-4 border-b">Vehicle</th>
                <th className="py-2 px-4 border-b">Driver</th>
                <th className="py-2 px-4 border-b">Focal Person</th>
                <th className="py-2 px-4 border-b">Litres</th>
                <th className="py-2 px-4 border-b">Requested At</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50 text-center">
                  <td className="py-2 px-4 border-b">
                    {request.requestNumber}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {request.vehicle.plate}
                  </td>
                  <td className="py-2 px-4 border-b">{request.driver.name}</td>
                  <td className="py-2 px-4 border-b">
                    {request.focalPerson.name}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {request.totalLiters.toFixed(2)}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {format(request.createdAt, 'yyyy-MM-dd HH:mm')}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {/* Conditionally render the form based on status */}
                    {request.status === RequestStatusEnum.PENDING_STORE ? (
                      <ApproveRequestForm requestId={request.id} />
                    ) : (
                      <span className="text-gray-500">Completed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <PaginationControls currentPage={currentPage} totalPages={totalPages} />{' '}
      {/* TODO: Implement Pagination for Store Attendant */}
    </main>
  );
}
