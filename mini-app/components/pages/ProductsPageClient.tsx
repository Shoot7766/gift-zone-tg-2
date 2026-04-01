"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useMemo, useState } from "react";
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
  const debouncedQ = useDebouncedValue(q, 350);
  const supabase = useSupabase();
  const tgId = useTelegramUserId();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["products", debouncedQ, cat, supabase ? "sb" : "mock"],
    queryFn: () =>
      fetchProducts(supabase, {
        search: debouncedQ,
        category: cat === "Hammasi" ? undefined : cat,
        limit: 48,
      }),
  });

  const favQ = useQuery({
    queryKey: ["fav-ids", tgId],
    queryFn: () => fetchFavoriteIds(supabase, tgId),
  });

  const favSet = useMemo(() => new Set(favQ.data ?? []), [favQ.data]);

  const onSave = async (productId: string) => {
    await toggleFavorite(supabase, tgId, productId);
    void qc.invalidateQueries({ queryKey: ["fav-ids"] });
  };

  const list = query.data ?? [];

  return (
    <div className="space-y-4 pb-4">
      <div>
        <h1 className="text-xl font-black text-white">Mahsulotlar</h1>
        <p className="text-sm text-gz-muted">Filtrlang, qidiring, saqlang.</p>
      </div>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Qidiruv…"
        className="w-full rounded-2xl border border-gz-border bg-gz-surface px-4 py-3 text-sm text-white placeholder:text-gz-muted"
      />

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {MOCK_CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCat(c)}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold ring-1 ring-inset transition ${
              cat === c
                ? "bg-gz-accent text-black ring-gz-accent"
                : "bg-gz-elevated text-gz-muted ring-white/10"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-gz-muted">
        <span>
          {query.isFetching ? "Yuklanmoqda…" : `${list.length} ta natija`}
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
          title="Hozircha mahsulotlar topilmadi"
          hint="👉 Boshqa qidiruv yoki kategoriya bilan urinib ko‘ring."
        />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {list.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              saved={favSet.has(p.id)}
              onToggleSave={() => void onSave(p.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
