"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/product/ProductCard";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";
import { useSupabase } from "@/hooks/useSupabase";
import { useTelegramUserId } from "@/hooks/useTelegramUser";
import { fetchFavoriteIds, toggleFavorite } from "@/services/favorites";
import { fetchProductsForShop } from "@/services/products";
import { fetchShopById } from "@/services/shops";

export default function ShopDetailClient({ id }: { id: string }) {
  const supabase = useSupabase();
  const tgId = useTelegramUserId();
  const qc = useQueryClient();

  const shopQ = useQuery({
    queryKey: ["shop", id],
    queryFn: () => fetchShopById(supabase, id),
  });

  const prodQ = useQuery({
    queryKey: ["shop-products", id],
    queryFn: () => fetchProductsForShop(supabase, id),
    enabled: Boolean(id),
  });

  const favQ = useQuery({
    queryKey: ["fav-ids", tgId],
    queryFn: () => fetchFavoriteIds(supabase, tgId),
  });

  const favSet = new Set(favQ.data ?? []);

  const s = shopQ.data;

  if (shopQ.isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-36 animate-pulse rounded-3xl bg-white/5" />
        <div className="h-24 animate-pulse rounded-3xl bg-white/5" />
      </div>
    );
  }

  if (!s) {
    return <p className="text-gz-muted">Do‘kon topilmadi.</p>;
  }

  const banner =
    s.banner_url ||
    "https://placehold.co/800x280/161d2e/60a5fa/png?text=Gift+Zone";
  const logo =
    s.logo_url || "https://placehold.co/160x160/161d2e/34d399/png?text=GZ";

  return (
    <div className="space-y-5 pb-8">
      <Link href="/shops" className="text-xs font-semibold text-gz-accent2">
        ← Do‘konlar ro‘yxati
      </Link>
      <div className="relative h-36 w-full overflow-hidden rounded-3xl border border-gz-border">
        <Image src={banner} alt="" fill className="object-cover" unoptimized />
      </div>
      <div className="flex gap-3">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl ring-2 ring-white/20">
          <Image src={logo} alt="" fill className="object-cover" unoptimized />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-black text-white">{s.name}</h1>
            {s.is_featured ? <Badge variant="vip">VIP</Badge> : null}
          </div>
          <p className="text-sm text-gz-muted">📍 {s.city ?? "Shahar"}</p>
          {s.owner_telegram_username ? (
            <a
              href={`https://t.me/${s.owner_telegram_username.replace(/^@/, "")}`}
              className="mt-1 inline-block text-sm font-semibold text-gz-accent2"
            >
              Telegram: @{s.owner_telegram_username}
            </a>
          ) : null}
        </div>
      </div>
      <p className="text-sm leading-relaxed text-gz-muted">{s.description}</p>

      <div>
        <h2 className="mb-3 text-lg font-bold text-white">Mahsulotlar</h2>
        {prodQ.isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : (prodQ.data ?? []).length === 0 ? (
          <EmptyState emoji="🛍" title="Bu do‘konda hozircha mahsulot yo‘q" />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {(prodQ.data ?? []).map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                saved={favSet.has(p.id)}
                onToggleSave={async () => {
                  await toggleFavorite(supabase, tgId, p.id);
                  void qc.invalidateQueries({ queryKey: ["fav-ids"] });
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
