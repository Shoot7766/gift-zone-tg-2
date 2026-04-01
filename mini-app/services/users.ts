import type { SupabaseClient } from "@supabase/supabase-js";
import type { DbUser, UserRole } from "@/types/database";

export async function fetchUserRoleByTelegramId(
  client: SupabaseClient | null,
  telegramId: number
): Promise<UserRole> {
  if (!client) return "customer";

  try {
    const { data, error } = await client
      .from("users")
      .select("role, telegram_id")
      .eq("telegram_id", telegramId)
      .maybeSingle();
    if (error) throw error;
    const role = (data as DbUser | null)?.role;
    if (role === "seller" || role === "admin") return role;
    return "customer";
  } catch {
    return "customer";
  }
}
