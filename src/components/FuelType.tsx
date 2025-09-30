import { PrismaClient } from '@prisma/client';
import React from 'react';

const prisma = new PrismaClient();

export default async function FuelType() {
  const fuelTypes = await prisma.fuelPrice.findMany();

  return (
    <div>
      <label className="mb-1">Fuel Type</label>
      <select name="type" className="border border-gray-200 p-2 rounded-md">
        <option value="">All Vehicles</option>
        {fuelTypes.map((f) => (
          <option key={f.id} value={f.type}>
            {f.type}
          </option>
        ))}
      </select>
    </div>
  );
}
