"use client";

import Image from "next/image";
import Link from "next/link";
import { memo } from "react";
import { Badge } from "@/components/ui/Badge";
import type { DbShop } from "@/types/database";

function ShopCardInner({ shop }: { shop: DbShop }) {
  const logo =
    shop.logo_url ||
    "https://placehold.co/128x128/161d2e/60a5fa/png?text=GZ";

  return (
    <Link
      href={`/shops/${shop.id}`}
      className="flex gap-3 rounded-3xl border border-gz-border bg-gradient-to-r from-gz-surface to-gz-elevated p-3.5 shadow-card transition hover:border-sky-500/30"
    >
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl ring-1 ring-white/10">
        <Image src={logo} alt="" fill className="object-cover" unoptimized />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <h3 className="truncate text-[15px] font-bold text-white">{shop.name}</h3>
          {shop.is_featured ? <Badge variant="vip">VIP</Badge> : null}
          {shop.subscription_type === "vip" ? <Badge variant="top">TOP</Badge> : null}
          <Badge variant="trust">Tavsiya etiladi</Badge>
        </div>
        <p className="mt-1 line-clamp-2 text-xs text-gz-muted">{shop.description}</p>
        <p className="mt-1 text-[11px] text-gz-muted">📍 {shop.city ?? "Shahar"}</p>
        <div className="mt-2 flex flex-wrap gap-1">
          <span className="rounded-lg bg-white/5 px-2 py-0.5 text-[10px] text-gz-muted">
            Tez javob beradi
          </span>
          <span className="rounded-lg bg-white/5 px-2 py-0.5 text-[10px] text-gz-muted">
            Ishonchli sotuvchi
          </span>
          <span className="rounded-lg bg-white/5 px-2 py-0.5 text-[10px] text-gz-muted">
            100+ mijoz tanladi
          </span>
        </div>
      </div>
    </Link>
  );
}

export const ShopCard = memo(ShopCardInner);
