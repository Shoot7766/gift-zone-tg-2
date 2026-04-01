"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { getTelegramWebApp } from "@/lib/telegram";

type Stats = {
  users: number | null;
  shops: number | null;
  products: number | null;
  orders: number | null;
  pendingShops: number | null;
};

function cell(label: string, value: string) {
  return (
    <div className="rounded-3xl border border-gz-border bg-gz-surface p-4 shadow-card">
      <p className="text-xs text-gz-muted">{label}</p>
      <p className="text-2xl font-black text-white">{value}</p>
    </div>
  );
}

export default function AdminDashboardClient() {
  const [stats, setStats] = useState<Stats | null>(null);
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
        const res = await fetch("/api/stats/admin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ initData }),
        });
        if (cancelled) return;
        if (res.status === 503) {
          const j = (await res.json().catch(() => ({}))) as { error?: string };
          setErr(j.error === "admin_ids_not_configured" ? "admin_ids" : "server");
          setLoading(false);
          return;
        }
        if (res.status === 403) {
          setErr("forbidden");
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
        const j = (await res.json()) as Stats;
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

  const fmt = (n: number | null | undefined) => (n == null ? "—" : String(n));

  return (
    <div className="space-y-6 pb-8">
      <h1 className="text-xl font-black text-white">Admin paneli</h1>

      {loading ? (
        <p className="text-sm text-gz-muted">Statistika yuklanmoqda…</p>
      ) : null}

      {err === "telegram" ? (
        <div className="rounded-2xl border border-amber-500/35 bg-amber-950/25 p-3 text-[11px] text-amber-100">
          Telegram Mini App ichida oching — admin statistikasi uchun <code className="rounded bg-black/30 px-1">initData</code>{" "}
          kerak.
        </div>
      ) : null}

      {err === "forbidden" ? (
        <div className="rounded-2xl border border-rose-500/35 bg-rose-950/25 p-3 text-[11px] text-rose-100">
          Sizda admin huquqi yo‘q. Serverda{" "}
          <code className="rounded bg-black/30 px-1">ADMIN_TELEGRAM_IDS</code> ga o‘z Telegram ID ingizni
          qo‘shing (vergul bilan).
        </div>
      ) : null}

      {err === "admin_ids" ? (
        <div className="rounded-2xl border border-amber-500/35 bg-amber-950/25 p-3 text-[11px] text-amber-100">
          Admin ro‘yxati sozlanmagan. <code className="rounded bg-black/30 px-1">ADMIN_TELEGRAM_IDS</code>{" "}
          (Telegram user id) ni Vercel / .env ga qo‘shing.
        </div>
      ) : null}

      {err === "server" ? (
        <div className="rounded-2xl border border-amber-500/35 bg-amber-950/25 p-3 text-[11px] text-amber-100">
          <code className="rounded bg-black/30 px-1">TELEGRAM_BOT_TOKEN</code> va{" "}
          <code className="rounded bg-black/30 px-1">SUPABASE_SERVICE_ROLE_KEY</code> kerak.
        </div>
      ) : null}

      {err === "session" || err === "network" || err === "unknown" ? (
        <div className="rounded-2xl border border-rose-500/35 bg-rose-950/25 p-3 text-[11px] text-rose-100">
          Ma’lumot olinmadi. Ilovani qayta oching yoki keyinroq urinib ko‘ring.
        </div>
      ) : null}

      {stats ? (
        <>
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-3 text-[11px] text-emerald-100/95">
            <strong className="font-bold">Supabase</strong> — jadval qatorlari soni (service role). Buyurtmalar:{" "}
            <code className="rounded bg-black/30 px-1">order_requests</code>.
          </div>
          <div className="grid grid-cols-2 gap-3">
            {cell("Foydalanuvchilar (users)", fmt(stats.users))}
            {cell("Do‘konlar", fmt(stats.shops))}
            {cell("Mahsulotlar", fmt(stats.products))}
            {cell("Buyurtmalar (so‘rovlar)", fmt(stats.orders))}
          </div>
          <div className="rounded-3xl border border-sky-500/20 bg-sky-950/20 p-4">
            <h2 className="text-sm font-bold text-sky-200">Tasdiqlash navbati</h2>
            <p className="mt-2 text-sm text-gz-muted">
              <code className="rounded bg-black/20 px-1">is_approved = false</code> bo‘lgan do‘konlar:{" "}
              <span className="font-black text-white">{fmt(stats.pendingShops)}</span>
            </p>
            <Badge variant="top" className="mt-2">
              Haqiqiy son
            </Badge>
          </div>
        </>
      ) : null}

      {!loading && !err && !stats ? (
        <p className="text-sm text-gz-muted">Statistika mavjud emas.</p>
      ) : null}

      <Link href="/admin/shops" className="block rounded-2xl bg-gz-elevated px-4 py-3 text-sm font-semibold">
        🏪 Do‘konlarni boshqarish
      </Link>
      <Link href="/profile" className="block text-center text-sm text-gz-accent2">
        ← Profil
      </Link>
    </div>
  );
}
