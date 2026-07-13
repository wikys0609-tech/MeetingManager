import { NextRequest, NextResponse } from 'next/server';
import { getRequestSession } from './lib/auth';

const PROTECTED_ROUTES = ['/dashboard', '/meetings', '/tasks', '/settings', '/collaboration'];
const PUBLIC_ONLY_ROUTES = ['/'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = await getRequestSession(req);

  // Check if target path is protected
  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  
  // Check if target path is only for guest users (login page)
  const isPublicOnly = PUBLIC_ONLY_ROUTES.includes(pathname);

  if (isProtected && !session) {
    // Redirect to login page
    const loginUrl = new URL('/', req.nextUrl.origin);
    return NextResponse.redirect(loginUrl);
  }

  if (isPublicOnly && session) {
    // Redirect to dashboard
    const dashboardUrl = new URL('/dashboard', req.nextUrl.origin);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

// Configure middleware matcher
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes except custom login/logout if needed, but normally middleware skips /api for raw calls)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, icons)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png).*)',
  ],
};
