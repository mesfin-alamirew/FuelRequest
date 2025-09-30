// src/app/actions/store.ts
'use server';

import { PrismaClient, RequestStatusEnum } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { getAuthSession } from '../auth';

const prisma = new PrismaClient();

/**
 * Fetches all pending fuel requests for the store keeper.
 * @returns A list of pending fuel requests.
 */
export async function fetchPendingRequests() {
  const session = await getAuthSession();

  // 1. Authorization check: Only a store attendant can view this data.
  if (!session || session.role !== 'STORE_ATTENDANT') {
    throw new Error('Unauthorized');
  }

  try {
    const pendingRequests = await prisma.fuelRequest.findMany({
      where: {
        status: RequestStatusEnum.PENDING_STORE,
      },
      include: {
        vehicle: true,
        driver: true,
        department: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
    return pendingRequests;
  } catch (error) {
    console.error('Failed to fetch pending requests:', error);
    throw new Error('Failed to fetch pending requests.');
  }
}

/**
 * Handles the delivery of a coupon for a specific fuel request.
 * This is an interactive transaction to ensure data integrity.
 * @param requestId The ID of the fuel request.
 * @param couponNumber The number of the coupon being delivered.
 */
export async function deliverCoupon(requestId: number, couponNumber: string) {
  const session = await getAuthSession();

  // 1. Authorization check: Only a store attendant can deliver coupons.
  if (!session || session.role !== 'STORE_ATTENDANT') {
    throw new Error('Unauthorized');
  }

  // Use a Prisma transaction to ensure all operations are atomic.
  try {
    await prisma.$transaction(async (tx) => {
      // 2. Find and validate the coupon.
      const coupon = await tx.coupon.findUnique({
        where: { couponNumber },
      });

      if (!coupon || coupon.isDelivered) {
        throw new Error('Invalid or already delivered coupon.');
      }

      // 3. Find and validate the request.
      const request = await tx.fuelRequest.findUnique({
        where: { id: requestId },
      });

      if (!request) {
        throw new Error('Fuel request not found.');
      }

      if (request.status !== RequestStatusEnum.PENDING_STORE) {
        throw new Error('This request is not pending for coupon delivery.');
      }

      // 4. Update the balance.
      const updatedBalance = await tx.balance.update({
        where: { id: 1 }, // Assuming a singleton balance record with ID 1
        data: { currentAmount: { decrement: coupon.priceValue } },
      });

      // 5. Check for low balance and log a warning.
      if (updatedBalance.currentAmount < updatedBalance.minThreshold) {
        console.warn(
          'LOW BALANCE ALERT: Store balance is below the minimum threshold.'
        );
        // In a real application, you'd trigger a proper notification system here (e.g., email, push).
      }

      // 6. Mark the coupon as delivered.
      const updatedCoupon = await tx.coupon.update({
        where: { id: coupon.id },
        data: { isDelivered: true },
      });

      // 7. Create the coupon delivery record.
      await tx.couponDelivery.create({
        data: {
          couponId: updatedCoupon.id,
          requestId: request.id,
          deliveredById: parseInt(session.id), // Use the user ID from the session
        },
      });

      // 8. Update the fuel request status.
      await tx.fuelRequest.update({
        where: { id: request.id },
        data: { status: RequestStatusEnum.COMPLETED },
      });
    });

    // 9. Revalidate the page to update the UI.
    revalidatePath('/requests/deliver');
  } catch (error: unknown) {
    console.error('Coupon delivery failed:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to deliver coupon: ${error.message}`);
    }
    throw new Error('An unknown error occurred during coupon delivery.');
  }
}
