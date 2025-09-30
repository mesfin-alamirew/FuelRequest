// src/components/AuthButtons.tsx
'use client';

import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { InteractionStatus } from '@azure/msal-browser'; // Import InteractionStatus
import { loginRequest } from '@/lib/authConfig';
import { logoutAction } from '@/lib/actions/logout';
import { useRouter } from 'next/navigation';
export function AuthButtons() {
  const { instance, inProgress } = useMsal(); // Get inProgress state
  const isAuthenticated = useIsAuthenticated();
  const router = useRouter();
  const handleLogin = () => {
    // Check if no interaction is in progress
    if (inProgress === InteractionStatus.None) {
      instance.loginRedirect(loginRequest);
    }
  };

  const handleLogout = async () => {
    await logoutAction();
    instance.logoutRedirect();
    router.push('/');
  };

  if (isAuthenticated) {
    return (
      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-2 rounded"
      >
        Sign Out
      </button>
    );
  }

  return (
    <button
      onClick={handleLogin}
      className="bg-blue-500 text-white px-4 py-2 rounded"
    >
      Sign In
    </button>
  );
}
