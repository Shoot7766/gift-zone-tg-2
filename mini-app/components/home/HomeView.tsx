"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo } from "react";
import { SearchShortcut } from "@/components/home/SearchShortcut";
import { ProductCard } from "@/components/product/ProductCard";
import { ShopCard } from "@/components/shop/ShopCard";
import { Button } from "@/components/ui/Button";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";
import { useSupabase } from "@/hooks/useSupabase";
import { useTelegramUserId } from "@/hooks/useTelegramUser";
import { MOCK_CATEGORIES } from "@/lib/mock-data";
import { fetchFavoriteIds, toggleFavorite } from "@/services/favorites";
import { fetchFeaturedProducts, fetchProducts } from "@/services/products";
import { fetchApprovedShops } from "@/services/shops";

export function HomeView() {
  const supabase = useSupabase();
  const tgId = useTelegramUserId();
  const qc = useQueryClient();

  const productsQ = useQuery({
    queryKey: ["home-products", supabase ? "sb" : "mock"],
    queryFn: () => fetchFeaturedProducts(supabase, 10),
  });

  const shopsQ = useQuery({
    queryKey: ["home-shops", supabase ? "sb" : "mock"],
    queryFn: () => fetchApprovedShops(supabase).then((s) => s.slice(0, 6)),
  });

  const trendingQ = useQuery({
    queryKey: ["home-trending"],
    queryFn: () => fetchProducts(supabase, { limit: 6 }),
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

  const birthday = productsQ.data?.filter((p) =>
    (p.category ?? "").toLowerCase().includes("tug")
  );

  return (
    <div className="space-y-8 pb-6">
      <section className="relative overflow-hidden rounded-3xl border border-gz-border bg-gradient-to-br from-emerald-900/40 via-gz-surface to-sky-900/35 p-5 shadow-card">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-0 h-44 w-44 rounded-full bg-sky-500/15 blur-3xl" />
        <p className="text-xs font-bold uppercase tracking-widest text-gz-accent">Gift Zone</p>
        <h1 className="mt-2 text-2xl font-black leading-tight text-white">
          🎁 Sovg‘a topish endi ancha oson
        </h1>
        <p className="mt-2 max-w-md text-sm text-gz-muted">
          Kerakli mahsulotlarni tez toping, do‘konlar bilan bog‘laning va buyurtma bering.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/ai">
            <Button type="button" className="py-2.5 text-sm">
              🤖 AI orqali topish
            </Button>
          </Link>
          <Link href="/products">
            <Button type="button" variant="secondary" className="py-2.5 text-sm">
              🛍 Mahsulotlarni ko‘rish
            </Button>
          </Link>
        </div>
        <div className="mt-5">
          <SearchShortcut />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold text-white">Tez kategoriyalar</h2>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {MOCK_CATEGORIES.filter((c) => c !== "Hammasi").map((c) => (
            <Link
              key={c}
              href={`/products?category=${encodeURIComponent(c)}`}
              className="shrink-0 rounded-2xl border border-gz-border bg-gz-elevated px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/5"
            >
              {c}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">🔥 Bugun mashhur</h2>
          <Link href="/products" className="text-xs font-semibold text-gz-accent2">
            Hammasi →
          </Link>
        </div>
        {trendingQ.isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {(trendingQ.data ?? []).slice(0, 4).map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                saved={favSet.has(p.id)}
                onToggleSave={() => void onSave(p.id)}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">💝 Tavsiya etilgan sovg‘alar</h2>
          <Link href="/products" className="text-xs font-semibold text-gz-accent2">
            Ko‘proq →
          </Link>
        </div>
        {productsQ.isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {(productsQ.data ?? []).map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                saved={favSet.has(p.id)}
                onToggleSave={() => void onSave(p.id)}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold text-white">🎉 Tug‘ilgan kun uchun</h2>
        <div className="grid grid-cols-2 gap-3">
          {(birthday?.length ? birthday : productsQ.data ?? [])
            .slice(0, 4)
            .map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                saved={favSet.has(p.id)}
                onToggleSave={() => void onSave(p.id)}
              />
            ))}
        </div>
      </section>

      <section className="rounded-3xl border border-gz-border bg-gradient-to-r from-violet-900/30 to-emerald-900/20 p-4">
        <h3 className="text-base font-bold text-white">🎁 Chegirma oynasi</h3>
        <p className="mt-1 text-sm text-gz-muted">
          VIP do‘konlarda ertaga maxsus aksiya. Hoziroq saqlab qo‘ying!
        </p>
        <Link href="/shops" className="mt-3 inline-block">
          <Button type="button" variant="secondary" className="py-2 text-xs">
            Do‘konlarni ko‘rish
          </Button>
        </Link>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">🏪 Top do‘konlar</h2>
          <Link href="/shops" className="text-xs font-semibold text-gz-accent2">
            Barchasi →
          </Link>
        </div>
        <div className="space-y-3">
          {(shopsQ.data ?? []).map((s) => (
            <ShopCard key={s.id} shop={s} />
          ))}
        </div>
      </section>

      <section className="grid grid-cols-3 gap-2 text-center text-[11px] text-gz-muted">
        <div className="rounded-2xl border border-gz-border bg-gz-surface p-3">
          <div className="text-lg">⚡</div>
          <div className="mt-1 font-semibold text-white">Tez yetkazish</div>
        </div>
        <div className="rounded-2xl border border-gz-border bg-gz-surface p-3">
          <div className="text-lg">🛡</div>
          <div className="mt-1 font-semibold text-white">Tekshirilgan do‘konlar</div>
        </div>
        <div className="rounded-2xl border border-gz-border bg-gz-surface p-3">
          <div className="text-lg">💬</div>
          <div className="mt-1 font-semibold text-white">To‘g‘ridan-to‘g‘ri aloqa</div>
        </div>
      </section>
    </div>
  );
}
