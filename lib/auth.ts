/**
 * Shared auth helper for API routes.
 * Handles missing Supabase keys gracefully.
 */

import { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function getAuthUser(request: NextRequest) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return null;
  }

  try {
    const supabase = createServerClient(SUPABASE_URL, SUPABASE_KEY, {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll() { /* read-only in API route */ },
      },
    });
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}
