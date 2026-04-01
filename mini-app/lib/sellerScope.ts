import type { SupabaseClient } from "@supabase/supabase-js";
import type { DbShop } from "@/types/database";

export function normalizeTelegramUsername(username: string | undefined): string {
  return username?.replace(/^@/, "").trim().toLowerCase() || "";
}

export async function fetchShopsForSeller(
  supabase: SupabaseClient,
  usernameRaw: string | undefined
): Promise<{ shops: DbShop[]; uname: string }> {
  const uname = normalizeTelegramUsername(usernameRaw);
  if (!uname) return { shops: [], uname: "" };

  const r1 = await supabase.from("shops").select("*").ilike("owner_telegram_username", uname);

  if (r1.error) throw new Error(r1.error.message);

  let rows = r1.data ?? [];
  if (rows.length === 0) {
    const r2 = await supabase.from("shops").select("*").ilike("owner_telegram_username", `@${uname}`);
    if (r2.error) throw new Error(r2.error.message);
    rows = r2.data ?? [];
  }

  return { shops: rows as DbShop[], uname };
}

export async function assertShopOwned(
  supabase: SupabaseClient,
  shopId: string,
  usernameRaw: string | undefined
): Promise<boolean> {
  const { shops } = await fetchShopsForSeller(supabase, usernameRaw);
  return shops.some((s) => s.id === shopId);
}

export async function assertProductOwnedBySeller(
  supabase: SupabaseClient,
  productId: string,
  usernameRaw: string | undefined
): Promise<boolean> {
  const { shops } = await fetchShopsForSeller(supabase, usernameRaw);
  const shopIds = new Set(shops.map((s) => s.id));
  if (shopIds.size === 0) return false;

  const { data, error } = await supabase.from("products").select("shop_id").eq("id", productId).maybeSingle();

  if (error || !data) return false;
  return shopIds.has((data as { shop_id: string }).shop_id);
}
