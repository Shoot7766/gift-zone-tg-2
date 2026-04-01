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
import { fetchProducts } from "@/services/products";

export default function ProductsPageClient() {
  const params = useSearchParams();
  const initialQ = params.get("q") ?? "";
  const initialCat = params.get("category") ?? "Hammasi";
  const [q, setQ] = useState(initialQ);
  const [cat, setCat] = useState(initialCat);
  const debouncedQ = useDebouncedValue(q, 320);
  const supabase = useSupabase();
  const sbKey = supabase ? "sb" : "mock";
  const tgId = useTelegramUserId();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["products", debouncedQ, cat, sbKey],
    queryFn: () =>
      fetchProducts(supabase, {
        search: debouncedQ,
        category: cat === "Hammasi" ? undefined : cat,
        limit: 40,
      }),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });

  const favQ = useQuery({
    queryKey: ["fav-ids", tgId],
    queryFn: () => fetchFavoriteIds(supabase, tgId),
    staleTime: 120_000,
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

  return (
    <div className="space-y-5 pb-6">
      <div>
        <h1 className="text-xl font-black tracking-tight text-white">Mahsulotlar</h1>
        <p className="mt-1 text-sm text-gz-muted">Qidiring, filtrlang va saqlang.</p>
      </div>

      <div className="relative">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Masalan: qizga sovg‘a"
          className="w-full rounded-2xl border border-gz-border bg-gz-surface/95 py-3.5 pl-4 pr-4 text-sm text-white shadow-inner shadow-black/20 placeholder:text-gz-muted focus:border-emerald-500/40 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
          autoComplete="off"
        />
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
                  ? "bg-gz-accent text-black ring-gz-accent shadow-lg shadow-emerald-900/20"
                  : "bg-gz-elevated text-gz-muted ring-white/10 hover:text-white"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
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

      {query.isLoading ? (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : list.length === 0 ? (
        <EmptyState
          emoji="😕"
          title="Mahsulotlar topilmadi"
          hint="Boshqa so‘z yoki kategoriya bilan qidirib ko‘ring."
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
