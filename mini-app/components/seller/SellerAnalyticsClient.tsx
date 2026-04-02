"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatPriceUZS } from "@/lib/format";
import { getTelegramWebApp } from "@/lib/telegram";

type SellerStats = {
  shopCount: number;
  productCount: number;
  orderCount: number;
  revenueApprox: number;
  shopNames: string[];
  hint?: string;
};

export default function SellerAnalyticsClient() {
  const [stats, setStats] = useState<SellerStats | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initData = getTelegramWebApp()?.initData ?? "";
    if (!initData) {
      setLoading(false);
      setErr("telegram");
      return;
    }
    let c = false;
    void (async () => {
      try {
        const res = await fetch("/api/stats/seller", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ initData }),
        });
        if (c) return;
        if (!res.ok) {
          setErr("load");
          setLoading(false);
          return;
        }
        setStats((await res.json()) as SellerStats);
      } catch {
        if (!c) setErr("load");
      } finally {
        if (!c) setLoading(false);
      }
    })();
    return () => {
      c = true;
    };
  }, []);

  return (
    <div className="space-y-5 pb-8">
      <Link href="/seller" className="text-xs text-gz-accent2">
        ← Sotuvchi paneli
      </Link>
      <h1 className="text-xl font-black text-white">📊 Analitika</h1>
      <p className="text-sm text-gz-muted">
        Qisqa ko‘rsatkichlar — buyurtmalar oxirgi yozuvlar bo‘yicha taxminiy.
      </p>

      {loading ? <p className="text-sm text-gz-muted">Yuklanmoqda…</p> : null}
      {err === "telegram" ? (
        <p className="text-xs text-amber-200">Mini App ichida oching.</p>
      ) : null}
      {err === "load" ? <p className="text-xs text-rose-300">Ma’lumot olinmadi.</p> : null}

      {stats?.hint === "no_username" ? (
        <p className="text-xs text-sky-200">Telegram username kerak.</p>
      ) : null}

      {stats ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/[0.08] bg-gz-surface p-4 shadow-card">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gz-muted">Do‘konlar</p>
            <p className="mt-1 text-2xl font-black text-white">{stats.shopCount}</p>
            <p className="mt-2 text-xs text-gz-muted">{stats.shopNames.join(", ") || "—"}</p>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-gz-surface p-4 shadow-card">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gz-muted">Mahsulotlar</p>
            <p className="mt-1 text-2xl font-black text-gz-accent">{stats.productCount}</p>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-gz-surface p-4 shadow-card">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gz-muted">Buyurtmalar*</p>
            <p className="mt-1 text-2xl font-black text-violet-200">{stats.orderCount}</p>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-gz-surface p-4 shadow-card">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gz-muted">Tushum*</p>
            <p className="mt-1 text-lg font-black text-amber-300">{formatPriceUZS(stats.revenueApprox)}</p>
          </div>
        </div>
      ) : null}

      {stats ? (
        <p className="text-[10px] text-gz-muted">
          * Skaner chegarasi va mahsulot mosligi bo‘yicha taxmin. To‘liq hisobot keyin SQL / BI bilan
          kengaytiriladi.
        </p>
      ) : null}
    </div>
  );
}
