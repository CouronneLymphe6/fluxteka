import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;

  // OAuth flow (GitHub, Google) uses 'code'
  const code = searchParams.get('code');
  // Magic link / email OTP uses 'token_hash' + 'type'
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  // Where to redirect after successful auth
  const next = searchParams.get('next') ?? '/';

  const createSupabase = (response: NextResponse) =>
    createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

  const redirectAfterAuth = (response: NextResponse) => {
    const redirectTo = next === '/' ? '/compte' : next;
    return NextResponse.redirect(`${origin}${redirectTo}`, {
      headers: response.headers,
    });
  };

  // ── OAuth code exchange (GitHub, Google) ─────────────────────────────────
  if (code) {
    const response = NextResponse.next();
    const supabase = createSupabase(response);
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return redirectAfterAuth(response);
    }
    console.error('[auth/callback] exchangeCodeForSession error:', error.message);
  }

  // ── Magic link / Email OTP ────────────────────────────────────────────────
  if (token_hash && type) {
    const response = NextResponse.next();
    const supabase = createSupabase(response);
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as 'email' | 'recovery' | 'invite' | 'email_change',
    });
    if (!error) {
      return redirectAfterAuth(response);
    }
    console.error('[auth/callback] verifyOtp error:', error.message);
  }

  // ── Fallback — something went wrong ──────────────────────────────────────
  return NextResponse.redirect(`${origin}/connexion?error=auth`);
}
