// src/components/Header.tsx
'use client';

import { useSession } from '@/providers/SessionProvider';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { AuthButtons } from './AuthButtons';
interface HeaderProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}
export default function Header({ isSidebarOpen, toggleSidebar }: HeaderProps) {
  const { session } = useSession();
  // const [loading, setLoading] = useState(true);

  if (!session) {
    // You can replace this with a loading skeleton if you prefer
    return (
      <header className="fixed top-0 left-0 right-0 z-40 flex h-16 items-center justify-between bg-white px-4 shadow-sm transition-all duration-300 dark:bg-gray-800 lg:left-64">
        <button
          onClick={toggleSidebar}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 lg:hidden"
        >
          {isSidebarOpen ? (
            <X className="text-white h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
        <Link href="/" className="text-xl font-bold">
          Fuel Requisition
        </Link>
        <div>Loading...</div>
      </header>
    );
  }

  return (
    <header className="fixed top-0 left-0  right-0 z-40 flex h-16 items-center gap-10 lg:justify-between bg-white px-4 shadow-sm transition-all duration-300 dark:bg-gray-800 lg:left-64">
      <Link href="/" className="text-xl font-bold">
        Fuel Requisition
      </Link>
      <div className="space-x-4">
        <AuthButtons />
      </div>
    </header>
  );
}
