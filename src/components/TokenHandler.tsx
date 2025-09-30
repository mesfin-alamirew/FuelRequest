// src/components/TokenHandler.tsx
'use client';

import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export function TokenHandler() {
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check if the user is authenticated and on the home page after a redirect
    if (isAuthenticated && accounts.length > 0 && pathname === '/') {
      const idToken = accounts[0].idToken;
      if (idToken) {
        // Send the ID token to your Next.js API route
        fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: idToken }),
        })
          .then(() => {
            console.log('Session established server-side.');
            // Optional: Redirect to a protected page after setting the cookie
            // router.push('/dashboard');
            router.refresh();
          })
          .catch((error) =>
            console.error('Failed to establish session:', error)
          );
      }
    }
  }, [isAuthenticated, accounts, pathname, router]);

  return null;
}
