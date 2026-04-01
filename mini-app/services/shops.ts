import type { SupabaseClient } from "@supabase/supabase-js";
import { MOCK_SHOPS } from "@/lib/mock-data";
import type { DbShop } from "@/types/database";

const SHOP_FIELDS =
  "id, name, description, city, logo_url, banner_url, is_approved, is_featured, subscription_type, owner_telegram_username";

export type ShopListOptions = {
  limit?: number;
};

/**
 * Faqat tasdiqlangan do‘konlar. Featured birinchi, keyin nom bo‘yicha.
 */
export async function fetchApprovedShops(
  client: SupabaseClient | null,
  opts?: ShopListOptions
): Promise<DbShop[]> {
  const limit = opts?.limit ?? 60;
  if (!client) return MOCK_SHOPS.slice(0, limit);

  try {
    const { data, error } = await client
      .from("shops")
      .select(SHOP_FIELDS)
      .eq("is_approved", true)
      .order("is_featured", { ascending: false })
      .order("name", { ascending: true })
      .limit(limit);

    if (error) throw error;
    const rows = (data ?? []) as DbShop[];
    if (rows.length === 0) return MOCK_SHOPS.slice(0, limit);
    return rows;
  } catch {
    return MOCK_SHOPS.slice(0, limit);
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
      .select(SHOP_FIELDS)
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
