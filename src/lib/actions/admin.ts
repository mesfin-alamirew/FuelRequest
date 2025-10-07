// src/app/(protected)/admin/actions.ts
'use server';
import { Parser } from 'json2csv';
import { z } from 'zod';

import {
  PrismaClient,
  Prisma,
  BalanceTransactionType,
  RequestStatusEnum,
  RoleEnum,
  FuelTypeEnum,
} from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { getAuthSession } from '@/lib/auth';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { redirect } from 'next/navigation';

const prisma = new PrismaClient();

const topUpSchema = z.object({
  amount: z.coerce.number().min(0.01, 'Amount must be greater than zero.'),
});

// Define the shape of the state object for useActionState
export type FormState = {
  message: string;
  errors: Record<string, string[]>;
};

const initialState: FormState = {
  message: '',
  errors: {},
};

// Define FormState for useActionState (if you're using it for the UI button)
export type formState = {
  message: string;
  errors: Record<string, string[]>;
};
// Define ActionState type to be used by server actions
type ActionState = {
  message?: string;
  error?: boolean;
};
// Define a schema for the export filters, which are strings from searchParams
const exportFiltersSchema = z.object({
  requestNumber: z.string().optional(),
  plate: z.string().optional(),
  driverId: z.string().optional(),
  status: z.nativeEnum(RequestStatusEnum).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export async function exportReportToCsv(
  filters: z.infer<typeof exportFiltersSchema>
) {
  const session = await getAuthSession();
  if (!session || session.role !== 'ADMIN') {
    return { error: 'Unauthorized.' };
  }

  const whereClause: Prisma.FuelRequestWhereInput = {
    ...(filters.requestNumber && {
      requestNumber: { contains: filters.requestNumber },
    }),
    ...(filters.plate && {
      vehicle: { plate: { contains: filters.plate, mode: 'insensitive' } },
    }),
    ...(filters.driverId && { driverId: parseInt(filters.driverId) }),
    ...(filters.status && { status: filters.status as RequestStatusEnum }),
    ...(filters.startDate &&
      filters.endDate && {
        createdAt: {
          gte: new Date(filters.startDate),
          lte: new Date(filters.endDate),
        },
      }),
  };

  try {
    const dataToExport = await prisma.fuelRequest.findMany({
      where: whereClause,
      include: {
        vehicle: true,
        focalPerson: true,
        driver: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const fields = [
      'requestNumber',
      'vehicle.plate',
      'driver.name',
      'focalPerson.name',
      'status',
      'currentOdometer',
      'totalLiters',
      'createdAt',
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(dataToExport);

    const base64Data = Buffer.from(csv).toString('base64');
    const downloadUrl = `data:text/csv;base64,${base64Data}`;

    return { downloadUrl };
  } catch (e: unknown) {
    console.error('Failed to export report:', e);
    const errorMessage =
      e instanceof Error ? e.message : 'An unknown error occurred.';
    return { error: `Failed to export report: ${errorMessage}` };
  }
}
export async function topUpBalance(prevState: FormState, formData: FormData) {
  const session = await getAuthSession();
  if (!session || session.role !== 'ADMIN') {
    return { message: 'Unauthorized.', errors: {} };
  }

  const userId = parseInt(session.id);
  if (isNaN(userId)) {
    return { message: 'Invalid user ID.', errors: {} };
  }

  const validatedFields = topUpSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      message: 'Invalid form data.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { amount } = validatedFields.data;

  try {
    await prisma.$transaction(async (tx) => {
      // Update the main Balance record
      await tx.balance.update({
        where: { id: 1 },
        data: {
          currentAmount: {
            increment: amount,
          },
        },
      });

      // Create a new BalanceTransaction record for auditing
      await tx.balanceTransaction.create({
        data: {
          type: BalanceTransactionType.TOP_UP,
          amount,
          balanceId: 1,
          userId,
        },
      });
    });

    revalidatePath('/admin');
    return {
      message: `Successfully added $${amount.toFixed(2)} to the balance.`,
      errors: {},
    };
  } catch (e: unknown) {
    let errorMessage = 'An unexpected error occurred.';
    if (e instanceof Error) {
      errorMessage = e.message;
    }
    return { message: errorMessage, errors: {} };
  }
}
export async function fetchCoupons(
  query: string = '',
  page: number = 1,
  pageSize: number = 10
) {
  const session = await getAuthSession();
  if (!session || session.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  // Calculate the number of items to skip
  const skip = (page - 1) * pageSize;

  // First, get the total count of coupons matching the search query
  const totalCount = await prisma.coupon.count({
    where: {
      couponNumber: {
        contains: query,
        mode: 'insensitive',
      },
    },
  });
  await prisma.coupon.count({
    where: {
      couponNumber: {
        contains: query,
        mode: 'insensitive',
      },
    },
  });

  // Then, get the paginated coupons
  const coupons = await prisma.coupon.findMany({
    where: {
      couponNumber: {
        contains: query,
        mode: 'insensitive',
      },
    },
    orderBy: { id: 'desc' },
    skip,
    take: pageSize,
  });

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    coupons,
    totalPages,
    currentPage: page,
  };
}

/**
 * Fetches users with optional search.
 */
export async function fetchUsers(query: string = '') {
  const session = await getAuthSession();
  if (!session || session.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }
  return prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
      ],
    },
    orderBy: { name: 'asc' },
    include: { department: true },
  });
}

/**
 * Fetches data for the admin dashboard reports.
 */
export async function fetchReports() {
  const session = await getAuthSession();
  if (!session || session.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  try {
    const [balance, totalDeliveredCoupons, fuelConsumption, userCount] =
      await prisma.$transaction([
        prisma.balance.findUnique({ where: { id: 1 } }),
        prisma.couponDelivery.count(),
        prisma.fuelRequest.aggregate({
          _sum: {
            totalLiters: true,
          },
        }),
        prisma.user.count(),
      ]);

    return {
      balance: balance,
      totalDeliveredCoupons,
      totalLitersConsumed: fuelConsumption._sum.totalLiters || 0,
      userCount,
    };
  } catch (error: unknown) {
    console.error('Failed to fetch reports:', error);
    throw new Error('Failed to fetch reports.');
  }
}

/**
 * Fetches departments with optional search.
 */
export async function fetchDepartments(query: string = '') {
  const session = await getAuthSession();
  if (!session || session.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }
  return prisma.department.findMany({
    where: {
      name: {
        contains: query,
        mode: 'insensitive',
      },
    },
    orderBy: { name: 'asc' },
  });
}

// --- Management (CRUD) Functions (Admin) ---

/**
 * Creates a new coupon.
 */
export async function createCoupon(formData: FormData) {
  const session = await getAuthSession();
  if (!session || session.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }
  const couponNumber = formData.get('couponNumber') as string;
  const priceValue = parseFloat(formData.get('priceValue') as string);
  if (!couponNumber || isNaN(priceValue)) {
    throw new Error('Invalid input for coupon creation.');
  }
  try {
    await prisma.coupon.create({
      data: {
        couponNumber,
        priceValue,
      },
    });
    revalidatePath('/admin/manage-coupons');
  } catch (error: unknown) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new Error('Coupon number already exists.');
    }
    console.error('Failed to create coupon:', error);
    throw new Error('Failed to create coupon due to an unexpected error.');
  }
}

export async function getCouponById(id: number) {
  const session = await getAuthSession();
  if (!session || session.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  const coupon = await prisma.coupon.findUnique({
    where: {
      id: id,
    },
  });

  return coupon;
}

/**
 * Updates an existing coupon.
 */
export async function updateCoupon(
  id: number,
  initialState: unknown,
  formData: FormData
) {
  const session = await getAuthSession();
  if (!session || session.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  // 1. Extract and parse data from the FormData object
  const couponNumber = formData.get('couponNumber') as string;
  const priceValueString = formData.get('priceValue') as string;
  const isDelivered = formData.get('isDelivered') === 'on';
  const priceValue = parseFloat(priceValueString);

  // 2. Perform server-side validation
  if (!couponNumber || isNaN(priceValue)) {
    return {
      message: 'Invalid input. Please check your fields.',
      errors: {
        couponNumber: !couponNumber ? 'Coupon number is required.' : null,
        priceValue: isNaN(priceValue) ? 'Price value must be a number.' : null,
      },
    };
  }

  // 3. Update the coupon in your database using Prisma
  try {
    await prisma.coupon.update({
      where: { id: id },
      data: {
        couponNumber: couponNumber,
        priceValue: priceValue,
        isDelivered: isDelivered,
      },
    });
  } catch (error) {
    console.error('Failed to update coupon:', error);
    return { message: 'Failed to update coupon.' };
  }

  // 4. Revalidate the path and redirect on success
  revalidatePath('/coupons'); // Revalidate the coupons list page to show updated data
  redirect('/admin/manage-coupons');
}

/**
 * Deletes a coupon.
 */
export async function deleteCoupon(couponId: number) {
  const session = await getAuthSession();
  if (!session || session.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }
  try {
    await prisma.coupon.delete({ where: { id: couponId } });
    revalidatePath('/admin/manage-coupons');
  } catch (error) {
    throw new Error('Failed to delete coupon.');
  }
}

/**
 * Creates a new department.
 */
export async function createDepartment(formData: FormData) {
  const session = await getAuthSession();
  if (!session || session.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }
  const name = formData.get('name') as string;
  if (!name) throw new Error('Department name is required.');
  try {
    await prisma.department.create({ data: { name } });
    revalidatePath('/admin/manage-departments');
  } catch (error: unknown) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new Error('Department name already exists.');
    }
    console.error('Failed to create department:', error);
    throw new Error('Failed to create department due to an unexpected error.');
  }
}

/**
 * Updates an existing department.
 */
export async function updateDepartment(
  departmentId: number,
  formData: FormData
) {
  const session = await getAuthSession();
  if (!session || session.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }
  const name = formData.get('name') as string;
  if (!name) throw new Error('Department name is required.');
  try {
    await prisma.department.update({
      where: { id: departmentId },
      data: { name },
    });
    revalidatePath('/admin/manage-departments');
  } catch (error: unknown) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new Error('Department name already exists.');
    }
    console.error('Failed to update department:', error);
    throw new Error('Failed to update department due to an unexpected error.');
  }
}

/**
 * Deletes a department.
 */
export async function deleteDepartment(departmentId: number) {
  const session = await getAuthSession();
  if (!session || session.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }
  try {
    // Before deleting a department, you might want to handle dependent records (e.g., set foreign key to null).
    await prisma.department.delete({ where: { id: departmentId } });
    revalidatePath('/admin/manage-departments');
  } catch (error) {
    throw new Error('Failed to delete department.');
  }
}

/**
 * Creates a new user.
 */
export async function createUser(formData: FormData) {
  const session = await getAuthSession();
  if (!session || session.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;

  const roleString = formData.get('role') as string;
  const validRoles = Object.values(RoleEnum) as string[];
  if (!validRoles.includes(roleString)) {
    throw new Error('Invalid user role provided.');
  }
  const role = roleString as RoleEnum;
  const departmentIdString = formData.get('departmentId') as string;
  const departmentId = departmentIdString
    ? parseInt(departmentIdString, 10)
    : null;
  if (!name || !email) {
    throw new Error('Name and email are required.');
  }
  try {
    await prisma.user.create({
      data: { name, email, role, departmentId },
    });
    revalidatePath('/admin/manage-users');
  } catch (error: unknown) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new Error('A user with this email already exists.');
    }
    console.error('Failed to create user:', error);
    throw new Error('Failed to create user due to an unexpected error.');
  }
}

/**
 * Updates an existing user.
 */
export async function updateUser(userId: number, formData: FormData) {
  const session = await getAuthSession();
  if (!session || session.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const roleString = formData.get('role') as string;
  const departmentIdString = formData.get('departmentId') as string;

  const validRoles = Object.values(RoleEnum) as string[];
  if (!validRoles.includes(roleString)) {
    throw new Error('Invalid user role provided.');
  }
  const role = roleString as RoleEnum;
  const departmentId = departmentIdString
    ? parseInt(departmentIdString, 10)
    : null;

  if (!name || !email) {
    throw new Error('Name and email are required.');
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { name, email, role, departmentId },
    });
    revalidatePath('/admin/manage-users');
  } catch (error: unknown) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new Error('A user with this email already exists.');
    }
    throw new Error('Failed to update user.');
  }
}

/**
 * Deletes a user.
 */
export async function deleteUser(userId: number) {
  const session = await getAuthSession();
  if (!session || session.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }
  try {
    await prisma.user.delete({ where: { id: userId } });
    revalidatePath('/admin/manage-users');
  } catch (error) {
    throw new Error('Failed to delete user.');
  }
}

/**
 * Fetches vehicles with optional search.
 */
export async function fetchVehicles(query: string = '') {
  const session = await getAuthSession();
  if (!session || session.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  const fuelTypeQuery = Object.values(FuelTypeEnum).includes(
    query as FuelTypeEnum
  )
    ? (query as FuelTypeEnum)
    : undefined;

  // Build the OR conditions in a type-safe way
  const orConditions: Prisma.VehicleWhereInput[] = [];

  if (query) {
    orConditions.push({ plate: { contains: query, mode: 'insensitive' } });
  }

  if (fuelTypeQuery) {
    orConditions.push({ fuelType: { equals: fuelTypeQuery } });
  }

  // Conditionally add the `OR` clause to the final `where` object
  const where: Prisma.VehicleWhereInput =
    orConditions.length > 0 ? { OR: orConditions } : {};

  return prisma.vehicle.findMany({
    where: where,
    orderBy: { plate: 'asc' },
  });
}

/**
 * Creates a new vehicle.
 */
export async function createVehicle(formData: FormData) {
  const session = await getAuthSession();
  if (!session || session.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  const plate = formData.get('plate') as string;
  const fuelType = formData.get('fuelType') as FuelTypeEnum;
  const lastOdometer = parseInt(formData.get('lastOdometer') as string);

  if (
    !plate ||
    !Object.values(FuelTypeEnum).includes(fuelType) ||
    isNaN(lastOdometer)
  ) {
    throw new Error('Invalid input for vehicle creation.');
  }

  try {
    await prisma.vehicle.create({
      data: { plate, fuelType, lastOdometer },
    });
    revalidatePath('/admin/manage-vehicles');
  } catch (error: unknown) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new Error('A vehicle with this plate already exists.');
    }
    throw new Error('Failed to create vehicle.');
  }
}

/**
 * Updates an existing vehicle.
 */
export async function updateVehicle(vehicleId: number, formData: FormData) {
  const session = await getAuthSession();
  if (!session || session.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  const plate = formData.get('plate') as string;
  const fuelType = formData.get('fuelType') as FuelTypeEnum;
  const lastOdometer = parseInt(formData.get('lastOdometer') as string);

  if (
    !plate ||
    !Object.values(FuelTypeEnum).includes(fuelType) ||
    isNaN(lastOdometer)
  ) {
    throw new Error('Invalid input for vehicle update.');
  }

  try {
    await prisma.vehicle.update({
      where: { id: vehicleId },
      data: { plate, fuelType, lastOdometer },
    });
    revalidatePath('/admin/manage-vehicles');
  } catch (error: unknown) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new Error('A vehicle with this plate already exists.');
    }
    throw new Error('Failed to update vehicle.');
  }
}

/**
 * Deletes a vehicle.
 */
export async function deleteVehicle(vehicleId: number) {
  const session = await getAuthSession();
  if (!session || session.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  try {
    // Implement logic to handle related FuelRequests (e.g., prevent deletion if requests exist)
    await prisma.vehicle.delete({ where: { id: vehicleId } });
    revalidatePath('/admin/manage-vehicles');
  } catch (error) {
    throw new Error('Failed to delete vehicle.');
  }
}

export async function getPendingFuelRequestsAdmin() {
  const session = await getAuthSession();
  if (!session || session.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  return await prisma.fuelRequest.findMany({
    where: { status: 'PENDING_ADMIN' },
    include: {
      focalPerson: true,
      vehicle: true,
    },
  });
}

export async function approveRequest(
  initialState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await getAuthSession();
  if (!session || session.role !== 'ADMIN') {
    return { message: 'Unauthorized', error: true };
  }
  const requestId = parseInt(formData.get('requestId') as string, 10);

  try {
    await prisma.fuelRequest.update({
      where: { id: requestId },
      data: {
        status: 'PENDING_STORE',
        approvedById: parseInt(session.id),
        approvedAt: new Date(),
      },
    });
    revalidatePath('/admin/requests');
    revalidatePath('/store-attendant/requests');
    return { message: `Request ${requestId} approved successfully.` };
  } catch (error) {
    return { message: `Failed to approve request ${requestId}.`, error: true };
  }
}

export async function rejectRequest(
  initialState: unknown,
  formData: FormData
): Promise<ActionState> {
  const session = await getAuthSession();
  if (!session || session.role !== 'ADMIN') {
    return { message: 'Unauthorized', error: true };
  }
  const requestId = parseInt(formData.get('requestId') as string, 10);

  try {
    await prisma.fuelRequest.update({
      where: { id: requestId },
      data: { status: 'REJECTED' },
    });
    revalidatePath('/admin/requests');
    revalidatePath('/dashboard'); // Assuming dashboard shows focal person's requests
    return { message: `Request ${requestId} rejected.`, error: true };
  } catch (error) {
    return { message: `Failed to reject request ${requestId}.`, error: true };
  }
}
