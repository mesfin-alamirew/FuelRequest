// src/app/(protected)/admin/balance-actions.ts

'use server';

import { PrismaClient, Prisma, BalanceTransactionType } from '@prisma/client';
import { getAuthSession } from '@/lib/auth';
import { Parser } from 'json2csv';
import { z } from 'zod';

const prisma = new PrismaClient();

const exportFiltersSchema = z.object({
  type: z.nativeEnum(BalanceTransactionType).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export async function exportBalanceReportToCsv(
  filters: z.infer<typeof exportFiltersSchema>
) {
  const session = await getAuthSession();
  if (!session || session.role !== 'ADMIN') {
    return { error: 'Unauthorized.' };
  }

  const whereClause: Prisma.BalanceTransactionWhereInput = {
    ...(filters.type && { type: filters.type }),
    ...(filters.startDate &&
      filters.endDate && {
        createdAt: {
          gte: new Date(filters.startDate),
          lte: new Date(filters.endDate),
        },
      }),
  };

  try {
    const dataToExport = await prisma.balanceTransaction.findMany({
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
    });

    const formattedData = dataToExport.map((t) => ({
      requestNumber:
        t.type === 'COUPON_DEDUCTION'
          ? t.couponDelivery?.fuelRequest.requestNumber
          : 0,
      type: t.type,
      amount: t.amount,
      user: t.user.name,
      date: t.createdAt,
      details:
        t.type === BalanceTransactionType.COUPON_DEDUCTION && t.couponDelivery
          ? `Coupon for Request #${t.couponDelivery.fuelRequest.requestNumber} (${t.couponDelivery.fuelRequest.vehicle.plate})`
          : 'Funds added',
    }));

    const fields = [
      'requestNumber',
      'type',
      'amount',
      'user',
      'date',
      'details',
    ];
    const parser = new Parser({ fields });
    const csv = parser.parse(formattedData);

    const base64Data = Buffer.from(csv).toString('base64');
    const downloadUrl = `data:text/csv;base64,${base64Data}`;

    return { downloadUrl };
  } catch (e: unknown) {
    console.error('Failed to export balance report:', e);
    const errorMessage =
      e instanceof Error ? e.message : 'An unknown error occurred.';
    return { error: `Failed to export balance report: ${errorMessage}` };
  }
}
