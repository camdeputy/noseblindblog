import { createClient } from "@supabase/supabase-js";

/**
 * Creates a Supabase client with the service role key for admin write operations.
 * ONLY use this in API route handlers (server-side). Never expose to the browser.
 */
export function createAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
