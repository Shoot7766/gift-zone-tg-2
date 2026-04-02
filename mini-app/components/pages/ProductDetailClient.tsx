"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatPriceUZS } from "@/lib/format";
import { getTelegramWebApp } from "@/lib/telegram";
import { useSupabase } from "@/hooks/useSupabase";
import { useTelegramUserId } from "@/hooks/useTelegramUser";
import { useCart } from "@/hooks/useCart";
import { fetchFavoriteIds, toggleFavorite } from "@/services/favorites";
import { fetchProductById } from "@/services/products";

export default function ProductDetailClient({ id }: { id: string }) {
  const supabase = useSupabase();
  const tgId = useTelegramUserId();
  const qc = useQueryClient();
  const { add } = useCart();

  const q = useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchProductById(supabase, id),
    staleTime: 60_000,
  });

  const favQ = useQuery({
    queryKey: ["fav-ids", tgId],
    queryFn: () => fetchFavoriteIds(supabase, tgId),
    staleTime: 120_000,
  });

  const saved = favQ.data?.includes(id) ?? false;

  const writeSeller = useCallback(() => {
    const u = q.data?.shops?.owner_telegram_username;
    if (!u) return;
    const tw = getTelegramWebApp();
    const url = `https://t.me/${u.replace(/^@/, "")}`;
    if (tw?.openTelegramLink) tw.openTelegramLink(url);
    else window.open(url, "_blank");
  }, [q.data?.shops?.owner_telegram_username]);

  if (q.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="aspect-square w-full rounded-3xl" />
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-6 w-1/3" />
      </div>
    );
  }

  const p = q.data;
  if (!p) {
    return (
      <p className="text-center text-gz-muted">Mahsulot topilmadi.</p>
    );
  }

  const img =
    p.image_url ||
    "https://placehold.co/800x800/161d2e/34d399/png?text=Gift+Zone";

  return (
    <div className="space-y-4 pb-8">
      <Link href="/products" className="text-xs font-semibold text-gz-accent2">
        ← Mahsulotlarga qaytish
      </Link>
      <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-gz-border bg-black/30">
        <Image src={img} alt="" fill className="object-cover" sizes="(max-width: 768px) 100vw, 480px" />
      </div>
      <div>
        <h1 className="text-2xl font-black text-white">{p.name}</h1>
        <p className="mt-1 text-sm text-gz-muted">{p.shops?.name}</p>
        <p className="mt-3 text-2xl font-extrabold text-gz-accent">
          {formatPriceUZS(p.price)}
        </p>
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          {p.product_type === "service" ? (
            <span className="rounded-lg bg-violet-500/15 px-2 py-1 font-semibold text-violet-200 ring-1 ring-violet-400/25">
              🛎 Xizmat
              {p.service_type ? ` · ${p.service_type}` : ""}
            </span>
          ) : typeof p.stock === "number" ? (
            <span className="rounded-lg bg-white/10 px-2 py-1 font-semibold text-gz-muted ring-1 ring-white/10">
              📦 Omborda: {p.stock} ta
            </span>
          ) : null}
        </div>
        <p className="mt-3 text-sm leading-relaxed text-gz-muted">
          {p.description ?? "Tavsif qo‘shilmagan."}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" className="flex-1 min-w-[140px]" onClick={writeSeller}>
          📩 Sotuvchiga yozish
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={async () => {
            await toggleFavorite(supabase, tgId, id);
            void qc.invalidateQueries({ queryKey: ["fav-ids"] });
          }}
        >
          {saved ? "★ Saqlangan" : "⭐ Saqlash"}
        </Button>
      </div>
      <Button
        type="button"
        variant="secondary"
        className="w-full"
        onClick={() =>
          add({
            productId: p.id,
            name: p.name,
            price: p.price,
            qty: 1,
            sellerUsername: p.shops?.owner_telegram_username ?? null,
            shopName: p.shops?.name ?? null,
          })
        }
      >
        🧺 Savatchaga qo‘shish
      </Button>
    </div>
  );
}
