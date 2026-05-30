import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/navigation';

// Create the next-intl middleware handler
const intlMiddleware = createMiddleware(routing);


export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // ── Step 1: i18n locale detection ──────────────────────────────────────────
  const isApiRoute = pathname.startsWith('/api/');
  const isAuthRoute = pathname.startsWith('/auth/');          // ← Supabase OAuth callbacks
  const isNextInternal = pathname.startsWith('/_next/') || pathname === '/favicon.ico';
  const isStaticFile = /\.(png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|css|js)$/.test(pathname);

  // ── Step 2: Initialize Base Response (with next-intl if applicable) ────────
  let response: NextResponse;

  if (!isApiRoute && !isAuthRoute && !isNextInternal && !isStaticFile) {
    const intlResponse = intlMiddleware(request);
    // If next-intl wants to redirect (locale prefix handling), let it
    if (intlResponse.headers.get('location')) {
      return intlResponse;
    }
    response = intlResponse;
  } else {
    response = NextResponse.next({
      request: { headers: request.headers },
    });
  }

  // ── Step 2: Auth checks (Supabase) ─────────────────────────────────────────
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookies) {
          cookies.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Strip locale prefix for protected route matching
  const pathnameWithoutLocale = pathname.replace(/^\/(en|es|de)/, '') || '/';

  // Protected routes — redirect to /connexion if not authenticated
  const protectedPaths = ['/compte', '/admin', '/account', '/konto', '/cuenta'];
  const isProtected = protectedPaths.some(p => pathnameWithoutLocale.startsWith(p));

  if (isProtected && !user) {
    const redirectUrl = new URL('/connexion', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Admin routes — require admin role
  if (pathnameWithoutLocale.startsWith('/admin') && user) {
    const role = user.app_metadata?.role || 'buyer';
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // If logged in and visiting login page (any locale), redirect to /compte
  const loginPaths = ['/connexion', '/login', '/iniciar-sesion', '/anmelden'];
  if (loginPaths.some(p => pathnameWithoutLocale === p) && user) {
    return NextResponse.redirect(new URL('/compte', request.url));
  }

  return response;
}


export const config = {
  matcher: [
    // Match all paths EXCEPT: Next.js internals, API routes, auth callbacks, static files
    '/((?!_next/static|_next/image|favicon.ico|api/|auth/).*)',
  ],
};
