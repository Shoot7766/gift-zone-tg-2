"use client";

import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { ProductCard } from "@/components/product/ProductCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useSupabase } from "@/hooks/useSupabase";
import { useTelegramUserId } from "@/hooks/useTelegramUser";
import { MOCK_CATEGORIES } from "@/lib/mock-data";
import { fetchFavoriteIds, toggleFavorite } from "@/services/favorites";
import { fetchProducts, type ProductSortMode } from "@/services/products";
import type { ProductKind } from "@/types/database";

const KIND_OPTIONS: { id: "all" | ProductKind; label: string }[] = [
  { id: "all", label: "Hammasi" },
  { id: "product", label: "Mahsulot" },
  { id: "service", label: "Xizmat" },
];

export default function ProductsPageClient() {
  const params = useSearchParams();
  const initialQ = params.get("q") ?? "";
  const initialCat = params.get("category") ?? "Hammasi";
  const [q, setQ] = useState(initialQ);
  const [cat, setCat] = useState(initialCat);
  const [kind, setKind] = useState<"all" | ProductKind>("all");
  const [sort, setSort] = useState<ProductSortMode>("featured");
  const debouncedQ = useDebouncedValue(q, 320);
  const supabase = useSupabase();
  const sbKey = supabase ? "sb" : "mock";
  const tgId = useTelegramUserId();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["products", debouncedQ, cat, kind, sort, sbKey],
    queryFn: () =>
      fetchProducts(supabase, {
        search: debouncedQ,
        category: cat === "Hammasi" ? undefined : cat,
        productKind: kind,
        sort,
        limit: 40,
      }),
    placeholderData: keepPreviousData,
    staleTime: 90_000,
    gcTime: 240_000,
  });

  const favQ = useQuery({
    queryKey: ["fav-ids", tgId],
    queryFn: () => fetchFavoriteIds(supabase, tgId),
    staleTime: 120_000,
    gcTime: 300_000,
  });

  const favSet = useMemo(() => new Set(favQ.data ?? []), [favQ.data]);

  const onSave = useCallback(
    async (productId: string) => {
      await toggleFavorite(supabase, tgId, productId);
      void qc.invalidateQueries({ queryKey: ["fav-ids"] });
    },
    [supabase, tgId, qc]
  );

  const handleToggleSave = useCallback(
    (productId: string) => {
      void onSave(productId);
    },
    [onSave]
  );

  const list = query.data ?? [];
  const loading = query.isLoading && !query.isPlaceholderData;

  return (
    <div className="space-y-5 pb-6">
      <div>
        <h1 className="text-xl font-black tracking-tight text-white">Mahsulotlar</h1>
        <p className="mt-1 text-sm text-gz-muted">Qidiring, tur va tartibni tanlang.</p>
      </div>

      <div className="relative">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Masalan: qizga sovg‘a"
          className="w-full rounded-2xl border border-white/[0.08] bg-gz-surface/95 py-3.5 pl-4 pr-4 text-sm text-white shadow-inner shadow-black/25 placeholder:text-gz-muted focus:border-emerald-500/40 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
          autoComplete="off"
        />
      </div>

      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gz-muted">Tur</p>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {KIND_OPTIONS.map((k) => (
            <button
              key={k.id}
              type="button"
              onClick={() => setKind(k.id)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold ring-1 ring-inset transition ${
                kind === k.id
                  ? "bg-gz-accent text-black ring-gz-accent shadow-lg shadow-emerald-900/25"
                  : "bg-gz-elevated text-gz-muted ring-white/10 hover:text-white"
              }`}
            >
              {k.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gz-muted">
          Kategoriya
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {MOCK_CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCat(c)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold ring-1 ring-inset transition ${
                cat === c
                  ? "bg-violet-500/25 text-violet-100 ring-violet-400/40"
                  : "bg-gz-elevated text-gz-muted ring-white/10 hover:text-white"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-xs text-gz-muted">
          <span className="font-semibold text-white/90">Tartib:</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as ProductSortMode)}
            className="rounded-xl border border-white/[0.1] bg-gz-elevated px-3 py-2 text-xs font-medium text-white"
          >
            <option value="featured">Tavsiya (featured)</option>
            <option value="price_asc">Narx: arzondan</option>
            <option value="price_desc">Narx: qimmatdan</option>
          </select>
        </label>
      </div>

      <div className="flex items-center justify-between text-xs text-gz-muted">
        <span>
          {query.isFetching && !query.isPlaceholderData
            ? "Yangilanmoqda…"
            : `${list.length} ta natija`}
        </span>
        <Link href="/" className="font-semibold text-gz-accent2">
          Bosh sahifa
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : list.length === 0 ? (
        <EmptyState
          emoji="😕"
          title="Mahsulot topilmadi"
          hint="Boshqa so‘z, tur yoki kategoriya bilan qidirib ko‘ring."
        />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {list.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              saved={favSet.has(p.id)}
              onToggleSave={handleToggleSave}
            />
          ))}
        </div>
      )}
    </div>
  );
}
