import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProductWithShop } from "@/types/database";
import { fetchProductsByIds } from "./products";

const LS_KEY = "gz_favorites_v2";

function readLocal(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LS_KEY);
    const v = raw ? (JSON.parse(raw) as string[]) : [];
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

function writeLocal(ids: string[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(ids));
}

export async function fetchFavoriteIds(
  client: SupabaseClient | null,
  telegramId: number | null
): Promise<string[]> {
  if (!client || telegramId == null) return readLocal();

  try {
    const { data, error } = await client
      .from("favorites")
      .select("product_id")
      .eq("telegram_id", telegramId);
    if (error) throw error;
    return (data ?? []).map((r: { product_id: string }) => r.product_id);
  } catch {
    return readLocal();
  }
}

export async function fetchFavoriteProducts(
  client: SupabaseClient | null,
  telegramId: number | null
): Promise<ProductWithShop[]> {
  const ids = await fetchFavoriteIds(client, telegramId);
  return fetchProductsByIds(client, ids);
}

export async function toggleFavorite(
  client: SupabaseClient | null,
  telegramId: number | null,
  productId: string
): Promise<boolean> {
  const ids = await fetchFavoriteIds(client, telegramId);
  const has = ids.includes(productId);
  const next = has ? ids.filter((x) => x !== productId) : [...ids, productId];

  if (!client || telegramId == null) {
    writeLocal(next);
    return !has;
  }

  try {
    if (has) {
      await client.from("favorites").delete().eq("product_id", productId).eq("telegram_id", telegramId);
    } else {
      await client.from("favorites").insert({ telegram_id: telegramId, product_id: productId });
    }
    return !has;
  } catch {
    writeLocal(next);
    return !has;
  }
}

export function isFavoriteSync(ids: string[], productId: string) {
  return ids.includes(productId);
}
