"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useCallback, useMemo } from "react";
import { ProductCard } from "@/components/product/ProductCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";
import { useSupabase } from "@/hooks/useSupabase";
import { useTelegramUserId } from "@/hooks/useTelegramUser";
import { fetchFavoriteProducts, toggleFavorite } from "@/services/favorites";

export default function FavoritesPageClient() {
  const supabase = useSupabase();
  const tgId = useTelegramUserId();
  const qc = useQueryClient();
  const sbKey = supabase ? "sb" : "mock";

  const q = useQuery({
    queryKey: ["favorites", tgId, sbKey],
    queryFn: () => fetchFavoriteProducts(supabase, tgId),
    staleTime: 60_000,
  });

  const favSet = useMemo(() => new Set((q.data ?? []).map((p) => p.id)), [q.data]);

  const onSave = useCallback(
    async (productId: string) => {
      await toggleFavorite(supabase, tgId, productId);
      void qc.invalidateQueries({ queryKey: ["fav-ids"] });
      void qc.invalidateQueries({ queryKey: ["favorites"] });
    },
    [supabase, tgId, qc]
  );

  const handleToggleSave = useCallback(
    (productId: string) => {
      void onSave(productId);
    },
    [onSave]
  );

  return (
    <div className="space-y-4 pb-4">
      <h1 className="text-xl font-black tracking-tight text-white">Saqlanganlar</h1>
      <Link href="/products" className="text-xs font-semibold text-gz-accent2">
        Mahsulotlarga o‘tish →
      </Link>

      {q.isLoading ? (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : (q.data ?? []).length === 0 ? (
        <EmptyState
          emoji="⭐"
          title="Saqlangan mahsulotlar yo‘q"
          hint="Yoqtirgan mahsulotlaringizni yulduzcha bilan saqlang."
        />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {(q.data ?? []).map((p) => (
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
