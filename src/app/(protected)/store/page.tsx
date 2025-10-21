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
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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
    <main className="p-8 max-w-6xl mx-auto text-sm">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
        Store Attendant Dashboard
      </h2>
      <div className="flex gap-10  justify-between items-center mb-6">
        <SearchBar />
        <StatusFilter initialStatus={statusQuery || ''} />
      </div>
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
        {statusQuery ? `${statusQuery} Fuel Requests` : 'Pending Fuel Requests'}
      </h2>
      {pendingRequests.length === 0 ? (
        <p className="text-base font-medium text-gray-800 dark:text-white/90 ">
          No pending fuel requests found.
        </p>
      ) : (
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
                      Focal Person
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
                      Requested At
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
                  {pendingRequests.map((request) => (
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
                        {request.focalPerson.name}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {request.totalLiters.toFixed(2)}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {format(request.createdAt, 'yyyy-MM-dd HH:mm')}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {/* Conditionally render the form based on status */}
                        {request.status === RequestStatusEnum.PENDING_STORE ? (
                          <ApproveRequestForm requestId={request.id} />
                        ) : (
                          <span className="text-gray-500">Completed</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}
      <PaginationControls currentPage={currentPage} totalPages={totalPages} />{' '}
      {/* TODO: Implement Pagination for Store Attendant */}
    </main>
  );
}
