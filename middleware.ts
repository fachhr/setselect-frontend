import { updateSession } from '@/lib/supabase/middleware';
import { geolocation } from '@vercel/functions';
import { NextResponse, type NextRequest } from 'next/server';
import { MARKETS, getMarketConfig } from '@/lib/markets';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { country } = geolocation(request);

  for (const marketCode of MARKETS) {
    const config = getMarketConfig(marketCode);
    if (config.basePath && country === marketCode) {
      if (pathname === '/') {
        const url = request.nextUrl.clone();
        url.pathname = config.basePath;
        return NextResponse.redirect(url);
      }
      if (pathname === '/join') {
        const url = request.nextUrl.clone();
        url.pathname = config.joinPath;
        return NextResponse.redirect(url);
      }
      break;
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
