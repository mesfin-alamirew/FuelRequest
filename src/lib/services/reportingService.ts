// services/reportingService.ts
import { DateFilter } from '@/types/reports';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fetchTotalCouponValueInternal(
  foreignKey: 'vehicleId' | 'driverId' | 'departmentId',
  ids: number[],
  dateFilter?: DateFilter // Add date filter
): Promise<Map<number, number>> {
  const couponDeliveries = await prisma.couponDelivery.findMany({
    where: {
      fuelRequest: {
        [foreignKey]: { in: ids },
        createdAt: dateFilter, // Add the date filter here
      },
    },
    include: {
      coupon: { select: { priceValue: true } },
      fuelRequest: {
        select: { vehicleId: true, driverId: true, departmentId: true },
      },
    },
  });

  const aggregatedValues = new Map<number, number>();

  for (const delivery of couponDeliveries) {
    let key: number | undefined | null;

    // Use a switch statement for clear, type-safe key access
    switch (foreignKey) {
      case 'departmentId':
        key = delivery.fuelRequest.departmentId;
        break;
      case 'vehicleId':
        key = delivery.fuelRequest.vehicleId;
        break;
      case 'driverId':
        key = delivery.fuelRequest.driverId;
        break;
      default:
        // This case should not be reached due to TypeScript type-checking
        continue;
    }

    if (key !== undefined && key !== null) {
      const currentTotal = aggregatedValues.get(key) || 0;
      aggregatedValues.set(key, currentTotal + delivery.coupon.priceValue);
    }
  }

  return aggregatedValues;
}

export async function fetchTotalCouponValueByDepartment(
  ids: number[],
  dateFilter?: DateFilter
) {
  return fetchTotalCouponValueInternal('departmentId', ids, dateFilter);
}

export async function fetchTotalCouponValueByVehicle(
  ids: number[],
  dateFilter?: DateFilter
) {
  return fetchTotalCouponValueInternal('vehicleId', ids, dateFilter);
}

export async function fetchTotalCouponValueByDriver(
  ids: number[],
  dateFilter?: DateFilter
) {
  return fetchTotalCouponValueInternal('driverId', ids, dateFilter);
}
