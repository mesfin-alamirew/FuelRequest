import { getAuthSession } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';
import EditVehicleRequestForm from '../../EditVehicleRequestForm';

const prisma = new PrismaClient();
export const dynamic = 'force-dynamic';

export default async function EditRequestPage({
  params,
}: {
  params: { id: Promise<string> };
}) {
  // Await the params to get the object with the 'id' property
  const { id } = await params;

  const session = await getAuthSession();
  if (!session || session.role !== 'TRANSPORT_FOCAL') {
    notFound();
  }

  // Use the destructured 'id' directly
  const requestId = parseInt(id as unknown as string, 10);
  if (isNaN(requestId)) notFound();

  // Fetch the existing fuel request, vehicle, drivers, and departments
  const request = await prisma.fuelRequest.findUnique({
    where: {
      id: requestId,
      focalPersonId: parseInt(session.id),
      status: 'REJECTED',
    },
  });

  if (!request) notFound();

  // const vehicle = await prisma.vehicle.findUnique({
  //   where: { id: request.vehicleId },
  // });
  const vehicles = await prisma.vehicle.findMany();
  const drivers = await prisma.driver.findMany();
  const departments = await prisma.department.findMany();

  // Fetch or calculate other required data
  // const fuelPrice = await prisma.fuelPrice.findUnique({
  //   where: { type: request.fuelType },
  // });
  // const couponValue = (await prisma.coupon.findFirst())?.priceValue || 0;
  // const liter = fuelPrice ? couponValue / fuelPrice.price : 0;

  const fuelPrice = await prisma.fuelPrice.findFirst({
    where: {
      type: request.fuelType,
    },
  });
  const liter = fuelPrice?.price;

  const couponValue = await prisma.couponValue.findMany();

  // if (!vehicle || !fuelPrice) notFound();

  return (
    <EditVehicleRequestForm
      vehicles={vehicles}
      drivers={drivers}
      departments={departments}
      liter={liter || 0}
      couponValue={couponValue[0].value}
      request={request}
    />
  );
}
