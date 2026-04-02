"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
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

export default function SellerDashboardClient() {
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

    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/stats/seller", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ initData }),
        });
        if (cancelled) return;
        if (res.status === 503) {
          setErr("server");
          setLoading(false);
          return;
        }
        if (res.status === 401) {
          setErr("session");
          setLoading(false);
          return;
        }
        if (!res.ok) {
          setErr("unknown");
          setLoading(false);
          return;
        }
        const j = (await res.json()) as SellerStats;
        setStats(j);
      } catch {
        if (!cancelled) setErr("network");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-xl font-black text-white">Sotuvchi boshqaruvi</h1>
        <p className="text-sm text-gz-muted">
          Do‘konlar <code className="rounded bg-white/10 px-1">shops.owner_telegram_username</code> bo‘yicha
          bog‘lanadi (Telegram username).
        </p>
      </div>

      {loading ? <p className="text-sm text-gz-muted">Yuklanmoqda…</p> : null}

      {err === "telegram" ? (
        <div className="rounded-2xl border border-amber-500/35 bg-amber-950/25 p-3 text-[11px] text-amber-100">
          Mini App ichida oching — statistika Telegram orqali tekshiriladi.
        </div>
      ) : null}

      {err === "server" ? (
        <div className="rounded-2xl border border-amber-500/35 bg-amber-950/25 p-3 text-[11px] text-amber-100">
          Server kalitlari: <code className="rounded bg-black/30 px-1">TELEGRAM_BOT_TOKEN</code> +{" "}
          <code className="rounded bg-black/30 px-1">SUPABASE_SERVICE_ROLE_KEY</code>.
        </div>
      ) : null}

      {err === "session" || err === "network" || err === "unknown" ? (
        <div className="rounded-2xl border border-rose-500/35 bg-rose-950/25 p-3 text-[11px] text-rose-100">
          Ma’lumot olinmadi. Keyinroq urinib ko‘ring.
        </div>
      ) : null}

      {stats?.hint === "no_username" ? (
        <div className="rounded-2xl border border-sky-500/35 bg-sky-950/25 p-3 text-[11px] text-sky-100">
          Telegram profilida <strong>username</strong> yo‘q — do‘konni bog‘lash uchun @username qo‘ying va{" "}
          <code className="rounded bg-black/30 px-1">shops.owner_telegram_username</code> maydoniga shu nomni
          yozing.
        </div>
      ) : null}

      {stats && stats.shopCount > 0 ? (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-3 text-[11px] text-emerald-100/95">
          Do‘konlar: {stats.shopNames.join(", ")}
        </div>
      ) : null}

      {stats ? (
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-2xl border border-gz-border bg-gz-surface p-3 text-center">
            <p className="text-[10px] text-gz-muted">Do‘konlar</p>
            <p className="text-lg font-black text-white">{stats.shopCount}</p>
          </div>
          <div className="rounded-2xl border border-gz-border bg-gz-surface p-3 text-center">
            <p className="text-[10px] text-gz-muted">Buyurtmalar*</p>
            <p className="text-lg font-black text-gz-accent">{stats.orderCount}</p>
          </div>
          <div className="rounded-2xl border border-gz-border bg-gz-surface p-3 text-center">
            <p className="text-[10px] text-gz-muted">Tushum*</p>
            <p className="text-[11px] font-black leading-tight text-amber-300">
              {formatPriceUZS(stats.revenueApprox)}
            </p>
          </div>
        </div>
      ) : null}

      {stats ? (
        <p className="text-[10px] text-gz-muted">
          * Oxirgi {2500} ta buyurtma so‘rovi skanerlangan; mahsulotlaringizga tegishli qatorlar hisoblangan.
          Mahsulotlar: <span className="text-white">{stats.productCount}</span> ta.
        </p>
      ) : null}

      <div className="rounded-3xl border border-amber-500/25 bg-gradient-to-r from-amber-950/40 to-orange-950/30 p-4">
        <h2 className="text-sm font-bold text-amber-200">Rejalar (ko‘rinish)</h2>
        <div className="mt-3 space-y-2">
          <div className="flex justify-between rounded-2xl bg-black/20 px-3 py-2 text-sm">
            <span>Basic</span>
            <Badge variant="neutral">Bepul</Badge>
          </div>
          <div className="flex justify-between rounded-2xl bg-black/20 px-3 py-2 text-sm ring-1 ring-sky-500/40">
            <span>Pro</span>
            <Badge variant="top">Tavsiya</Badge>
          </div>
          <div className="flex justify-between rounded-2xl bg-black/20 px-3 py-2 text-sm ring-1 ring-amber-400/50">
            <span>VIP</span>
            <Badge variant="vip">Top joylashuv</Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-2">
        <Link
          href="/seller/shop"
          className="rounded-2xl border border-gz-border bg-gz-elevated px-4 py-3 text-sm font-semibold"
        >
          🏪 Do‘konim
        </Link>
        <Link
          href="/seller/add"
          className="rounded-2xl border border-emerald-500/30 bg-emerald-950/25 px-4 py-3 text-sm font-semibold text-emerald-100"
        >
          ➕ Mahsulot qo‘shish
        </Link>
        <Link
          href="/seller/products"
          className="rounded-2xl border border-gz-border bg-gz-elevated px-4 py-3 text-sm font-semibold"
        >
          📦 Mahsulotlarim
        </Link>
        <Link
          href="/seller/orders"
          className="rounded-2xl border border-gz-border bg-gz-elevated px-4 py-3 text-sm font-semibold"
        >
          🧾 Buyurtmalar
        </Link>
        <Link
          href="/seller/analytics"
          className="rounded-2xl border border-gz-border bg-gz-elevated px-4 py-3 text-sm font-semibold"
        >
          📊 Analitika
        </Link>
      </div>

      <Link href="/profile">
        <Button type="button" variant="ghost" className="w-full">
          ← Profilga qaytish
        </Button>
      </Link>
    </div>
  );
}
