import type { SupabaseClient } from "@supabase/supabase-js";
import { MOCK_PRODUCTS } from "@/lib/mock-data";
import type { ProductWithShop } from "@/types/database";

/** Ro‘yxat / grid — tavsifsiz, kichik payload */
const SELECT_LIST = `
  id,
  name,
  price,
  image_url,
  category,
  shop_id,
  is_active,
  created_at,
  shops (
    id,
    name,
    description,
    city,
    logo_url,
    banner_url,
    is_approved,
    is_featured,
    subscription_type,
    owner_telegram_username
  )
`;

/** Batafsil sahifa */
const SELECT_DETAIL = `
  id,
  name,
  description,
  price,
  image_url,
  category,
  shop_id,
  is_active,
  created_at,
  shops (
    id,
    name,
    description,
    city,
    logo_url,
    banner_url,
    is_approved,
    is_featured,
    subscription_type,
    owner_telegram_username
  )
`;

function sortFeaturedFirst(products: ProductWithShop[]) {
  return [...products].sort((a, b) => {
    const fa = a.shops?.is_featured ? 1 : 0;
    const fb = b.shops?.is_featured ? 1 : 0;
    if (fb !== fa) return fb - fa;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

function ensureBadges(p: ProductWithShop): ProductWithShop {
  if (p.badge) return p;
  const hash = p.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const badges: Array<"hot" | "star" | "top" | null> = ["hot", "star", "top", null];
  return { ...p, badge: badges[hash % 4] };
}

function filterApproved(rows: ProductWithShop[]): ProductWithShop[] {
  return rows.filter((r) => r.shops?.is_approved === true);
}

export type ProductFilters = {
  search?: string;
  category?: string;
  limit?: number;
};

export async function fetchProducts(
  client: SupabaseClient | null,
  filters: ProductFilters = {}
): Promise<ProductWithShop[]> {
  const limit = Math.min(filters.limit ?? 48, 80);
  const useMock = !client;

  if (useMock) {
    return filterLocal(MOCK_PRODUCTS.map(ensureBadges), filters);
  }

  try {
    let q = client
      .from("products")
      .select(SELECT_LIST)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(Math.min(limit + 8, 64));

    if (filters.category && filters.category !== "Hammasi") {
      q = q.eq("category", filters.category);
    }
    if (filters.search?.trim()) {
      q = q.ilike("name", `%${filters.search.trim()}%`);
    }

    const { data, error } = await q;
    if (error) throw error;
    const rows = (data ?? []) as unknown as ProductWithShop[];
    const approved = filterApproved(rows).slice(0, limit);
    const enriched = approved.map(ensureBadges);
    const sorted = sortFeaturedFirst(enriched);
    if (sorted.length === 0) return filterLocal(MOCK_PRODUCTS.map(ensureBadges), filters);
    return sorted;
  } catch {
    return filterLocal(MOCK_PRODUCTS.map(ensureBadges), filters);
  }
}

export async function fetchProductById(
  client: SupabaseClient | null,
  id: string
): Promise<ProductWithShop | null> {
  if (!client) {
    return MOCK_PRODUCTS.find((p) => p.id === id) ?? null;
  }
  try {
    const { data, error } = await client
      .from("products")
      .select(SELECT_DETAIL)
      .eq("id", id)
      .eq("is_active", true)
      .maybeSingle();
    if (error) throw error;
    if (!data) return MOCK_PRODUCTS.find((p) => p.id === id) ?? null;
    const row = data as unknown as ProductWithShop;
    if (!row.shops?.is_approved) return MOCK_PRODUCTS.find((p) => p.id === id) ?? null;
    return ensureBadges(row);
  } catch {
    return MOCK_PRODUCTS.find((p) => p.id === id) ?? null;
  }
}

/** Saqlanganlar: bitta so‘rov (N+1 emas) */
export async function fetchProductsByIds(
  client: SupabaseClient | null,
  ids: string[]
): Promise<ProductWithShop[]> {
  const uniq = [...new Set(ids)].filter(Boolean);
  if (uniq.length === 0) return [];

  if (!client) {
    const map = new Map(MOCK_PRODUCTS.map((p) => [p.id, ensureBadges(p)]));
    return uniq.map((id) => map.get(id)).filter(Boolean) as ProductWithShop[];
  }

  try {
    const { data, error } = await client
      .from("products")
      .select(SELECT_LIST)
      .in("id", uniq)
      .eq("is_active", true);
    if (error) throw error;
    const rows = filterApproved((data ?? []) as unknown as ProductWithShop[]).map(ensureBadges);
    const byId = new Map(rows.map((p) => [p.id, p]));
    return uniq.map((id) => byId.get(id)).filter(Boolean) as ProductWithShop[];
  } catch {
    const map = new Map(MOCK_PRODUCTS.map((p) => [p.id, ensureBadges(p)]));
    return uniq.map((id) => map.get(id)).filter(Boolean) as ProductWithShop[];
  }
}

export async function fetchProductsForShop(
  client: SupabaseClient | null,
  shopId: string,
  limit = 32
): Promise<ProductWithShop[]> {
  if (!client) {
    return MOCK_PRODUCTS.filter((p) => p.shop_id === shopId).slice(0, limit);
  }
  try {
    const { data, error } = await client
      .from("products")
      .select(SELECT_LIST)
      .eq("shop_id", shopId)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    const rows = filterApproved((data ?? []) as unknown as ProductWithShop[]).map(ensureBadges);
    if (rows.length) return rows;
    return MOCK_PRODUCTS.filter((p) => p.shop_id === shopId).slice(0, limit);
  } catch {
    return MOCK_PRODUCTS.filter((p) => p.shop_id === shopId).slice(0, limit);
  }
}

export async function fetchFeaturedProducts(
  client: SupabaseClient | null,
  take = 8
): Promise<ProductWithShop[]> {
  const pool = await fetchProducts(client, { limit: Math.min(take * 4, 40) });
  const featured = pool.filter((p) => p.shops?.is_featured);
  const pick = (featured.length >= take ? featured : pool).slice(0, take);
  return pick.length ? pick : MOCK_PRODUCTS.slice(0, take).map(ensureBadges);
}

function filterLocal(list: ProductWithShop[], f: ProductFilters) {
  let r = list;
  if (f.category && f.category !== "Hammasi") {
    r = r.filter((p) => p.category === f.category);
  }
  if (f.search?.trim()) {
    const s = f.search.trim().toLowerCase();
    r = r.filter(
      (p) =>
        p.name.toLowerCase().includes(s) || (p.description ?? "").toLowerCase().includes(s)
    );
  }
  return sortFeaturedFirst(r);
}
