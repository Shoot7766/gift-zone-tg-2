/**
 * Supabase — brauzer mijozi va yordamchilar.
 * Env: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
 */
export {
  createSupabaseBrowserClient,
  isSupabaseConfigured,
} from "@/lib/supabase/client";

export type { SupabaseClient } from "@supabase/supabase-js";
