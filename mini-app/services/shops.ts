import type { SupabaseClient } from "@supabase/supabase-js";
import { MOCK_SHOPS } from "@/lib/mock-data";
import type { DbShop } from "@/types/database";

export async function fetchApprovedShops(client: SupabaseClient | null): Promise<DbShop[]> {
  if (!client) return MOCK_SHOPS;

  try {
    const { data, error } = await client
      .from("shops")
      .select(
        "id, name, description, city, logo_url, banner_url, is_approved, is_featured, subscription_type, owner_telegram_username"
      )
      .eq("is_approved", true)
      .order("is_featured", { ascending: false })
      .order("name", { ascending: true });

    if (error) throw error;
    const rows = (data ?? []) as DbShop[];
    if (rows.length === 0) return MOCK_SHOPS;
    return rows;
  } catch {
    return MOCK_SHOPS;
  }
}

export async function fetchShopById(
  client: SupabaseClient | null,
  id: string
): Promise<DbShop | null> {
  if (!client) return MOCK_SHOPS.find((s) => s.id === id) ?? null;

  try {
    const { data, error } = await client
      .from("shops")
      .select(
        "id, name, description, city, logo_url, banner_url, is_approved, is_featured, subscription_type, owner_telegram_username"
      )
      .eq("id", id)
      .eq("is_approved", true)
      .maybeSingle();
    if (error) throw error;
    if (!data) return MOCK_SHOPS.find((s) => s.id === id) ?? null;
    return data as DbShop;
  } catch {
    return MOCK_SHOPS.find((s) => s.id === id) ?? null;
  }
}
