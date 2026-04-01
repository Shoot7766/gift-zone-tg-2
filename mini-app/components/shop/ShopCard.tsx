"use client";

import Image from "next/image";
import Link from "next/link";
import { memo, useMemo } from "react";
import { Badge } from "@/components/ui/Badge";
import type { DbShop } from "@/types/database";

function ShopCardInner({ shop }: { shop: DbShop }) {
  const logo =
    shop.logo_url ||
    "https://placehold.co/128x128/161d2e/60a5fa/png?text=GZ";

  const badges = useMemo(() => {
    const list: { key: string; variant: "vip" | "top" | "trust"; label: string }[] = [];
    if (shop.subscription_type === "vip") {
      list.push({ key: "vip", variant: "vip", label: "VIP" });
    }
    if (shop.is_featured) {
      list.push({ key: "top", variant: "top", label: "TOP" });
    }
    return list;
  }, [shop.is_featured, shop.subscription_type]);

  return (
    <Link
      href={`/shops/${shop.id}`}
      className="flex gap-3 rounded-2xl border border-gz-border/90 bg-gradient-to-r from-gz-surface via-gz-elevated/90 to-gz-surface p-4 shadow-[0_12px_36px_-18px_rgba(0,0,0,0.9)] transition hover:border-sky-500/35 hover:shadow-[0_16px_44px_-14px_rgba(56,189,248,0.18)]"
    >
      <div className="relative h-[4.5rem] w-[4.5rem] shrink-0 overflow-hidden rounded-2xl ring-2 ring-white/10">
        <Image src={logo} alt="" fill className="object-cover" sizes="72px" unoptimized />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <h3 className="truncate text-[15px] font-bold text-white">{shop.name}</h3>
          {badges.map((b) => (
            <Badge key={b.key} variant={b.variant}>
              {b.label}
            </Badge>
          ))}
        </div>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-gz-muted">
          {shop.description ?? "Sifatli mahsulotlar va xizmat."}
        </p>
        <p className="mt-1.5 text-[11px] font-medium text-gz-muted">📍 {shop.city ?? "Shahar"}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="rounded-lg bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold text-emerald-200/90 ring-1 ring-emerald-500/20">
            Tez javob beradi
          </span>
          <span className="rounded-lg bg-sky-500/10 px-2 py-1 text-[10px] font-semibold text-sky-200/90 ring-1 ring-sky-500/20">
            Ishonchli sotuvchi
          </span>
        </div>
      </div>
    </Link>
  );
}

export const ShopCard = memo(ShopCardInner);

ShopCard.displayName = "ShopCard";
