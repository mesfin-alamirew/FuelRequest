// src/components/Sidebar.tsx
'use client';

import { useSession } from '@/providers/SessionProvider';
// import { useMsal } from '@azure/msal-react';
import Link from 'next/link';

export default function Sidebar() {
  // const { accounts } = useMsal();
  const { session } = useSession();
  // const userRole = accounts?.[0]?.idTokenClaims?.roles?.[0]; // Assuming role is in claims

  return (
    <aside className="w-64 bg-gray-800 text-white p-4 flex-none sticky top-0 h-screen overflow-y-auto">
      <div className="text-2xl font-bold mb-6">Fuel System</div>
      <nav>
        <ul>
          {(session?.role as string) === 'ADMIN' && (
            <>
              <li>
                <Link
                  href="/dashboard"
                  className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/manage-users"
                  className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700"
                >
                  Users
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/manage-departments"
                  className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700"
                >
                  Departments
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/manage-coupons"
                  className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700"
                >
                  Coupons
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/manage-vehicles"
                  className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700"
                >
                  Vehicles
                </Link>
              </li>
            </>
          )}
          {(!session || (session?.role as string)) === 'TRANSPORT_FOCAL' && (
            <li>
              <Link
                href="/transport"
                className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700"
              >
                Fuel Request
              </Link>
            </li>
          )}
          {(session?.role as string) === 'STORE_ATTENDANT' && (
            <li>
              <Link
                href="/store"
                className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700"
              >
                Deliver Coupon
              </Link>
            </li>
          )}
          {(session?.role as string) === 'ADMIN' && (
            <li>
              <Link
                href="/admin"
                className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700"
              >
                Reports
              </Link>
            </li>
          )}
        </ul>
      </nav>
    </aside>
  );
}
