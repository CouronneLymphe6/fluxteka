import { createBrowserClient } from '@supabase/ssr';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let client: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    // Return a no-op proxy when Supabase isn't configured
    // This prevents crashes in development without keys
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        onAuthStateChange: (_: string, __: unknown) => ({
          data: { subscription: { unsubscribe: () => {} } },
        }),
        signInWithOAuth: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
        signInWithOtp: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
        signOut: async () => ({ error: null }),
        updateUser: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
        resetPasswordForEmail: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
      },
    } as unknown as ReturnType<typeof createBrowserClient>;
  }

  if (!client) {
    client = createBrowserClient(SUPABASE_URL, SUPABASE_KEY);
  }
  return client;
}
