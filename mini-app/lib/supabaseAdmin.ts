import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export function getServiceSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function getTelegramBotToken(): string | null {
  const t = process.env.TELEGRAM_BOT_TOKEN?.trim();
  return t || null;
}

export type BotSupabaseGate =
  | { ok: true; botToken: string; supabase: SupabaseClient }
  | { ok: false };

export function requireBotAndServiceSupabase(): BotSupabaseGate {
  const botToken = getTelegramBotToken();
  const supabase = getServiceSupabase();
  if (!botToken || !supabase) return { ok: false };
  return { ok: true, botToken, supabase };
}
