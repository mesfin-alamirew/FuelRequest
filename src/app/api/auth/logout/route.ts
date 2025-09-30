// src/app/api/auth/logout/route.ts
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.set('app_session', '', { expires: new Date(0), path: '/' });

  return new NextResponse(JSON.stringify({ success: true }), { status: 200 });
}
