"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type ChangeEvent } from "react";
import { Button } from "@/components/ui/Button";
import { MOCK_CATEGORIES } from "@/lib/mock-data";
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

export default function SellerAddProductClient() {
  const [shops, setShops] = useState<DbShop[]>([]);
  const [shopId, setShopId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Hammasi");
  const [imageUrl, setImageUrl] = useState("");
  const [kind, setKind] = useState<"product" | "service">("product");
  const [stock, setStock] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [uploadErr, setUploadErr] = useState<string | null>(null);

  const loadShops = useCallback(async () => {
    const res = await postJson("/api/seller/shops", {});
    if (!res.ok) return;
    const j = (await res.json()) as { shops?: DbShop[] };
    const list = j.shops ?? [];
    setShops(list);
    setShopId((prev) => prev || list[0]?.id || "");
  }, []);

  useEffect(() => {
    void loadShops();
  }, [loadShops]);

  const onPickImage = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadErr(null);
    if (file.size > 2_800_000) {
      setUploadErr("large");
      return;
    }
    const initData = getTelegramWebApp()?.initData ?? "";
    if (!initData) {
      setUploadErr("telegram");
      return;
    }
    setUploadBusy(true);
    try {
      const fd = new FormData();
      fd.set("initData", initData);
      fd.set("file", file);
      const res = await fetch("/api/seller/upload-image", { method: "POST", body: fd });
      const j = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok) {
        if (res.status === 403) setUploadErr("no_shop");
        else if (j.error === "too_large") setUploadErr("large");
        else if (j.error === "bad_type") setUploadErr("type");
        else setUploadErr("fail");
        return;
      }
      if (j.url) setImageUrl(j.url);
    } catch {
      setUploadErr("fail");
    } finally {
      setUploadBusy(false);
    }
  };

  const submit = async () => {
    setErr(null);
    setOk(false);
    const p = parseFloat(price.replace(",", "."));
    if (!shopId || !name.trim() || Number.isNaN(p) || p < 0) {
      setErr("form");
      return;
    }
    setBusy(true);
    try {
      const body: Record<string, unknown> = {
        shopId,
        name: name.trim(),
        description: description.trim(),
        price: p,
        category: category === "Hammasi" ? null : category,
        image_url: imageUrl.trim() || null,
        product_type: kind,
      };
      if (kind === "product") {
        body.stock = stock.trim() === "" ? null : Math.max(0, Math.floor(Number(stock)));
        if (stock.trim() !== "" && Number.isNaN(Number(stock))) {
          setErr("stock");
          setBusy(false);
          return;
        }
      } else {
        body.service_type = serviceType.trim() || null;
      }

      const res = await postJson("/api/seller/product-create", body);
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { detail?: string };
        setErr(j.detail ?? "save");
        return;
      }
      setOk(true);
      setName("");
      setDescription("");
      setPrice("");
      setImageUrl("");
      setStock("");
      setServiceType("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5 pb-8">
      <Link href="/seller" className="text-xs text-gz-accent2">
        ← Sotuvchi paneli
      </Link>
      <h1 className="text-xl font-black text-white">➕ Mahsulot / xizmat qo‘shish</h1>
      <p className="text-sm text-gz-muted">
        Avvalo Supabase da do‘koningiz <code className="rounded bg-white/10 px-1">owner_telegram_username</code>{" "}
        bilan bog‘langan bo‘lishi kerak.
      </p>

      {ok ? (
        <div className="rounded-2xl border border-emerald-500/35 bg-emerald-950/30 px-4 py-3 text-sm font-semibold text-emerald-100">
          ✅ Muvaffaqiyatli qo‘shildi
        </div>
      ) : null}

      {err === "form" ? (
        <p className="text-xs text-rose-300">Do‘kon, nom va narxni to‘ldiring.</p>
      ) : null}
      {err === "stock" ? <p className="text-xs text-rose-300">Ombor soni noto‘g‘ri.</p> : null}
      {err === "save" || (err && err !== "form" && err !== "stock") ? (
        <p className="text-xs text-rose-300">Saqlashda xato. Ustunlar (product_type) DB da bormi?</p>
      ) : null}

      {uploadErr === "large" ? (
        <p className="text-xs text-rose-300">Rasm juda katta (max ~2,7 MB).</p>
      ) : null}
      {uploadErr === "telegram" ? (
        <p className="text-xs text-rose-300">Telegram ichida rasm yuklang.</p>
      ) : null}
      {uploadErr === "no_shop" ? (
        <p className="text-xs text-rose-300">Avval do‘konni ulang — rasm faqat sotuvchilar uchun.</p>
      ) : null}
      {uploadErr === "type" ? (
        <p className="text-xs text-rose-300">Faqat JPG, PNG, WebP yoki GIF.</p>
      ) : null}
      {uploadErr === "fail" ? (
        <p className="text-xs text-rose-300">
          Yuklash muvaffaqiyatsiz. Supabase da <code className="rounded bg-white/10 px-1">product-images</code>{" "}
          public bucket bormi?
        </p>
      ) : null}

      {shops.length === 0 ? (
        <p className="text-sm text-gz-muted">Do‘kon topilmadi.</p>
      ) : (
        <div className="space-y-4 rounded-2xl border border-white/[0.08] bg-gz-surface p-4 shadow-card">
          <label className="block text-xs text-gz-muted">
            Do‘kon
            <select
              value={shopId}
              onChange={(e) => setShopId(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gz-border bg-gz-bg px-3 py-2.5 text-sm text-white"
            >
              {shops.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setKind("product")}
              className={`flex-1 rounded-xl border py-2.5 text-xs font-bold ${
                kind === "product"
                  ? "border-gz-accent bg-gz-accent/15 text-white"
                  : "border-gz-border text-gz-muted"
              }`}
            >
              Mahsulot
            </button>
            <button
              type="button"
              onClick={() => setKind("service")}
              className={`flex-1 rounded-xl border py-2.5 text-xs font-bold ${
                kind === "service"
                  ? "border-violet-400/50 bg-violet-500/15 text-white"
                  : "border-gz-border text-gz-muted"
              }`}
            >
              Xizmat
            </button>
          </div>

          <label className="block text-xs text-gz-muted">
            1. Mahsulot nomi
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gz-border bg-gz-bg px-3 py-2.5 text-sm text-white"
            />
          </label>

          <label className="block text-xs text-gz-muted">
            2. Tavsif
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 w-full resize-none rounded-xl border border-gz-border bg-gz-bg px-3 py-2.5 text-sm text-white"
            />
          </label>

          <label className="block text-xs text-gz-muted">
            3. Narx (so‘m)
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              inputMode="decimal"
              className="mt-1 w-full rounded-xl border border-gz-border bg-gz-bg px-3 py-2.5 text-sm text-white"
            />
          </label>

          <label className="block text-xs text-gz-muted">
            4. Kategoriya
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gz-border bg-gz-bg px-3 py-2.5 text-sm text-white"
            >
              {MOCK_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <div className="space-y-2 rounded-xl border border-white/[0.06] bg-gz-bg/40 p-3">
            <p className="text-xs font-semibold text-gz-muted">5. Rasm (ixtiyoriy)</p>
            <label className="block cursor-pointer rounded-xl border border-dashed border-emerald-500/35 bg-emerald-950/20 px-4 py-6 text-center text-xs font-medium text-emerald-100/90">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                disabled={uploadBusy}
                onChange={(ev) => void onPickImage(ev)}
              />
              {uploadBusy ? "Yuklanmoqda…" : "📷 Galereyadan tanlash yoki suratga olish"}
            </label>
            {imageUrl ? (
              <div className="mt-2 space-y-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="" className="max-h-40 w-full rounded-xl object-contain" />
                <button
                  type="button"
                  className="text-[11px] text-rose-300 underline"
                  onClick={() => setImageUrl("")}
                >
                  Rasmni olib tashlash
                </button>
              </div>
            ) : null}
            <p className="text-[10px] text-gz-muted">Yoki URL kiriting:</p>
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-xl border border-gz-border bg-gz-bg px-3 py-2.5 text-sm text-white"
            />
          </div>

          {kind === "product" ? (
            <label className="block text-xs text-gz-muted">
              6. Ombor soni (ixtiyoriy)
              <input
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                inputMode="numeric"
                placeholder="Masalan: 10"
                className="mt-1 w-full rounded-xl border border-gz-border bg-gz-bg px-3 py-2.5 text-sm text-white"
              />
            </label>
          ) : (
            <label className="block text-xs text-gz-muted">
              Xizmat turi
              <input
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                placeholder="Masalan: Yetkazib berish"
                className="mt-1 w-full rounded-xl border border-gz-border bg-gz-bg px-3 py-2.5 text-sm text-white"
              />
            </label>
          )}

          <Button type="button" className="w-full py-3.5 font-bold" disabled={busy} onClick={() => void submit()}>
            {busy ? "Saqlanmoqda…" : "Saqlash"}
          </Button>
        </div>
      )}
    </div>
  );
}
