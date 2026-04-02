import type { SupabaseClient } from "@supabase/supabase-js";
import { MOCK_PRODUCTS } from "@/lib/mock-data";
import type { ProductKind, ProductWithShop } from "@/types/database";

/** Ro‘yxat — faqat kerakli ustunlar (yengil payload) */
const SELECT_LIST = `
  id,
  name,
  price,
  image_url,
  category,
  shop_id,
  is_active,
  created_at,
  product_type,
  stock,
  service_type,
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
  product_type,
  stock,
  service_type,
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

export type ProductSortMode = "featured" | "price_asc" | "price_desc";

export type ProductFilters = {
  search?: string;
  category?: string;
  limit?: number;
  /** Hammasi | mahsulot | xizmat */
  productKind?: "all" | ProductKind;
  sort?: ProductSortMode;
};

function sortFeaturedFirst(products: ProductWithShop[]) {
  return [...products].sort((a, b) => {
    const fa = a.shops?.is_featured ? 1 : 0;
    const fb = b.shops?.is_featured ? 1 : 0;
    if (fb !== fa) return fb - fa;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

function sortProducts(list: ProductWithShop[], mode: ProductSortMode = "featured"): ProductWithShop[] {
  if (mode === "price_asc") return [...list].sort((a, b) => a.price - b.price);
  if (mode === "price_desc") return [...list].sort((a, b) => b.price - a.price);
  return sortFeaturedFirst(list);
}

function ensureBadges(p: ProductWithShop): ProductWithShop {
  if (p.badge) return p;
  const hash = p.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const badges: Array<"hot" | "star" | "top" | null> = ["hot", "star", "top", null];
  return { ...p, badge: badges[hash % 4] };
}

/** DB dan kelgan qatorni bir xil shaklga */
function shapeProduct(p: ProductWithShop): ProductWithShop {
  const kind: ProductKind = p.product_type === "service" ? "service" : "product";
  return {
    ...p,
    product_type: kind,
    stock: kind === "service" ? null : p.stock ?? null,
    service_type: p.service_type ?? null,
  };
}

function filterApproved(rows: ProductWithShop[]): ProductWithShop[] {
  return rows.filter((r) => r.shops?.is_approved === true);
}

export async function fetchProducts(
  client: SupabaseClient | null,
  filters: ProductFilters = {}
): Promise<ProductWithShop[]> {
  const limit = Math.min(filters.limit ?? 48, 80);
  const sortMode = filters.sort ?? "featured";
  const useMock = !client;

  if (useMock) {
    return sortProducts(
      filterLocal(MOCK_PRODUCTS.map(ensureBadges).map(shapeProduct), filters),
      sortMode
    );
  }

  try {
    let q = client
      .from("products")
      .select(SELECT_LIST)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(Math.min(limit + 12, 72));

    if (filters.category && filters.category !== "Hammasi") {
      q = q.eq("category", filters.category);
    }
    if (filters.search?.trim()) {
      q = q.ilike("name", `%${filters.search.trim()}%`);
    }
    if (filters.productKind && filters.productKind !== "all") {
      q = q.eq("product_type", filters.productKind);
    }

    const { data, error } = await q;
    if (error) throw error;
    const rows = (data ?? []) as unknown as ProductWithShop[];
    const approved = filterApproved(rows).slice(0, limit);
    const enriched = approved.map(ensureBadges).map(shapeProduct);
    const sorted = sortProducts(enriched, sortMode);
    if (sorted.length === 0) {
      return sortProducts(
        filterLocal(MOCK_PRODUCTS.map(ensureBadges).map(shapeProduct), filters),
        sortMode
      );
    }
    return sorted;
  } catch {
    return sortProducts(
      filterLocal(MOCK_PRODUCTS.map(ensureBadges).map(shapeProduct), filters),
      sortMode
    );
  }
}

export async function fetchProductById(
  client: SupabaseClient | null,
  id: string
): Promise<ProductWithShop | null> {
  if (!client) {
    const m = MOCK_PRODUCTS.find((p) => p.id === id);
    return m ? shapeProduct(ensureBadges(m)) : null;
  }
  try {
    const { data, error } = await client
      .from("products")
      .select(SELECT_DETAIL)
      .eq("id", id)
      .eq("is_active", true)
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      const m = MOCK_PRODUCTS.find((p) => p.id === id);
      return m ? shapeProduct(ensureBadges(m)) : null;
    }
    const row = data as unknown as ProductWithShop;
    if (!row.shops?.is_approved) {
      const m = MOCK_PRODUCTS.find((p) => p.id === id);
      return m ? shapeProduct(ensureBadges(m)) : null;
    }
    return shapeProduct(ensureBadges(row));
  } catch {
    const m = MOCK_PRODUCTS.find((p) => p.id === id);
    return m ? shapeProduct(ensureBadges(m)) : null;
  }
}

export async function fetchProductsByIds(
  client: SupabaseClient | null,
  ids: string[]
): Promise<ProductWithShop[]> {
  const uniq = [...new Set(ids)].filter(Boolean);
  if (uniq.length === 0) return [];

  if (!client) {
    const map = new Map(MOCK_PRODUCTS.map((p) => [p.id, shapeProduct(ensureBadges(p))]));
    return uniq.map((id) => map.get(id)).filter(Boolean) as ProductWithShop[];
  }

  try {
    const { data, error } = await client
      .from("products")
      .select(SELECT_LIST)
      .in("id", uniq)
      .eq("is_active", true);
    if (error) throw error;
    const rows = filterApproved((data ?? []) as unknown as ProductWithShop[])
      .map(ensureBadges)
      .map(shapeProduct);
    const byId = new Map(rows.map((p) => [p.id, p]));
    return uniq.map((id) => byId.get(id)).filter(Boolean) as ProductWithShop[];
  } catch {
    const map = new Map(MOCK_PRODUCTS.map((p) => [p.id, shapeProduct(ensureBadges(p))]));
    return uniq.map((id) => map.get(id)).filter(Boolean) as ProductWithShop[];
  }
}

export async function fetchProductsForShop(
  client: SupabaseClient | null,
  shopId: string,
  limit = 32
): Promise<ProductWithShop[]> {
  if (!client) {
    return MOCK_PRODUCTS.filter((p) => p.shop_id === shopId)
      .map(ensureBadges)
      .map(shapeProduct)
      .slice(0, limit);
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
    const rows = filterApproved((data ?? []) as unknown as ProductWithShop[])
      .map(ensureBadges)
      .map(shapeProduct);
    if (rows.length) return rows;
    return MOCK_PRODUCTS.filter((p) => p.shop_id === shopId)
      .map(ensureBadges)
      .map(shapeProduct)
      .slice(0, limit);
  } catch {
    return MOCK_PRODUCTS.filter((p) => p.shop_id === shopId)
      .map(ensureBadges)
      .map(shapeProduct)
      .slice(0, limit);
  }
}

export async function fetchFeaturedProducts(
  client: SupabaseClient | null,
  take = 8
): Promise<ProductWithShop[]> {
  const pool = await fetchProducts(client, { limit: Math.min(take * 4, 40), sort: "featured" });
  const featured = pool.filter((p) => p.shops?.is_featured);
  const pick = (featured.length >= take ? featured : pool).slice(0, take);
  return pick.length ? pick : MOCK_PRODUCTS.slice(0, take).map(ensureBadges).map(shapeProduct);
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
  if (f.productKind && f.productKind !== "all") {
    r = r.filter((p) => (p.product_type ?? "product") === f.productKind);
  }
  return r;
}
