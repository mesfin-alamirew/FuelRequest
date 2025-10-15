// src/components/Sidebar.tsx
'use client';

import { useSession } from '@/providers/SessionProvider';
import { X } from 'lucide-react';
// import { useMsal } from '@azure/msal-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}
export default function Sidebar({ isOpen, toggleSidebar }: SidebarProps) {
  const pathname = usePathname();

  // const { accounts } = useMsal();
  const { session } = useSession();
  // const userRole = accounts?.[0]?.idTokenClaims?.roles?.[0]; // Assuming role is in claims

  return (
    <div className="bg-gray-800 min-h-screen text-white">
      <div
        className={`${
          isOpen
            ? 'fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden'
            : 'hidden'
        }`}
        onClick={toggleSidebar}
      />
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 transform shadow-md transition-transform duration-300 dark:bg-gray-900 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between px-4 lg:justify-center">
          <h1 className="text-2xl font-bold text-blue-600">TRANSPORT</h1>
          <button onClick={toggleSidebar} className="text-gray-500 lg:hidden">
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="p-4">
          <ul>
            {(session?.role as string) === 'ADMIN' && (
              <>
                <li>
                  <Link
                    href="/dashboard"
                    className={`flex items-center space-x-2 py-2.5 px-4 rounded-lg transition-colors duration-200 ${
                      pathname === '/dashboard'
                        ? 'bg-gray-600 text-white'
                        : 'text-gray-600 hover:bg-gray-600 hover:text-white dark:text-gray-400 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span>Dashboard</span>
                  </Link>
                </li>

                <li>
                  <Link
                    href="/admin/manage-users"
                    className={`flex items-center space-x-2 py-2.5 px-4 rounded-lg transition-colors duration-200 ${
                      pathname === '/admin/manage-users'
                        ? 'bg-gray-600 text-white'
                        : 'text-gray-600 hover:bg-gray-600 hover:text-white dark:text-gray-400 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span>Users</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/manage-departments"
                    className={`flex items-center space-x-2 py-2.5 px-4 rounded-lg transition-colors duration-200 ${
                      pathname === '/admin/manage-departments'
                        ? 'bg-gray-600 text-white'
                        : 'text-gray-600 hover:bg-gray-600 hover:text-white dark:text-gray-400 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span>Departments</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/manage-coupons"
                    className={`flex items-center space-x-2 py-2.5 px-4 rounded-lg transition-colors duration-200 ${
                      pathname === '/admin/manage-coupons'
                        ? 'bg-gray-600 text-white'
                        : 'text-gray-600 hover:bg-gray-600 hover:text-white dark:text-gray-400 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span>Coupons</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/manage-vehicles"
                    className={`flex items-center space-x-2 py-2.5 px-4 rounded-lg transition-colors duration-200 ${
                      pathname === '/admin/manage-vehicles'
                        ? 'bg-gray-600 text-white'
                        : 'text-gray-600 hover:bg-gray-600 hover:text-white dark:text-gray-400 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span>Vehicles</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/manage-drivers"
                    className={`flex items-center space-x-2 py-2.5 px-4 rounded-lg transition-colors duration-200 ${
                      pathname === '/admin/manage-drivers'
                        ? 'bg-gray-600 text-white'
                        : 'text-gray-600 hover:bg-gray-600 hover:text-white dark:text-gray-400 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span>Drivers</span>
                  </Link>
                </li>
              </>
            )}
            {(!session || (session?.role as string)) === 'TRANSPORT_FOCAL' && (
              <li>
                <Link
                  href="/transport"
                  className={`flex items-center space-x-2 py-2.5 px-4 rounded-lg transition-colors duration-200 ${
                    pathname === '/transport'
                      ? 'bg-gray-600 text-white'
                      : 'text-gray-600 hover:bg-gray-600 hover:text-white dark:text-gray-400 dark:hover:bg-gray-700'
                  }`}
                >
                  <span>Fuel Request</span>
                </Link>
              </li>
            )}
            {(session?.role as string) === 'STORE_ATTENDANT' && (
              <>
                <li>
                  <Link
                    href="/store"
                    className={`flex items-center space-x-2 py-2.5 px-4 rounded-lg transition-colors duration-200 ${
                      pathname === '/store'
                        ? 'bg-gray-600 text-white'
                        : 'text-gray-600 hover:bg-gray-600 hover:text-white dark:text-gray-400 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span>Offer Coupon</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/manage-coupons"
                    className={`flex items-center space-x-2 py-2.5 px-4 rounded-lg transition-colors duration-200 ${
                      pathname === '/admin/manage-coupons'
                        ? 'bg-gray-600 text-white'
                        : 'text-gray-600 hover:bg-gray-600 hover:text-white dark:text-gray-400 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span>Coupons</span>
                  </Link>
                </li>
              </>
            )}
            {(session?.role as string) === 'ADMIN' && (
              <>
                <li>
                  <Link
                    href="/admin/requests"
                    className={`flex items-center space-x-2 py-2.5 px-4 rounded-lg transition-colors duration-200 ${
                      pathname === '/admin/requests'
                        ? 'bg-gray-600 text-white'
                        : 'text-gray-600 hover:bg-gray-600 hover:text-white dark:text-gray-400 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span>Pending Requests</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin"
                    className={`flex items-center space-x-2 py-2.5 px-4 rounded-lg transition-colors duration-200 ${
                      pathname === '/admin'
                        ? 'bg-gray-600 text-white'
                        : 'text-gray-600 hover:bg-gray-600 hover:text-white dark:text-gray-400 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span>Reports</span>
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </div>
  );
}
