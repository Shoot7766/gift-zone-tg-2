"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { formatPriceUZS } from "@/lib/format";
import { getTelegramWebApp } from "@/lib/telegram";

type Line = { productId?: string; name?: string; price?: number; qty?: number };

type OrderRow = {
  id: string;
  created_at: string;
  status: string | null;
  total: number | null;
  myLines: Line[];
};

async function postJson(path: string, body: Record<string, unknown>) {
  const initData = getTelegramWebApp()?.initData ?? "";
  return fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ initData, ...body }),
  });
}

export default function SellerOrdersClient() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [hint, setHint] = useState<string | null>(null);
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setErr(false);
    const res = await postJson("/api/seller/orders-list", {});
    if (!res.ok) {
      setErr(true);
      setLoading(false);
      return;
    }
    const j = (await res.json()) as { orders?: OrderRow[]; hint?: string };
    setOrders(j.orders ?? []);
    setHint(j.hint ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-4 pb-8">
      <Link href="/seller" className="text-xs text-gz-accent2">
        ← Sotuvchi paneli
      </Link>
      <h1 className="text-xl font-black text-white">Buyurtmalar</h1>
      <p className="text-xs text-gz-muted">
        Oxirgi {500} ta buyurtma so‘rovidan sizning mahsulotlaringiz qatori chiqariladi.
      </p>

      {loading ? <p className="text-sm text-gz-muted">Yuklanmoqda…</p> : null}
      {hint === "no_username" ? (
        <p className="text-xs text-amber-200">Telegram username kerak.</p>
      ) : null}
      {err ? <p className="text-xs text-rose-300">Yuklashda xato.</p> : null}

      <Button type="button" variant="secondary" className="text-xs" disabled={loading} onClick={() => void load()}>
        🔄 Yangilash
      </Button>

      <div className="space-y-3">
        {orders.map((o) => {
          const sub = o.myLines.reduce((a, l) => a + Number(l.price || 0) * Math.max(1, Math.floor(Number(l.qty) || 1)), 0);
          return (
            <div key={o.id} className="rounded-2xl border border-gz-border bg-gz-surface p-4">
              <div className="flex flex-wrap justify-between gap-2 text-xs">
                <span className="text-gz-muted">{new Date(o.created_at).toLocaleString("uz-UZ")}</span>
                <span className="font-mono text-[10px] text-gz-muted">{o.id.slice(0, 8)}…</span>
                <span className="rounded bg-white/10 px-2 py-0.5 text-[10px]">{o.status ?? "—"}</span>
              </div>
              <ul className="mt-2 space-y-1 text-sm text-white">
                {o.myLines.map((l, i) => (
                  <li key={`${l.productId}-${i}`}>
                    {l.name ?? l.productId} × {l.qty ?? 1}{" "}
                    <span className="text-gz-muted">
                      ({formatPriceUZS(Number(l.price || 0) * Math.max(1, Math.floor(Number(l.qty) || 1)))})
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-gz-accent">Sizning qatorlar: {formatPriceUZS(sub)}</p>
              {o.total != null ? (
                <p className="text-[10px] text-gz-muted">Butun savatcha jami: {formatPriceUZS(o.total)}</p>
              ) : null}
            </div>
          );
        })}
      </div>

      {!loading && orders.length === 0 ? (
        <p className="text-sm text-gz-muted">Hozircha mos buyurtma yo‘q.</p>
      ) : null}
    </div>
  );
}
