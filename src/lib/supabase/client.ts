import { createClient } from "@supabase/supabase-js";

// Falls back to a syntactically valid placeholder so this module can be
// evaluated at build time (during static prerendering) even before
// NEXT_PUBLIC_SUPABASE_URL is configured. Queries against the placeholder
// simply fail at runtime with a clear network error, same as any other
// misconfigured deployment.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

// Public by design: recipes are a shared household resource with public-read
// RLS and no login concept, so the anon key is safe in the browser bundle.
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export function recipePhotoUrl(photoPath: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return `${base}/storage/v1/object/public/recipe-photos/${photoPath}`;
}
