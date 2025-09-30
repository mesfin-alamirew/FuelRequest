// src/app/actions/requests.ts
'use server';

import {
  BalanceTransactionType,
  PrismaClient,
  RequestStatusEnum,
} from '@prisma/client';
// import { getSession } from '@/lib/session'; // Use the session from the server
import { revalidatePath } from 'next/cache';
import { getAuthSession } from '../auth'; // Use the session from the server
import z from 'zod';
import { redirect } from 'next/navigation';

const prisma = new PrismaClient();

// Define the shape of the state object for useFormState

const formStateSchema = z.object({
  message: z.string().nullable(),
  // Provide z.string() as the key schema for the record
  errors: z.record(z.string(), z.string().array()).optional(),
});

// Zod schema for input validation
const createRequestSchema = z.object({
  plate: z.string().nonempty('Vehicle plate is required.'),
  currentOdometer: z.coerce
    .number()
    .int()
    .min(1, 'Current odometer must be a positive number.'),
  driverId: z.coerce.number().int({ message: 'Driver ID must be a number.' }),
  departmentId: z.coerce
    .number()
    .int({ message: 'Department ID must be a number.' }),
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1.'),
  remark: z.string(),
});
// Define the shape of the state object for useActionState
export type FormState = {
  message: string;
  errors: Record<string, string[]>;
};
// Zod schema for updating request status
const updateRequestStatusSchema = z.object({
  requestId: z.coerce.number().int({ message: 'Request ID must be a number.' }),
});

const initialState: FormState = {
  message: '',
  errors: {},
};
// Function to safely redirect with existing filters and new toast
function redirectWithToast(
  path: string,
  type: string,
  message: string,
  existingSearchParams?: URLSearchParams
) {
  const params = existingSearchParams || new URLSearchParams();
  params.set('toast', type);
  params.set('message', message);
  redirect(`${path}?${params.toString()}`);
}

function generateNextRequestNumber(prevRequestNumber: string): string {
  const currentYear = new Date().getFullYear();

  // 1. Split the string to get the numeric part and the year.
  const parts = prevRequestNumber.split('-');

  // Check if the input format is valid.
  if (parts.length !== 2) {
    throw new Error(
      'Invalid request number format. Expected format: "YYYY-NNNN"'
    );
  }

  const numericPart = parts[1];
  const prevYear = parts[0];

  // Check if the year in the previous request number is the current year.
  // If not, you might want to reset the sequence, but for now, we'll assume it's the same year.
  if (prevYear !== String(currentYear)) {
    console.warn(
      `The previous year (${prevYear}) does not match the current year (${currentYear}). The sequence will continue with the new year.`
    );
  }

  // 2. Convert to number and increment.
  const nextNumber = parseInt(numericPart, 10) + 1;
  const paddingLength = numericPart.length;

  // 3. Pad the new number with leading zeros to match the original length.
  const nextNumericPart = String(nextNumber).padStart(paddingLength, '0');

  // 4. Combine the year with the new padded number.
  const nextRequestNumber = `${currentYear}-${nextNumericPart}`;

  return nextRequestNumber;
}
// The `validateAzureToken` and `token` parameter are no longer needed.
export async function createFuelRequest(
  prevState: unknown,
  formData: FormData
) {
  const session = await getAuthSession();
  if (!session || session.role !== 'TRANSPORT_FOCAL') {
    return { message: 'Unauthorized.', errors: {} };
  }

  const focalPersonId = parseInt(session.id);
  if (isNaN(focalPersonId)) {
    return { message: 'Invalid focal person ID.', errors: {} };
  }

  const validatedFields = createRequestSchema.safeParse(
    Object.fromEntries(formData.entries())
  );
  console.log('DDD', validatedFields);

  if (!validatedFields.success) {
    return {
      message: 'Invalid form data.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { plate, currentOdometer, driverId, quantity, departmentId, remark } =
    validatedFields.data;

  try {
    const newRequest = await prisma.$transaction(async (tx) => {
      const vehicle = await tx.vehicle.findUnique({ where: { plate } });
      if (!vehicle) {
        throw new Error('Vehicle not found.');
      }
      if (currentOdometer <= vehicle.lastOdometer) {
        throw new Error('Current odometer must be greater than previous.');
      }

      const driver = await tx.driver.findUnique({ where: { id: driverId } });
      if (!driver) {
        throw new Error('Driver not found.');
      }

      const fuelPrice = await tx.fuelPrice.findUnique({
        where: { type: vehicle.fuelType },
      });
      if (!fuelPrice) {
        throw new Error('Fuel price not found.');
      }

      const totalLiters = quantity * fuelPrice.price;
      const latestRequest = await tx.fuelRequest.findFirst({
        orderBy: { createdAt: 'desc' },
      });

      const startingRequestNumber = await prisma.startingNumber.findMany();
      const nextRequestNumber = latestRequest
        ? generateNextRequestNumber(latestRequest.requestNumber)
        : generateNextRequestNumber(startingRequestNumber[0].value.toString());

      const createdRequest = await tx.fuelRequest.create({
        data: {
          requestNumber: nextRequestNumber,
          vehicleId: vehicle.id, // Correctly establishes the relation
          driverId: driver.id,
          departmentId: departmentId,
          focalPersonId: focalPersonId, // Use the parsed ID
          currentOdometer,
          previousOdometer: vehicle.lastOdometer,
          calculatedDifference: currentOdometer - vehicle.lastOdometer,
          quantity,
          fuelType: vehicle.fuelType,
          totalLiters,
          status: RequestStatusEnum.PENDING_STORE,
          remark,
        },
      });

      await tx.vehicle.update({
        where: { id: vehicle.id },
        data: { lastOdometer: currentOdometer },
      });

      return createdRequest;
    });

    // revalidatePath('/requests/deliver');
    redirect(
      `/transport?toast=success&message=Fuel request #${newRequest.requestNumber} submitted.`
    );
  } catch (e: unknown) {
    // Handle redirect for errors
    let errorMessage = 'An unexpected error occurred.';
    if (e instanceof Error) {
      errorMessage = e.message;
    }
    redirect(`/transport?toast=error&message=${errorMessage}`);
  }
}
export async function updateRequestStatus(
  prevState: FormState,
  formData: FormData
) {
  const session = await getAuthSession();
  if (!session || session.role !== 'STORE_ATTENDANT') {
    return { message: 'Unauthorized.', errors: {} };
  }

  const deliveredById = parseInt(session.id);
  if (isNaN(deliveredById)) {
    return { message: 'Invalid store attendant ID.', errors: {} };
  }

  const validatedFields = updateRequestStatusSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      message: 'Invalid form data.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { requestId } = validatedFields.data;

  try {
    const updatedRequest = await prisma.$transaction(async (tx) => {
      // 1. Fetch the fuel request to get the required quantity
      const fuelRequest = await tx.fuelRequest.findUnique({
        where: { id: requestId },
        // Use `count` on `couponDeliveries` to ensure none have been delivered yet
        include: { _count: { select: { couponDeliveries: true } } },
      });

      if (!fuelRequest) {
        throw new Error('Fuel request not found.');
      }

      // Check if any coupons have already been delivered
      if (fuelRequest._count.couponDeliveries > 0) {
        throw new Error(
          'Coupons have already been delivered for this request.'
        );
      }

      const { quantity } = fuelRequest;
      if (quantity === 0) {
        throw new Error('Request quantity is zero. No coupons to deliver.');
      }

      // 2. Find the required number of available coupons
      const availableCoupons = await tx.coupon.findMany({
        where: { isDelivered: false },
        take: quantity,
        orderBy: { id: 'asc' },
      });

      if (availableCoupons.length < quantity) {
        throw new Error(
          `Insufficient coupons available. Requested: ${quantity}, Available: ${availableCoupons.length}`
        );
      }

      // 3. Check and decrement the system balance
      const balance = await tx.balance.findUnique({ where: { id: 1 } });
      if (!balance) {
        throw new Error('System balance record not found.');
      }

      const totalCouponValue = availableCoupons.reduce(
        (sum, coupon) => sum + coupon.priceValue,
        0
      );

      if (balance.currentAmount < totalCouponValue) {
        throw new Error(
          'Insufficient funds in the system balance to issue coupons.'
        );
      }

      await tx.balance.update({
        where: { id: 1 },
        data: {
          currentAmount: {
            decrement: totalCouponValue,
          },
        },
      });

      // 4. Create multiple CouponDelivery and BalanceTransaction records
      const newDeliveries = availableCoupons.map((coupon) => ({
        couponId: coupon.id,
        requestId: fuelRequest.id,
        deliveredById,
      }));

      const deliveries = await tx.couponDelivery.createManyAndReturn({
        data: newDeliveries,
      });

      await tx.balanceTransaction.createMany({
        data: availableCoupons.map((coupon, index) => ({
          type: BalanceTransactionType.COUPON_DEDUCTION,
          amount: -coupon.priceValue,
          balanceId: 1,
          userId: deliveredById,
          couponDeliveryId: deliveries[index].id, // Link to the newly created delivery
        })),
      });

      // 5. Update multiple coupons to mark them as delivered
      await tx.coupon.updateMany({
        where: { id: { in: availableCoupons.map((c) => c.id) } },
        data: { isDelivered: true },
      });

      // 6. Update the fuel request status
      const result = await tx.fuelRequest.update({
        where: { id: fuelRequest.id },
        data: { status: RequestStatusEnum.COMPLETED },
      });

      return result;
    });

    revalidatePath('/store');
    redirect(
      `/store?toast=success&message=Request #${updatedRequest.requestNumber} approved with coupons.`
    );
  } catch (e: unknown) {
    let errorMessage = 'An unexpected error occurred.';
    if (e instanceof Error) {
      errorMessage = e.message;
    }
    redirect(`/store?toast=error&message=${errorMessage}`);
  }
}

// export async function updateRequestStatus(
//   prevState: FormState,
//   formData: FormData
// ) {
//   const session = await getAuthSession();
//   if (!session || session.role !== 'STORE_ATTENDANT') {
//     return { message: 'Unauthorized.', errors: {} };
//   }

//   const deliveredById = parseInt(session.id);
//   if (isNaN(deliveredById)) {
//     return { message: 'Invalid store attendant ID.', errors: {} };
//   }

//   const validatedFields = updateRequestStatusSchema.safeParse(
//     Object.fromEntries(formData.entries())
//   );

//   if (!validatedFields.success) {
//     return {
//       message: 'Invalid form data.',
//       errors: validatedFields.error.flatten().fieldErrors,
//     };
//   }

//   const { requestId } = validatedFields.data;

//   try {
//     const updatedRequest = await prisma.$transaction(async (tx) => {
//       const fuelRequest = await tx.fuelRequest.findUnique({
//         where: { id: requestId },
//         include: { couponDelivery: true },
//       });

//       if (!fuelRequest) {
//         throw new Error('Fuel request not found.');
//       }
//       if (fuelRequest.couponDelivery) {
//         throw new Error('Coupon already delivered for this request.');
//       }

//       const availableCoupon = await tx.coupon.findFirst({
//         where: { isDelivered: false },
//         orderBy: { id: 'asc' },
//       });

//       if (!availableCoupon) {
//         throw new Error('No coupons available for delivery.');
//       }

//       const balance = await tx.balance.findUnique({
//         where: { id: 1 },
//       });

//       if (!balance) {
//         throw new Error('System balance record not found.');
//       }

//       if (balance.currentAmount < availableCoupon.priceValue) {
//         throw new Error('Insufficient funds to issue coupon.');
//       }

//       const newCouponDelivery = await tx.couponDelivery.create({
//         data: {
//           couponId: availableCoupon.id,
//           requestId: fuelRequest.id,
//           deliveredById,
//         },
//       });

//       await tx.balance.update({
//         where: { id: 1 },
//         data: {
//           currentAmount: {
//             decrement: availableCoupon.priceValue,
//           },
//         },
//       });

//       await tx.balanceTransaction.create({
//         data: {
//           type: BalanceTransactionType.COUPON_DEDUCTION,
//           amount: -availableCoupon.priceValue,
//           balanceId: 1,
//           userId: deliveredById,
//           couponDeliveryId: newCouponDelivery.id,
//         },
//       });

//       await tx.coupon.update({
//         where: { id: availableCoupon.id },
//         data: { isDelivered: true },
//       });

//       const result = await tx.fuelRequest.update({
//         where: { id: fuelRequest.id },
//         data: { status: RequestStatusEnum.COMPLETED },
//       });

//       return result;
//     });

//     revalidatePath('/store');
//     redirect(
//       `/store?toast=success&message=Request #${updatedRequest.requestNumber} approved.`
//     );
//   } catch (e: unknown) {
//     let errorMessage = 'An unexpected error occurred.';
//     if (e instanceof Error) {
//       errorMessage = e.message;
//     }
//     redirect(`/store?toast=error&message=${errorMessage}`);
//   }
// }
export async function fetchDrivers() {
  const session = await getAuthSession();

  if (!session || session.role !== 'TRANSPORT_FOCAL') {
    throw new Error('Unauthorized');
  }

  try {
    const drivers = await prisma.driver.findMany({
      orderBy: { name: 'asc' },
      // include: { department: true },
    });
    return drivers;
  } catch (error) {
    console.error('Failed to fetch drivers:', error);
    throw new Error('Failed to retrieve drivers.');
  }
}
