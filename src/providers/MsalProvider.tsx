// src/app/MsalProvider.tsx
'use client';

import { msalConfig } from '@/lib/authConfig';
import { PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider as ReactMsalProvider } from '@azure/msal-react';
import { useEffect, useState } from 'react';

export function MsalProvider({ children }: { children: React.ReactNode }) {
  const [msalInstance, setMsalInstance] =
    useState<PublicClientApplication | null>(null);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    const initializeMsal = async () => {
      const pca = new PublicClientApplication(msalConfig);
      await pca.initialize();
      setMsalInstance(pca);
      setMounted(true);
    };
    initializeMsal();
  }, []);

  if (!mounted || !msalInstance) {
    return <div>Loading authentication...</div>;
  }

  return (
    <ReactMsalProvider instance={msalInstance}>{children}</ReactMsalProvider>
  );
}
