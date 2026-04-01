"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { formatPriceUZS } from "@/lib/format";
import { getTelegramWebApp } from "@/lib/telegram";
import type { ProductWithShop } from "@/types/database";

async function postJson(path: string, body: Record<string, unknown>) {
  const initData = getTelegramWebApp()?.initData ?? "";
  return fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ initData, ...body }),
  });
}

export default function SellerProductsClient() {
  const [products, setProducts] = useState<ProductWithShop[]>([]);
  const [hint, setHint] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState({ name: "", price: "", category: "", is_active: true });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setErr(null);
    const res = await postJson("/api/seller/products", {});
    if (!res.ok) {
      setErr("load");
      setLoading(false);
      return;
    }
    const j = (await res.json()) as { products?: ProductWithShop[]; hint?: string };
    setProducts((j.products ?? []) as ProductWithShop[]);
    setHint(j.hint ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const startEdit = (p: ProductWithShop) => {
    setEditing(p.id);
    setDraft({
      name: p.name,
      price: String(p.price),
      category: p.category ?? "",
      is_active: p.is_active,
    });
  };

  const saveProduct = async (productId: string) => {
    const price = parseFloat(draft.price.replace(",", "."));
    if (Number.isNaN(price) || price < 0) {
      setErr("price");
      return;
    }
    setSaving(true);
    setErr(null);
    try {
      const res = await postJson("/api/seller/product-patch", {
        productId,
        name: draft.name,
        price,
        category: draft.category,
        is_active: draft.is_active,
      });
      if (!res.ok) {
        setErr("save");
        return;
      }
      setEditing(null);
      await load();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 pb-8">
      <Link href="/seller" className="text-xs text-gz-accent2">
        ← Sotuvchi paneli
      </Link>
      <h1 className="text-xl font-black text-white">Mahsulotlar</h1>

      {loading ? <p className="text-sm text-gz-muted">Yuklanmoqda…</p> : null}

      {hint === "no_username" ? (
        <p className="text-xs text-amber-200">Telegram username kerak.</p>
      ) : null}

      {err === "price" ? <p className="text-xs text-rose-300">Narx noto‘g‘ri.</p> : null}
      {err === "load" || err === "save" ? (
        <p className="text-xs text-rose-300">Xato. Qayta urinib ko‘ring.</p>
      ) : null}

      <Button type="button" variant="secondary" className="text-xs" disabled={loading} onClick={() => void load()}>
        🔄 Yangilash
      </Button>

      <div className="space-y-3">
        {products.map((p) => (
          <div key={p.id} className="rounded-2xl border border-gz-border bg-gz-surface p-4">
            {editing === p.id ? (
              <div className="space-y-2">
                <input
                  value={draft.name}
                  onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                  className="w-full rounded-xl border border-gz-border bg-gz-bg px-3 py-2 text-sm text-white"
                />
                <input
                  value={draft.price}
                  onChange={(e) => setDraft((d) => ({ ...d, price: e.target.value }))}
                  placeholder="Narx"
                  className="w-full rounded-xl border border-gz-border bg-gz-bg px-3 py-2 text-sm text-white"
                />
                <input
                  value={draft.category}
                  onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}
                  placeholder="Kategoriya"
                  className="w-full rounded-xl border border-gz-border bg-gz-bg px-3 py-2 text-sm text-white"
                />
                <label className="flex items-center gap-2 text-xs text-gz-muted">
                  <input
                    type="checkbox"
                    checked={draft.is_active}
                    onChange={(e) => setDraft((d) => ({ ...d, is_active: e.target.checked }))}
                  />
                  Faol
                </label>
                <div className="flex gap-2">
                  <Button type="button" className="text-xs" disabled={saving} onClick={() => void saveProduct(p.id)}>
                    Saqlash
                  </Button>
                  <Button type="button" variant="ghost" className="text-xs" onClick={() => setEditing(null)}>
                    Bekor
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between gap-2">
                  <div>
                    <p className="font-bold text-white">{p.name}</p>
                    <p className="text-xs text-gz-muted">{p.shops?.name ?? "Do‘kon"}</p>
                    <p className="text-sm font-semibold text-gz-accent">{formatPriceUZS(p.price)}</p>
                    <p className="text-[10px] text-gz-muted">
                      {p.is_active ? "Faol" : "O‘chirilgan"} · {p.category ?? "—"}
                    </p>
                  </div>
                  <Button type="button" variant="secondary" className="shrink-0 text-xs" onClick={() => startEdit(p)}>
                    Tahrirlash
                  </Button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {!loading && products.length === 0 ? (
        <p className="text-sm text-gz-muted">
          Mahsulot yo‘q. Yangisini Supabase <code className="rounded bg-white/10 px-1">products</code> orqali
          qo‘shing yoki do‘konni ulang.
        </p>
      ) : null}
    </div>
  );
}
