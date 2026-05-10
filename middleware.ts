import { updateSession } from '@/lib/supabase/middleware';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const country = request.geo?.country;

  if (country === 'BG') {
    if (pathname === '/') {
      const url = request.nextUrl.clone();
      url.pathname = '/bg';
      return NextResponse.redirect(url);
    }
    if (pathname === '/join') {
      const url = request.nextUrl.clone();
      url.pathname = '/join/bg';
      return NextResponse.redirect(url);
    }
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public folder assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
