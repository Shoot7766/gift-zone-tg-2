"use client";

import Image from "next/image";
import Link from "next/link";
import { memo, useCallback } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatPriceUZS } from "@/lib/format";
import { getTelegramWebApp } from "@/lib/telegram";
import type { ProductWithShop } from "@/types/database";

const badgeLabel: Record<string, string> = {
  hot: "🔥 Mashhur",
  star: "⭐ Tavsiya etiladi",
  top: "🔝 Top",
};

function ProductCardInner({
  product,
  onToggleSave,
  saved,
}: {
  product: ProductWithShop;
  onToggleSave?: () => void;
  saved?: boolean;
}) {
  const shop = product.shops;
  const img =
    product.image_url ||
    "https://placehold.co/600x450/161d2e/34d399/png?text=Gift+Zone";

  const writeSeller = useCallback(() => {
    const u = shop?.owner_telegram_username;
    if (!u) return;
    const tw = getTelegramWebApp();
    const url = `https://t.me/${u.replace(/^@/, "")}`;
    if (tw?.openTelegramLink) tw.openTelegramLink(url);
    else window.open(url, "_blank");
  }, [shop?.owner_telegram_username]);

  return (
    <article className="group overflow-hidden rounded-3xl border border-gz-border bg-gradient-to-b from-gz-surface to-gz-bg shadow-card transition hover:border-emerald-500/25 hover:shadow-glow">
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/30">
          <Image
            src={img}
            alt=""
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
            sizes="(max-width:768px) 50vw, 33vw"
            unoptimized
          />
          {product.badge ? (
            <div className="absolute left-2 top-2">
              <Badge variant="vip">{badgeLabel[product.badge]}</Badge>
            </div>
          ) : null}
        </div>
      </Link>
      <div className="space-y-2 p-3.5">
        <Link href={`/products/${product.id}`}>
          <h3 className="line-clamp-2 text-[15px] font-bold leading-snug text-white">
            {product.name}
          </h3>
        </Link>
        <p className="text-xs text-gz-muted">{shop?.name ?? "Do‘kon"}</p>
        <p className="text-lg font-extrabold text-gz-accent">{formatPriceUZS(product.price)}</p>
        <div className="flex flex-wrap gap-2 pt-1">
          <Button
            type="button"
            variant="secondary"
            className="flex-1 min-w-[120px] py-2.5 text-xs"
            onClick={writeSeller}
          >
            📩 Sotuvchiga yozish
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="min-w-[100px] py-2.5 text-xs"
            onClick={onToggleSave}
          >
            {saved ? "★ Saqlangan" : "⭐ Saqlash"}
          </Button>
        </div>
      </div>
    </article>
  );
}

export const ProductCard = memo(ProductCardInner);
