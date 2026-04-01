"use client";

import Link from "next/link";
import { ShopCard } from "@/components/shop/ShopCard";
import { Button } from "@/components/ui/Button";
import type { DbShop } from "@/types/database";

export function HomeBottomSections({ shops }: { shops: DbShop[] }) {
  return (
    <>
      <section className="rounded-3xl border border-gz-border bg-gradient-to-r from-violet-900/35 via-gz-surface to-emerald-900/25 p-5 shadow-card">
        <h3 className="text-base font-bold tracking-tight text-white">🎁 Chegirma oynasi</h3>
        <p className="mt-2 text-sm leading-relaxed text-gz-muted">
          VIP do‘konlarda maxsus aksiyalar. Sevimli do‘konlaringizni hoziroq ko‘ring.
        </p>
        <Link href="/shops" className="mt-4 inline-block">
          <Button type="button" variant="secondary" className="py-2.5 text-xs font-bold">
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
          {shops.map((s) => (
            <ShopCard key={s.id} shop={s} />
          ))}
        </div>
      </section>

      <section className="grid grid-cols-3 gap-2 text-center text-[11px] text-gz-muted">
        <div className="rounded-2xl border border-gz-border/80 bg-gz-surface/90 p-3 shadow-sm">
          <div className="text-lg">⚡</div>
          <div className="mt-1 font-semibold text-white">Tez yetkazish</div>
        </div>
        <div className="rounded-2xl border border-gz-border/80 bg-gz-surface/90 p-3 shadow-sm">
          <div className="text-lg">🛡</div>
          <div className="mt-1 font-semibold text-white">Tekshirilgan do‘konlar</div>
        </div>
        <div className="rounded-2xl border border-gz-border/80 bg-gz-surface/90 p-3 shadow-sm">
          <div className="text-lg">💬</div>
          <div className="mt-1 font-semibold text-white">To‘g‘ridan-to‘g‘ri aloqa</div>
        </div>
      </section>
    </>
  );
}
