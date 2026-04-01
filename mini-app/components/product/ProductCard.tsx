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
  star: "⭐ Tavsiya",
  top: "🔝 Top",
};

function ProductCardInner({
  product,
  onToggleSave,
  saved,
}: {
  product: ProductWithShop;
  onToggleSave?: (productId: string) => void;
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

  const save = useCallback(() => {
    onToggleSave?.(product.id);
  }, [onToggleSave, product.id]);

  return (
    <article className="group overflow-hidden rounded-2xl border border-gz-border/90 bg-gradient-to-b from-gz-surface to-gz-bg shadow-[0_12px_40px_-20px_rgba(0,0,0,0.85)] transition duration-300 hover:border-emerald-500/30 hover:shadow-[0_16px_48px_-16px_rgba(16,185,129,0.25)]">
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/25">
          <Image
            src={img}
            alt=""
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.04]"
            sizes="(max-width: 768px) 50vw, 33vw"
            loading="lazy"
          />
          {product.badge ? (
            <div className="absolute left-2 top-2">
              <Badge variant="vip">{badgeLabel[product.badge]}</Badge>
            </div>
          ) : null}
        </div>
      </Link>
      <div className="space-y-2 p-3">
        <Link href={`/products/${product.id}`}>
          <h3 className="line-clamp-2 text-[15px] font-bold leading-snug text-white">
            {product.name}
          </h3>
        </Link>
        <p className="text-xs font-medium text-gz-muted">{shop?.name ?? "Do‘kon"}</p>
        <p className="text-lg font-extrabold tracking-tight text-gz-accent">
          {formatPriceUZS(product.price)}
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <Button
            type="button"
            variant="secondary"
            className="min-h-[40px] flex-1 min-w-[118px] py-2 text-xs font-bold"
            onClick={writeSeller}
          >
            📩 Sotuvchiga yozish
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="min-h-[40px] min-w-[96px] py-2 text-xs font-bold"
            onClick={save}
          >
            {saved ? "★ Saqlangan" : "⭐ Saqlash"}
          </Button>
        </div>
      </div>
    </article>
  );
}

export const ProductCard = memo(ProductCardInner, (prev, next) => {
  return (
    prev.product.id === next.product.id &&
    prev.saved === next.saved &&
    prev.product.price === next.product.price &&
    prev.product.name === next.product.name &&
    prev.product.image_url === next.product.image_url &&
    prev.onToggleSave === next.onToggleSave
  );
});

ProductCard.displayName = "ProductCard";
