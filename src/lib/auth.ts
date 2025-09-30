// src/lib/auth.ts

import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();
export interface AuthSession {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'TRANSPORT_FOCAL' | 'ADMIN';
}
export async function getAuthSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('app_session')?.value;

  if (!sessionCookie) {
    return null;
  }
  // Fetch the user using the email from the session cookie

  try {
    const user = await prisma.user.findUnique({
      where: { email: JSON.parse(sessionCookie).email },
      include: { department: true },
    });

    if (!user) {
      return null; // No user found for the session
    }
    return {
      id: user.id.toString(), // Convert ID to string for consistency
      email: user.email,
      name: user.name,
      role: user.role,
    };
  } catch (e) {
    console.error('Failed to parse session cookie:', e);
    return null;
  }
}
