import "server-only";
import { createClient } from "@supabase/supabase-js";

// Service-role client: only ever imported from API routes. Bypasses RLS,
// which is exactly what the passcode-protected upload flow needs since
// there's no per-user auth model to grant an "insert" permission to.
export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("Supabase is not configured on the server.");
  }
  return createClient(url, serviceRoleKey);
}
