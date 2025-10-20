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
import DeleteRequestButton from './delete-request-button';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90 ">
        My Fuel Requests
      </h2>

      <div className="flex gap-10 items-center mb-6">
        <Link href="/transport" className="text-blue-600 hover:underline">
          &larr; Back to Dashboard
        </Link>

        <SearchBar />
        <StatusFilter initialStatus={statusQuery || ''} />
      </div>

      {myRequests.length === 0 ? (
        <p className="text-base font-medium text-gray-800 dark:text-white/90 ">
          No matching fuel requests found.
        </p>
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <div className="min-w-[1102px]">
                <Table>
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Request No.
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Vehicle
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Driver
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Prev Odometer
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Current Odometer
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Difference
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Litres
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
                        Submitted At
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Quantity
                      </TableCell>

                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        Remark
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        <span className="sr-only ">Actions</span>
                      </TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {myRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          {request.requestNumber}
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          {request.vehicle.plate}
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          {request.driver.name}
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          {request.previousOdometer}
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          {request.currentOdometer}
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          {request.calculatedDifference}
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          {request.totalLiters.toFixed(2)}
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
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
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          {format(request.createdAt, 'yyyy-MM-dd HH:mm')}
                        </TableCell>

                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          {request.quantity}
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          {request.remark}
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          {request.status === 'REJECTED' && (
                            <div className="flex space-x-2">
                              <Link
                                href={`/transport/my-requests/${request.id}/edit`}
                              >
                                <button className="text-blue-600 hover:text-blue-900">
                                  Edit
                                </button>
                              </Link>
                              <DeleteRequestButton requestId={request.id} />
                            </div>
                          )}
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
