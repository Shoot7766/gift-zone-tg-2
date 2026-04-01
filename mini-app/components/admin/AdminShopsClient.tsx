"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { getTelegramWebApp } from "@/lib/telegram";
import type { DbShop } from "@/types/database";

async function postJson(path: string, body: Record<string, unknown>) {
  const initData = getTelegramWebApp()?.initData ?? "";
  return fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ initData, ...body }),
  });
}

export default function AdminShopsClient() {
  const [shops, setShops] = useState<DbShop[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setErr(null);
    const res = await postJson("/api/admin/shops/list", {});
    if (res.status === 403) {
      setErr("forbidden");
      setLoading(false);
      return;
    }
    if (res.status === 503) {
      setErr("config");
      setLoading(false);
      return;
    }
    if (!res.ok) {
      setErr("load");
      setLoading(false);
      return;
    }
    const j = (await res.json()) as { shops?: DbShop[] };
    setShops(j.shops ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const patchShop = async (shopId: string, fields: Record<string, boolean>) => {
    setBusyId(shopId);
    setErr(null);
    try {
      const res = await postJson("/api/admin/shops/update", { shopId, ...fields });
      if (!res.ok) {
        setErr("save");
        return;
      }
      await load();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-4 pb-8">
      <Link href="/admin" className="text-xs text-gz-accent2">
        ← Admin
      </Link>
      <h1 className="text-xl font-black text-white">Do‘konlar</h1>

      {loading ? <p className="text-sm text-gz-muted">Yuklanmoqda…</p> : null}

      {err === "forbidden" ? (
        <p className="text-xs text-rose-300">Admin huquqi yo‘q.</p>
      ) : null}
      {err === "config" ? (
        <p className="text-xs text-amber-200">
          <code className="rounded bg-black/30 px-1">ADMIN_TELEGRAM_IDS</code> va server kalitlari kerak.
        </p>
      ) : null}
      {err === "load" || err === "save" ? (
        <p className="text-xs text-rose-300">Yuklash/yozishda xato. Qayta urinib ko‘ring.</p>
      ) : null}

      <Button type="button" variant="secondary" className="text-xs" disabled={loading} onClick={() => void load()}>
        🔄 Yangilash
      </Button>

      <div className="space-y-3">
        {shops.map((s) => (
          <div
            key={s.id}
            className="rounded-2xl border border-gz-border bg-gz-surface p-4 shadow-card"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-bold text-white">{s.name}</p>
                <p className="text-[11px] text-gz-muted">
                  {s.city ?? "—"} · @{s.owner_telegram_username ?? "—"}
                </p>
                <p className="mt-1 text-[10px] font-mono text-gz-muted/80">{s.id.slice(0, 8)}…</p>
              </div>
              <div className="flex flex-wrap gap-1">
                <span
                  className={`rounded-lg px-2 py-0.5 text-[10px] font-bold ${
                    s.is_approved ? "bg-emerald-500/20 text-emerald-200" : "bg-amber-500/20 text-amber-200"
                  }`}
                >
                  {s.is_approved ? "Tasdiqlangan" : "Kutilmoqda"}
                </span>
                {s.is_featured ? (
                  <span className="rounded-lg bg-violet-500/20 px-2 py-0.5 text-[10px] font-bold text-violet-200">
                    ⭐ Featured
                  </span>
                ) : null}
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {!s.is_approved ? (
                <Button
                  type="button"
                  className="text-xs"
                  disabled={busyId === s.id}
                  onClick={() => void patchShop(s.id, { is_approved: true })}
                >
                  ✓ Tasdiqlash
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="secondary"
                  className="text-xs"
                  disabled={busyId === s.id}
                  onClick={() => void patchShop(s.id, { is_approved: false })}
                >
                  Tasdiqni yechish
                </Button>
              )}
              <Button
                type="button"
                variant="secondary"
                className="text-xs"
                disabled={busyId === s.id}
                onClick={() => void patchShop(s.id, { is_featured: !s.is_featured })}
              >
                {s.is_featured ? "Featured o‘chirish" : "⭐ Featured"}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {!loading && shops.length === 0 && !err ? (
        <p className="text-sm text-gz-muted">Hozircha do‘kon yo‘q.</p>
      ) : null}
    </div>
  );
}
