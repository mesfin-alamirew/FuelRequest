// src/components/ProtectedRoute.tsx
'use client';

import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { loginRequest } from '@/lib/authConfig';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { instance } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      // You can use loginRedirect to trigger the login flow
      instance.loginRedirect(loginRequest);
    }
  }, [isAuthenticated, instance, router]);

  if (!isAuthenticated) {
    return null; // Or a loading screen
  }

  return <>{children}</>;
}
