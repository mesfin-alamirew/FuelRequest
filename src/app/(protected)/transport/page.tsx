// src/app/(protected)/transport/page.tsx
import { PrismaClient, Driver, Department } from '@prisma/client';
import VehicleRequestForm from '@/components/VehicleRequestForm';

import { Suspense } from 'react';
import VehicleSelectForm from '@/components/VehicleSelectForm';
import Link from 'next/link';

const prisma = new PrismaClient();

export default async function TransportPage({
  searchParams,
}: {
  searchParams?: Promise<{ plate?: string }>;
}) {
  const drivers = await prisma.driver.findMany({ orderBy: { name: 'asc' } });
  const vehicles = await prisma.vehicle.findMany({ orderBy: { plate: 'asc' } });
  const departments = await prisma.department.findMany({
    orderBy: { name: 'asc' },
  });

  const awaitedSearchParams = await searchParams;
  const plate = awaitedSearchParams?.plate as string;

  return (
    <main className="px-8 max-w-4xl mx-auto text-sm">
      <div className="flex items-center justify-between p-2 mb-1 border-b-2 border-b-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          Fuel Request Form
        </h2>

        <Link
          href="/transport/my-requests"
          className="bg-blue-600 text-white py-2 px-4 rounded-md"
        >
          View My Requests
        </Link>
      </div>
      <section className="mb-8 pt-4 flex gap-4 flex-col">
        <h2 className="text-sm  mb-4 font-semibold text-gray-800 dark:text-white/90">
          Select Vehicle
        </h2>
        <VehicleSelectForm vehicles={vehicles} /> {/* Use new component */}
      </section>

      {plate && (
        <Suspense
          fallback={
            <div className="text-base font-medium text-gray-800 dark:text-white/90">
              Loading vehicle details...
            </div>
          }
        >
          <VehicleDetails
            vehiclePlate={plate}
            drivers={drivers}
            departments={departments}
          />
        </Suspense>
      )}
    </main>
  );
}

async function VehicleDetails({
  vehiclePlate,
  drivers,
  departments,
}: {
  vehiclePlate: string;
  drivers: Driver[];
  departments: Department[];
}) {
  const vehicle = await prisma.vehicle.findUnique({
    where: { plate: vehiclePlate },
  });
  let liter;
  if (!vehicle) {
    return (
      <h2 className="text-base font-medium text-gray-800 dark:text-white/90">
        Vehicle with plate {vehiclePlate} not found.
      </h2>
    );
  } else {
    const fuelPrice = await prisma.fuelPrice.findFirst({
      where: {
        type: vehicle.fuelType,
      },
    });
    liter = fuelPrice?.price;
  }
  const couponValue = await prisma.couponValue.findMany();
  return (
    <VehicleRequestForm
      vehicle={vehicle}
      drivers={drivers}
      departments={departments}
      liter={liter || 0}
      couponValue={couponValue[0].value}
    />
  );
}
