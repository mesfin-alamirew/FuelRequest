// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;

  // Read the session cookie directly from the request
  const sessionCookie = request.cookies.get('app_session');
  console.log('VVV', sessionCookie);
  const isAuthenticated = !!sessionCookie;

  // Protect all /admin routes
  if (url.pathname.startsWith('/admin')) {
    // You cannot perform a database lookup here for the role
    // You must perform the role check on the server page itself
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Protect other authenticated routes
  if (
    url.pathname.startsWith('/transport') ||
    url.pathname.startsWith('/store')
  ) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Redirect authenticated users from the login page
  if (url.pathname === '/login' && isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|login).*)'],
};
