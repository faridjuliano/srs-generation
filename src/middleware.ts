import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication via token cookie
const protectedRoutes = [
  '/new-fr-nfr-detailed',
  '/fr-nfr-detailed-result',
];

// Auth pages that redirect authenticated users away
const authRoutes = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Read the token cookie set by the client after login/register
  const tokenCookie = request.cookies.get('token')?.value;
  const isAuthenticated = !!tokenCookie;

  // Check if accessing protected route
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  // Check if accessing auth route
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  // If an unauthenticated user tries to access a protected route, send them to login
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If an authenticated user opens /login or /register, send them to /new-fr-nfr-detailed
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/new-fr-nfr-detailed', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

