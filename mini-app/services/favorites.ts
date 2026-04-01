import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProductWithShop } from "@/types/database";
import { fetchProductsByIds } from "./products";

const LS_KEY = "gz_favorites_v2";

/** Supabase mahsulot UUID; mock katalog (p1, m1) serverga yuborilmaydi. */
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

function browserInitData(): string {
  if (typeof window === "undefined") return "";
  return window.Telegram?.WebApp?.initData ?? "";
}

function mergeWithLocalNonUuid(fromApi: string[]): string[] {
  const local = readLocal();
  const keep = local.filter((id) => !UUID_RE.test(id));
  return [...new Set([...fromApi, ...keep])];
}

async function fetchIdsFromApi(initData: string): Promise<{ ok: true; ids: string[] } | { ok: false }> {
  const res = await fetch("/api/favorites/list", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ initData }),
  });
  if (!res.ok) return { ok: false };
  const j = (await res.json()) as { ids?: string[] };
  return { ok: true, ids: Array.isArray(j.ids) ? j.ids : [] };
}

export async function fetchFavoriteIds(
  _client: SupabaseClient | null,
  _telegramId: number | null
): Promise<string[]> {
  const initData = browserInitData();
  if (initData) {
    const r = await fetchIdsFromApi(initData);
    if (r.ok) {
      const merged = mergeWithLocalNonUuid(r.ids);
      writeLocal(merged);
      return merged;
    }
  }
  return readLocal();
}

export async function fetchFavoriteProducts(
  client: SupabaseClient | null,
  telegramId: number | null
): Promise<ProductWithShop[]> {
  const ids = await fetchFavoriteIds(client, telegramId);
  return fetchProductsByIds(client, ids);
}

export async function toggleFavorite(
  _client: SupabaseClient | null,
  _telegramId: number | null,
  productId: string
): Promise<boolean> {
  const initData = browserInitData();
  const cur = readLocal();
  const has = cur.includes(productId);
  const nextLocal = has ? cur.filter((x) => x !== productId) : [...cur, productId];

  if (initData && UUID_RE.test(productId)) {
    const res = await fetch("/api/favorites/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ initData, productId }),
    });
    if (res.ok) {
      const j = (await res.json()) as { favorited?: boolean };
      const favorited = Boolean(j.favorited);
      let cur = readLocal();
      if (favorited) {
        cur = [...new Set([...cur, productId])];
      } else {
        cur = cur.filter((x) => x !== productId);
      }
      writeLocal(cur);
      return favorited;
    }
  }

  writeLocal(nextLocal);
  return !has;
}

export function isFavoriteSync(ids: string[], productId: string) {
  return ids.includes(productId);
}
