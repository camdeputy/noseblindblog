import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Module-level singleton for the service-role client. Safe because this module
// is only ever loaded server-side and the credentials are static env vars.
let _adminClient: SupabaseClient | null = null;

/**
 * Returns a Supabase client with the service role key for admin write operations.
 * ONLY use this in server components or API route handlers. Never expose to the browser.
 */
export function createAdminSupabase(): SupabaseClient {
  if (!_adminClient) {
    _adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return _adminClient;
}
