"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useMemo } from "react";
import { SearchShortcut } from "@/components/home/SearchShortcut";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/Button";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";
import { useSupabase } from "@/hooks/useSupabase";
import { useTelegramUserId } from "@/hooks/useTelegramUser";
import { MOCK_CATEGORIES } from "@/lib/mock-data";
import { fetchFavoriteIds, toggleFavorite } from "@/services/favorites";
import { fetchHomeFeed } from "@/services/home";
import type { ProductWithShop } from "@/types/database";

const HomeBottomSections = dynamic(
  () => import("./HomeBottomSections").then((m) => ({ default: m.HomeBottomSections })),
  {
    loading: () => (
      <div className="space-y-4 pb-2">
        <div className="h-40 animate-pulse rounded-3xl bg-white/5" />
        <div className="h-56 animate-pulse rounded-3xl bg-white/5" />
      </div>
    ),
  }
);

function useSupabaseKey(s: ReturnType<typeof useSupabase>) {
  return s ? "sb" : "mock";
}

export function HomeView() {
  const supabase = useSupabase();
  const sbKey = useSupabaseKey(supabase);
  const tgId = useTelegramUserId();
  const qc = useQueryClient();

  const homeQ = useQuery({
    queryKey: ["home-feed", sbKey],
    queryFn: () => fetchHomeFeed(supabase),
    staleTime: 90_000,
  });

  const favQ = useQuery({
    queryKey: ["fav-ids", tgId],
    queryFn: () => fetchFavoriteIds(supabase, tgId),
    staleTime: 120_000,
  });

  const pool = useMemo(() => homeQ.data?.pool ?? [], [homeQ.data?.pool]);
  const shops = useMemo(() => homeQ.data?.shops ?? [], [homeQ.data?.shops]);

  const trending = useMemo(() => pool.slice(0, 4), [pool]);

  const featured = useMemo(() => {
    const f = pool.filter((p) => p.shops?.is_featured);
    const src = f.length >= 4 ? f : pool;
    return src.slice(0, 4);
  }, [pool]);

  const birthday = useMemo(() => {
    const b = pool.filter((p) => (p.category ?? "").toLowerCase().includes("tug"));
    const src = b.length >= 4 ? b : pool;
    return src.slice(0, 4);
  }, [pool]);

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

  return (
    <div className="space-y-8 pb-6">
      <section className="relative overflow-hidden rounded-3xl border border-gz-border bg-gradient-to-br from-emerald-950/50 via-gz-surface to-sky-950/40 p-6 shadow-[0_20px_50px_-20px_rgba(16,185,129,0.35)]">
        <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-emerald-400/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-0 h-48 w-48 rounded-full bg-sky-500/10 blur-3xl" />
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gz-accent">Gift Zone</p>
        <h1 className="mt-2 text-2xl font-black leading-tight tracking-tight text-white md:text-[1.65rem]">
          🎁 Sovg‘a topish endi ancha oson
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-gz-muted">
          Kerakli mahsulotlarni tez toping, do‘konlar bilan bog‘laning va buyurtma bering.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link href="/ai">
            <Button type="button" className="py-2.5 text-sm font-bold shadow-lg shadow-emerald-900/30">
              🤖 AI orqali topish
            </Button>
          </Link>
          <Link href="/products">
            <Button type="button" variant="secondary" className="py-2.5 text-sm font-bold">
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
              className="shrink-0 rounded-2xl border border-gz-border bg-gz-elevated px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-white/5 transition hover:border-emerald-500/30"
            >
              {c}
            </Link>
          ))}
        </div>
      </section>

      <HomeProductSection
        title="🔥 Bugun mashhur"
        href="/products"
        linkLabel="Hammasi →"
        loading={homeQ.isLoading}
        products={trending}
        favSet={favSet}
        onToggleSave={handleToggleSave}
      />

      <HomeProductSection
        title="💝 Tavsiya etilgan sovg‘alar"
        href="/products"
        linkLabel="Ko‘proq →"
        loading={homeQ.isLoading}
        products={featured}
        favSet={favSet}
        onToggleSave={handleToggleSave}
      />

      <section>
        <h2 className="mb-3 text-lg font-bold text-white">🎉 Tug‘ilgan kun uchun</h2>
        {homeQ.isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {birthday.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                saved={favSet.has(p.id)}
                onToggleSave={handleToggleSave}
              />
            ))}
          </div>
        )}
      </section>

      <HomeBottomSections shops={shops} />
    </div>
  );
}

const HomeProductSection = ({
  title,
  href,
  linkLabel,
  loading,
  products,
  favSet,
  onToggleSave,
}: {
  title: string;
  href: string;
  linkLabel: string;
  loading: boolean;
  products: ProductWithShop[];
  favSet: Set<string>;
  onToggleSave: (id: string) => void;
}) => (
  <section>
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-lg font-bold text-white">{title}</h2>
      <Link href={href} className="text-xs font-semibold text-gz-accent2">
        {linkLabel}
      </Link>
    </div>
    {loading ? (
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    ) : (
      <div className="grid grid-cols-2 gap-3">
        {products.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            saved={favSet.has(p.id)}
            onToggleSave={onToggleSave}
          />
        ))}
      </div>
    )}
  </section>
);
