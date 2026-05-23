import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;

  const code = searchParams.get('code');
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  const next = searchParams.get('next') ?? '/';

  // Where to send the user after successful auth
  const destination = next === '/' ? '/compte' : next;

  // ── OAuth flow (GitHub / Google) — code exchange ──────────────────────────
  if (code) {
    const response = NextResponse.redirect(`${origin}${destination}`);

    const supabase = createServerClient(
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

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return response;

    console.error('[auth/callback] exchangeCodeForSession error:', error.message);
  }

  // ── Magic link / Email OTP — token_hash flow ──────────────────────────────
  if (token_hash && type) {
    const response = NextResponse.redirect(`${origin}${destination}`);

    const supabase = createServerClient(
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

    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as 'email' | 'recovery' | 'invite' | 'email_change',
    });
    if (!error) return response;

    console.error('[auth/callback] verifyOtp error:', error.message);
  }

  // ── Fallback ──────────────────────────────────────────────────────────────
  return NextResponse.redirect(`${origin}/connexion?error=auth`);
}
