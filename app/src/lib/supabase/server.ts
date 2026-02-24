import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Module-level singleton — reused across all server-component renders in the
// same Node.js process, avoiding the overhead of re-instantiating the HTTP
// client on every request.
let _client: SupabaseClient | null = null;

export function createServerSupabase(): SupabaseClient {
  if (!_client) {
    _client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return _client;
}
