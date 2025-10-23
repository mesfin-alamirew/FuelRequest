// src/app/page.tsx

import { AuthButtons } from '@/components/AuthButtons';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { getAuthSession } from '@/lib/auth';
import Link from 'next/link';

export default async function HomePage() {
  const session = await getAuthSession();

  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          FUEL REQUISITION MANAGEMENT SYSTEM
        </h2>
        {session ? (
          <div className="flex flex-col sm:flex-row gap-4 mt-10">
            {session.role === 'TRANSPORT_FOCAL' && (
              <div className="relative  min-h-72  w-[300px] px-4 py-5 bg-red-100 flex flex-col gap-3 rounded-md shadow-[0px_0px_15px_rgba(0,0,0,0.09)]">
                <div className="flex gap-4 flex-col">
                  <h1 className="font-bold text-3xl">TRANSPORT</h1>
                  <p className="text-sm text-gray-500">
                    Focal person in the transport unit who creates request.
                  </p>
                  <Link
                    className="absolute inset-x-1 h-10 p-2 bottom-1  bg-blue-600 text-white text-center rounded-md"
                    href="/transport"
                  >
                    Create Request
                  </Link>
                </div>
              </div>
            )}
            {session.role === 'STORE_ATTENDANT' && (
              <div className="relative min-h-72  w-[300px] px-4 py-5 bg-red-100 flex flex-col gap-3 rounded-md shadow-[0px_0px_15px_rgba(0,0,0,0.09)]">
                <div className="flex gap-4 flex-col">
                  <h1 className="font-bold text-3xl">STORE</h1>
                  <p className="text-sm text-gray-500">
                    Focal person in the store unit who delivers coupons for the
                    requests.
                  </p>
                  <Link
                    className="absolute inset-x-1 h-10 p-2 bottom-1  bg-blue-600 text-white text-center rounded-md"
                    href="/store"
                  >
                    Create Request
                  </Link>
                </div>
              </div>
            )}
            {session.role === 'ADMIN' && (
              <div className="relative min-h-72  w-[300px] px-4 py-5 bg-red-100 flex flex-col gap-3 rounded-md shadow-[0px_0px_15px_rgba(0,0,0,0.09)]">
                <div className="flex gap-4 flex-col ">
                  <h1 className="font-bold text-3xl">ADMIN</h1>
                  <p className="text-sm text-gray-500">
                    A person who manages resources.
                  </p>
                  <Link
                    className="absolute inset-x-1 h-10 p-2 bottom-1  bg-blue-600 text-white text-center rounded-md"
                    href="/admin"
                  >
                    Admin
                  </Link>
                </div>
              </div>
            )}
          </div>
        ) : (
          <AuthButtons />
        )}
      </main>
    </>
  );
}
