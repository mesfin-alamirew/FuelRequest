'use client';

import { createContext, useContext, ReactNode } from 'react';
import { type AuthSession } from '@/lib/auth';

interface SessionContextType {
  session: AuthSession | null;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({
  children,
  session,
}: {
  children: ReactNode;
  session: AuthSession | null;
}) {
  return (
    <SessionContext.Provider value={{ session }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
