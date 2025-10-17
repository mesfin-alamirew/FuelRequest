// src/app/(protected)/admin/page.tsx

import { PrismaClient } from '@prisma/client';
import BalanceTopUpForm from './BalanceTopUpForm';
import Link from 'next/link';

const prisma = new PrismaClient();

export default async function AdminPage() {
  const balance = await prisma.balance.findUnique({ where: { id: 1 } });

  if (!balance) {
    return (
      <main className="p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <p>Error: Balance record not found. Please seed your database.</p>
      </main>
    );
  }

  return (
    <main className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
      <h1 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
        Admin Dashboard
      </h1>
      <div className="flex justify-between">
        <div className="mb-8">
          <h2 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
            Current Balance
          </h2>
          <p className="text-4xl font-bold text-gray-800 dark:text-white/90">
            ${balance.currentAmount.toFixed(2)}
          </p>
        </div>
        <div className="flex space-x-4">
          <Link
            href="/admin/balance-report"
            className="bg-blue-600 h-fit  text-white p-2 rounded-md"
          >
            View Balance Report
          </Link>
          <Link
            href="/admin/request-report"
            className="bg-blue-600 h-fit text-white p-2 rounded-md"
          >
            View Request Report
          </Link>
        </div>
      </div>

      {/* Low balance warning */}
      {balance.currentAmount < balance.minThreshold && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-8"
          role="alert"
        >
          <strong className="font-bold">Warning!</strong>
          <span className="block sm:inline">
            {' '}
            System balance is below the minimum threshold.
          </span>
        </div>
      )}

      <div className="mb-8 flex justify-between items-center">
        <BalanceTopUpForm />
      </div>
    </main>
  );
}
