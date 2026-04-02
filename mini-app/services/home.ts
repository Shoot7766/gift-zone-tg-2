import type { SupabaseClient } from "@supabase/supabase-js";
import type { DbShop, ProductWithShop } from "@/types/database";
import { fetchProducts } from "@/services/products";
import { fetchApprovedShops } from "@/services/shops";

export type HomeFeed = {
  pool: ProductWithShop[];
  shops: DbShop[];
};

/**
 * Bosh sahifa uchun bitta parallel yuk: mahsulotlar + do‘konlar
 * (avvalgi 3–4 ta takroriy mahsulot so‘rovi o‘rniga).
 */
export async function fetchHomeFeed(client: SupabaseClient | null): Promise<HomeFeed> {
  const [pool, shops] = await Promise.all([
    fetchProducts(client, { limit: 32, sort: "featured" }),
    fetchApprovedShops(client, { limit: 8 }),
  ]);
  return { pool, shops };
}
