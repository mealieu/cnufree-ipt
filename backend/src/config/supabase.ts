import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from './env';
import { Database } from '../types/database.types';

export type TypedSupabaseClient = SupabaseClient<Database>;

/**
 * Shared stateless anon client (used for JWT verification via getClaims()).
 */
export const supabaseAnon: TypedSupabaseClient = createClient<Database>(
  env.SUPABASE_URL,
  env.SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }
);

/**
 * Creates a per-request Supabase client authenticated as the caller via their Bearer JWT.
 * All user-scoped queries in [BE-04]–[BE-12] MUST use this client (req.supabase)
 * so [BE-09] PostgreSQL RLS policies are enforced automatically.
 */
export function createUserSupabaseClient(
  accessToken: string
): TypedSupabaseClient {
  return createClient<Database>(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

/**
 * Service-role admin client (bypasses RLS).
 * Use ONLY for trusted system operations or public tokenized lookups (e.g., [BE-12]).
 */
export const supabaseAdmin: TypedSupabaseClient = createClient<Database>(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }
);
