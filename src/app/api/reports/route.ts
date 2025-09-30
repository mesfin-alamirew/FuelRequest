// app/api/reports/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import {
  DepartmentReport,
  PlateNumberReport,
  DriverReport,
  DateFilter,
} from '@/types/reports';
import {
  fetchTotalCouponValueByDepartment,
  fetchTotalCouponValueByVehicle,
  fetchTotalCouponValueByDriver,
} from '@/lib/services/reportingService';
import { convertToCSV } from '@/lib/utils';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const groupByOption = searchParams.get('groupBy');
  const format = searchParams.get('format');
  const fromDate = searchParams.get('from');
  const toDate = searchParams.get('to');

  try {
    let reportData: DepartmentReport[] | PlateNumberReport[] | DriverReport[];

    const dateFilter: DateFilter = {};
    if (fromDate) {
      dateFilter.gte = new Date(fromDate);
    }
    if (toDate) {
      const endDate = new Date(toDate);
      endDate.setDate(endDate.getDate() + 1); // Add one day to the date
      dateFilter.lt = endDate; // Use 'lt' (less than) to capture the entire day
    }

    switch (groupByOption) {
      case 'department': {
        reportData = await getReportByDepartment(dateFilter);
        break;
      }
      case 'plateNumber': {
        reportData = await getReportByPlateNumber(dateFilter);
        break;
      }
      case 'driver': {
        reportData = await getReportByDriver(dateFilter);
        break;
      }
      default:
        return NextResponse.json(
          { message: 'Invalid or missing groupBy option' },
          { status: 400 }
        );
    }

    if (format === 'csv') {
      const csv = convertToCSV(reportData);
      const filename = `${groupByOption}_report.csv`;
      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

    return NextResponse.json(reportData);
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function getReportByDepartment(
  dateFilter?: DateFilter
): Promise<DepartmentReport[]> {
  const groupedResults = await prisma.fuelRequest.groupBy({
    by: ['departmentId'],
    where: { createdAt: dateFilter },
    _sum: {
      totalLiters: true,
      previousOdometer: true,
      calculatedDifference: true,
    },
    _count: {
      _all: true,
    },
  });

  const departmentIds = groupedResults.map((g) => g.departmentId);
  const departments = await prisma.department.findMany({
    where: { id: { in: departmentIds } },
    select: { id: true, name: true },
  });
  const departmentMap = new Map(departments.map((d) => [d.id, d.name]));

  const totalAmountByDepartment = await fetchTotalCouponValueByDepartment(
    departmentIds
  );

  return groupedResults.map((g) => {
    const totalOdometer =
      (g._sum.previousOdometer || 0) + (g._sum.calculatedDifference || 0);
    const totalLiters = g._sum.totalLiters || 0;
    const totalOdometerPerLiter =
      totalLiters > 0 ? totalOdometer / totalLiters : 0;
    const totalAmount = totalAmountByDepartment.get(g.departmentId) || 0;

    return {
      department: departmentMap.get(g.departmentId) || null,
      totalRequests: g._count._all,
      totalAmount: totalAmount,
      totalOdometer: totalOdometer,
      totalLiters: totalLiters,
      totalOdometerPerLiter: totalOdometerPerLiter,
    };
  });
}

async function getReportByPlateNumber(
  dateFilter?: DateFilter
): Promise<PlateNumberReport[]> {
  const groupedResults = await prisma.fuelRequest.groupBy({
    by: ['vehicleId'],
    where: { createdAt: dateFilter },
    _sum: {
      totalLiters: true,
      previousOdometer: true,
      calculatedDifference: true,
    },
    _count: {
      _all: true,
    },
  });

  const vehicleIds = groupedResults.map((g) => g.vehicleId);
  const vehicles = await prisma.vehicle.findMany({
    where: { id: { in: vehicleIds } },
    select: { id: true, plate: true },
  });
  const vehicleMap = new Map(vehicles.map((v) => [v.id, v.plate]));

  const totalAmountByVehicle = await fetchTotalCouponValueByVehicle(vehicleIds);

  return groupedResults.map((g) => {
    const totalOdometer =
      (g._sum.previousOdometer || 0) + (g._sum.calculatedDifference || 0);
    const totalLiters = g._sum.totalLiters || 0;
    const totalOdometerPerLiter =
      totalLiters > 0 ? totalOdometer / totalLiters : 0;
    const totalAmount = totalAmountByVehicle.get(g.vehicleId) || 0;

    return {
      plateNumber: vehicleMap.get(g.vehicleId) ?? null,
      totalRequests: g._count._all,
      totalAmount: totalAmount,
      totalOdometer: totalOdometer,
      totalLiters: totalLiters,
      totalOdometerPerLiter: totalOdometerPerLiter,
    };
  });
}

async function getReportByDriver(
  dateFilter?: DateFilter
): Promise<DriverReport[]> {
  const groupedResults = await prisma.fuelRequest.groupBy({
    by: ['driverId'],
    where: { createdAt: dateFilter },
    _sum: {
      totalLiters: true,
      previousOdometer: true,
      calculatedDifference: true,
    },
    _count: {
      _all: true,
    },
  });

  const driverIds = groupedResults.map((g) => g.driverId);
  const drivers = await prisma.driver.findMany({
    where: { id: { in: driverIds } },
    select: { id: true, name: true },
  });
  const driverMap = new Map(drivers.map((d) => [d.id, d.name]));

  const totalAmountByDriver = await fetchTotalCouponValueByDriver(driverIds);

  return groupedResults.map((g) => {
    const totalOdometer =
      (g._sum.previousOdometer || 0) + (g._sum.calculatedDifference || 0);
    const totalLiters = g._sum.totalLiters || 0;
    const totalOdometerPerLiter =
      totalLiters > 0 ? totalOdometer / totalLiters : 0;
    const totalAmount = totalAmountByDriver.get(g.driverId) || 0;

    return {
      driverName: driverMap.get(g.driverId) ?? null,
      totalRequests: g._count._all,
      totalAmount: totalAmount,
      totalOdometer: totalOdometer,
      totalLiters: totalLiters,
      totalOdometerPerLiter: totalOdometerPerLiter,
    };
  });
}
