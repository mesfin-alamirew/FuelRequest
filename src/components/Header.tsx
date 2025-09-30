// src/components/Header.tsx
'use client';

import { useSession } from '@/providers/SessionProvider';
import Link from 'next/link';

import { AuthButtons } from './AuthButtons';

export default function Header() {
  const { session } = useSession();
  // const [loading, setLoading] = useState(true);

  if (!session) {
    // You can replace this with a loading skeleton if you prefer
    return (
      <nav className="flex justify-between items-center p-4 bg-gray-800 text-white">
        <Link href="/" className="text-xl font-bold">
          Fuel Requisition
        </Link>
        <div>Loading...</div>
      </nav>
    );
  }

  return (
    <nav className="flex justify-between items-center p-4 bg-gray-800 text-white">
      <Link href="/" className="text-xl font-bold">
        Fuel Requisition
      </Link>
      <div className="space-x-4">
        {/* {session && <span>Welcome, {session.name}!</span>} */}

        <AuthButtons />
      </div>
    </nav>
  );
}
