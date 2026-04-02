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
  const [deleting, setDeleting] = useState<string | null>(null);

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

  const remove = async (productId: string) => {
    if (!confirm("O‘chirishni tasdiqlaysizmi?")) return;
    setDeleting(productId);
    setErr(null);
    try {
      const res = await postJson("/api/seller/product-delete", { productId });
      if (!res.ok) {
        setErr("delete");
        return;
      }
      await load();
    } finally {
      setDeleting(null);
    }
  };

  const toggleActive = async (p: ProductWithShop) => {
    setSaving(true);
    try {
      const res = await postJson("/api/seller/product-patch", {
        productId: p.id,
        is_active: !p.is_active,
      });
      if (res.ok) await load();
      else setErr("save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 pb-8">
      <Link href="/seller" className="text-xs text-gz-accent2">
        ← Sotuvchi paneli
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-black text-white">📦 Mahsulotlarim</h1>
        <Link
          href="/seller/add"
          className="rounded-xl bg-gz-accent px-3 py-2 text-xs font-bold text-black shadow-lg shadow-emerald-900/30"
        >
          ➕ Qo‘shish
        </Link>
      </div>

      {loading ? <p className="text-sm text-gz-muted">Yuklanmoqda…</p> : null}

      {hint === "no_username" ? (
        <p className="text-xs text-amber-200">Telegram username kerak.</p>
      ) : null}

      {err === "price" ? <p className="text-xs text-rose-300">Narx noto‘g‘ri.</p> : null}
      {err === "load" || err === "save" || err === "delete" ? (
        <p className="text-xs text-rose-300">Xato. Qayta urinib ko‘ring.</p>
      ) : null}

      <Button type="button" variant="secondary" className="text-xs" disabled={loading} onClick={() => void load()}>
        🔄 Yangilash
      </Button>

      <div className="space-y-3">
        {products.map((p) => (
          <div
            key={p.id}
            className="rounded-2xl border border-white/[0.08] bg-gz-surface p-4 shadow-card"
          >
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
                  className="w-full rounded-xl border border-gz-border bg-gz-bg px-3 py-2 text-sm text-white"
                />
                <input
                  value={draft.category}
                  onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}
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
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    className="text-xs"
                    disabled={saving}
                    onClick={() => void saveProduct(p.id)}
                  >
                    Saqlash
                  </Button>
                  <Button type="button" variant="ghost" className="text-xs" onClick={() => setEditing(null)}>
                    Bekor
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-white">{p.name}</p>
                    <p className="text-xs text-gz-muted">{p.shops?.name ?? "Do‘kon"}</p>
                    <p className="text-sm font-semibold text-gz-accent">{formatPriceUZS(p.price)}</p>
                    <div className="mt-1 flex flex-wrap gap-1 text-[10px] text-gz-muted">
                      <span
                        className={
                          p.is_active ? "text-emerald-300" : "text-amber-200/90"
                        }
                      >
                        {p.is_active ? "● Faol" : "○ O‘chirilgan"}
                      </span>
                      <span>·</span>
                      <span>{p.product_type === "service" ? "🛎 Xizmat" : "📦 Mahsulot"}</span>
                      {p.product_type === "product" && typeof p.stock === "number" ? (
                        <>
                          <span>·</span>
                          <span>Ombor: {p.stock}</span>
                        </>
                      ) : null}
                      {p.service_type ? (
                        <>
                          <span>·</span>
                          <span>{p.service_type}</span>
                        </>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col gap-1">
                    <Button type="button" variant="secondary" className="text-xs" onClick={() => startEdit(p)}>
                      Tahrirlash
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      className="text-xs"
                      disabled={saving}
                      onClick={() => void toggleActive(p)}
                    >
                      {p.is_active ? "O‘chirish (faol)" : "Yoqish"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-xs text-rose-300"
                      disabled={deleting === p.id}
                      onClick={() => void remove(p.id)}
                    >
                      {deleting === p.id ? "…" : "O‘chirish"}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {!loading && products.length === 0 ? (
        <p className="text-sm text-gz-muted">
          Hozircha mahsulot yo‘q.{" "}
          <Link href="/seller/add" className="text-gz-accent2 underline">
            Qo‘shish
          </Link>
        </p>
      ) : null}
    </div>
  );
}
