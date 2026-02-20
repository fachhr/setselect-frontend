import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — IMPORTANT: do not remove this
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Public paths that don't require authentication
  const publicPaths = [
    '/',
    '/auth/callback',
    '/auth/invite-callback',
    '/join',
    '/contact',
    '/terms',
    '/privacy',
    '/impressum',
    '/cookies',
  ];

  const isPublicPath = publicPaths.some(
    (path) => pathname === path || (path !== '/' && pathname.startsWith(path + '/'))
  );
  const isApiRoute = pathname.startsWith('/api/');
  const isStaticAsset =
    pathname.startsWith('/_next/') || pathname.startsWith('/favicon');

  // Don't redirect API routes or static assets
  if (isApiRoute || isStaticAsset) {
    return supabaseResponse;
  }

  // Redirect /login to homepage (consolidated)
  if (pathname === '/login') {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  // Redirect unauthenticated users to homepage (except public paths)
  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
