import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Skip auth checks if Supabase isn't configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next();
  }

  const response = NextResponse.next({
    request: { headers: request.headers },
  });

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
  const pathname = request.nextUrl.pathname;

  // Protected routes — redirect to /connexion if not authenticated
  const protectedPaths = ['/compte', '/admin'];
  const isProtected = protectedPaths.some(p => pathname.startsWith(p));

  if (isProtected && !user) {
    const redirectUrl = new URL('/connexion', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Admin routes — require admin role
  if (pathname.startsWith('/admin') && user) {
    // Check role via user metadata (set in Supabase dashboard or via trigger)
    const role = user.user_metadata?.role || 'buyer';
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // If logged in and visiting /connexion, redirect to /compte
  if (pathname === '/connexion' && user) {
    return NextResponse.redirect(new URL('/compte', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/compte/:path*',
    '/admin/:path*',
    '/connexion',
  ],
};
