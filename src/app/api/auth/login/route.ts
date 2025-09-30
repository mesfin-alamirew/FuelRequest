// src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import * as jose from 'jose';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return new NextResponse(JSON.stringify({ error: 'Token not provided' }), {
        status: 400,
      });
    }

    const decoded = jose.decodeJwt(token);

    if (!decoded || !decoded.sub || !decoded.preferred_username) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid or incomplete token' }),
        { status: 401 }
      );
    }

    // Use a unique ID for your user, typically the `sub` claim (subject)
    // const userId = decoded.sub;
    const userEmail = decoded.preferred_username as string;
    const userName = (decoded.name || decoded.preferred_username) as string;

    // Check if the user already exists in the database by their unique email
    let user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    // If the user is new, create a database record for them
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: userEmail,
          name: userName,
          role: 'USER', // Assign a default role
        },
      });
    }

    // Store the user info including the role in the session cookie
    const sessionData = {
      name: user.name,
      email: user.email,
      role: user.role, // Add the role to the session
    };

    const cookieStore = await cookies();
    cookieStore.set('app_session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    });

    return new NextResponse(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('API Error:', error);
    return new NextResponse(JSON.stringify({ error: 'Server error' }), {
      status: 500,
    });
  }
}
