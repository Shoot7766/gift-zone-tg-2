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

export default function SellerShopClient() {
  const [shops, setShops] = useState<DbShop[]>([]);
  const [hint, setHint] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "", city: "", owner: "" });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setErr(null);
    const res = await postJson("/api/seller/shops", {});
    if (!res.ok) {
      setErr("load");
      setLoading(false);
      return;
    }
    const j = (await res.json()) as { shops?: DbShop[]; hint?: string };
    setShops(j.shops ?? []);
    setHint(j.hint ?? null);
    const first = j.shops?.[0];
    if (first) {
      setActiveId(first.id);
      setForm({
        name: first.name,
        description: first.description ?? "",
        city: first.city ?? "",
        owner: first.owner_telegram_username ?? "",
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const selectShop = (s: DbShop) => {
    setActiveId(s.id);
    setForm({
      name: s.name,
      description: s.description ?? "",
      city: s.city ?? "",
      owner: s.owner_telegram_username ?? "",
    });
  };

  const save = async () => {
    if (!activeId) return;
    setSaving(true);
    setErr(null);
    try {
      const res = await postJson("/api/seller/shop-patch", {
        shopId: activeId,
        name: form.name,
        description: form.description,
        city: form.city,
        owner_telegram_username: form.owner,
      });
      if (res.status === 403) {
        setErr("forbidden");
        return;
      }
      if (!res.ok) {
        setErr("save");
        return;
      }
      await load();
    } finally {
      setSaving(false);
    }
  };

  const active = shops.find((s) => s.id === activeId);

  return (
    <div className="space-y-4 pb-8">
      <Link href="/seller" className="text-xs text-gz-accent2">
        ← Sotuvchi paneli
      </Link>
      <h1 className="text-xl font-black text-white">Mening do‘konim</h1>

      {loading ? <p className="text-sm text-gz-muted">Yuklanmoqda…</p> : null}

      {hint === "no_username" ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-950/25 p-3 text-xs text-amber-100">
          Telegram da <strong>username</strong> qo‘ying — do‘kon sizga bog‘lanadi.
        </div>
      ) : null}

      {err === "forbidden" ? <p className="text-xs text-rose-300">Bu do‘kon sizga tegishli emas.</p> : null}
      {(err === "load" || err === "save") && (
        <p className="text-xs text-rose-300">Xato yuz berdi. Server kalitlari va internetni tekshiring.</p>
      )}

      {!loading && shops.length === 0 && !hint ? (
        <p className="text-sm text-gz-muted">
          Sizga tegishli do‘kon topilmadi. Supabase da <code className="rounded bg-white/10 px-1">shops</code>{" "}
          jadvalida <code className="rounded bg-white/10 px-1">owner_telegram_username</code> ni o‘z Telegram
          username ingizga moslang.
        </p>
      ) : null}

      {shops.length > 1 ? (
        <div className="flex flex-wrap gap-2">
          {shops.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => selectShop(s)}
              className={`rounded-xl border px-3 py-2 text-xs font-semibold ${
                s.id === activeId
                  ? "border-gz-accent bg-gz-accent/15 text-white"
                  : "border-gz-border text-gz-muted"
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      ) : null}

      {active ? (
        <div className="space-y-3 rounded-2xl border border-gz-border bg-gz-surface p-4">
          <p className="text-[10px] text-gz-muted">
            Tasdiq: {active.is_approved ? "✓" : "kutilmoqda"} · Featured: {active.is_featured ? "ha" : "yo‘q"}
          </p>
          <label className="block text-xs text-gz-muted">
            Nomi
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-gz-border bg-gz-bg px-3 py-2 text-sm text-white"
            />
          </label>
          <label className="block text-xs text-gz-muted">
            Shahar
            <input
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-gz-border bg-gz-bg px-3 py-2 text-sm text-white"
            />
          </label>
          <label className="block text-xs text-gz-muted">
            Egasi (Telegram username, @siz)
            <input
              value={form.owner}
              onChange={(e) => setForm((f) => ({ ...f, owner: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-gz-border bg-gz-bg px-3 py-2 text-sm text-white"
            />
          </label>
          <label className="block text-xs text-gz-muted">
            Tavsif
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={4}
              className="mt-1 w-full resize-none rounded-xl border border-gz-border bg-gz-bg px-3 py-2 text-sm text-white"
            />
          </label>
          <Button type="button" className="w-full" disabled={saving} onClick={() => void save()}>
            {saving ? "Saqlanmoqda…" : "Saqlash"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
