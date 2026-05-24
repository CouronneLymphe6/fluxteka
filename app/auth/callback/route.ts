import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { prisma, isDbConnected } from '@/lib/prisma';

// ── Sync user to Prisma DB (server-side, right after auth) ────────────────────
async function syncUserToPrisma(supabaseUserId: string, email: string, metadata: Record<string, string>) {
  if (!isDbConnected()) return;
  try {
    const name = metadata.name || metadata.full_name || email.split('@')[0];
    const avatar = metadata.avatar_url || metadata.picture || null;

    const existing = await prisma.user.findFirst({ where: { email } });
    if (existing) {
      // Update avatar if changed
      if (avatar && avatar !== existing.avatar) {
        await prisma.user.update({ where: { id: existing.id }, data: { avatar } });
      }
      return;
    }

    // New user — create in DB
    await prisma.user.create({
      data: { email, name, avatar, email_verified: true },
    });
  } catch (err) {
    // Non-blocking — auth still succeeds even if DB sync fails
    console.error('[auth/callback] syncUserToPrisma error:', err);
  }
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;

  const code = searchParams.get('code');
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  const next = searchParams.get('next');

  // Sanitize redirect to prevent open redirect attacks
  function sanitizeRedirect(next: string | null): string {
    if (!next || !next.startsWith('/') || next.startsWith('//')) return '/compte';
    try {
      const url = new URL(next, 'http://dummy');
      if (url.hostname !== 'dummy') return '/compte';
    } catch { return '/compte'; }
    return next;
  }

  const destination = sanitizeRedirect(next);

  // ── OAuth flow (GitHub / Google) — code exchange ──────────────────────────
  if (code) {
    const response = NextResponse.redirect(`${origin}${destination}`);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      // ✅ Sync to Prisma immediately after successful auth
      await syncUserToPrisma(
        data.user.id,
        data.user.email ?? '',
        (data.user.user_metadata ?? {}) as Record<string, string>
      );
      return response;
    }
    if (error) console.error('[auth/callback] exchangeCodeForSession error:', error.message);
  }

  // ── Magic link / Email OTP — token_hash flow ──────────────────────────────
  if (token_hash && type) {
    const response = NextResponse.redirect(`${origin}${destination}`);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const { data, error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as 'email' | 'recovery' | 'invite' | 'email_change',
    });
    if (!error && data.user) {
      // ✅ Sync to Prisma immediately after successful auth
      await syncUserToPrisma(
        data.user.id,
        data.user.email ?? '',
        (data.user.user_metadata ?? {}) as Record<string, string>
      );
      return response;
    }
    if (error) console.error('[auth/callback] verifyOtp error:', error.message);
  }

  // ── Fallback ──────────────────────────────────────────────────────────────
  return NextResponse.redirect(`${origin}/connexion?error=auth`);
}
