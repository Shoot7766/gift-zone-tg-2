"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useCart } from "@/hooks/useCart";
import { formatPriceUZS } from "@/lib/format";
import { openTelegramWithOrder } from "@/lib/telegramOrder";
import { submitCheckout } from "@/services/checkout";

export default function CartPageClient() {
  const { lines, remove, setLines, total, count } = useCart();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  const onCheckout = async () => {
    if (lines.length === 0) return;
    setErr(null);
    setOkMsg(null);
    setBusy(true);
    try {
      const result = await submitCheckout(lines);
      if (!result.ok) {
        setErr(result.message);
        return;
      }
      if (result.mode === "api") {
        setOkMsg(`Buyurtma qabul qilindi (${result.orderIds.length} ta).`);
        setLines([]);
        return;
      }
      if (result.mode === "supabase") {
        setOkMsg(
          result.requestId
            ? `Buyurtma qabul qilindi. ID: ${result.requestId.slice(0, 8)}…`
            : "Buyurtma qabul qilindi — sotuvchi tez orada bog‘lanadi."
        );
        setLines([]);
        return;
      }
      openTelegramWithOrder(lines, total);
      setOkMsg(
        "Telegram ochildi — buyurtma matnini yuboring. Boshqa mahsulotlar uchun alohida sotuvchiga yozing."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4 pb-6">
      <h1 className="text-xl font-black text-white">Savatcha</h1>
      <Link href="/products" className="text-xs font-semibold text-gz-accent2">
        Mahsulot qo‘shish →
      </Link>

      {err ? (
        <div className="rounded-2xl border border-rose-500/35 bg-rose-950/30 px-3 py-2 text-xs text-rose-100">
          {err}
        </div>
      ) : null}
      {okMsg ? (
        <div className="rounded-2xl border border-emerald-500/35 bg-emerald-950/30 px-3 py-2 text-xs text-emerald-100">
          {okMsg}
        </div>
      ) : null}

      {lines.length === 0 ? (
        <EmptyState
          emoji="🧺"
          title="Savatcha bo‘sh"
          hint="Mahsulot sahifasidan «Savatchaga qo‘shish» tugmasini bosing."
        />
      ) : (
        <>
          <div className="space-y-3">
            {lines.map((l) => (
              <div
                key={l.productId}
                className="flex items-center justify-between gap-3 rounded-2xl border border-gz-border bg-gz-surface p-4 shadow-card"
              >
                <div className="min-w-0">
                  <Link
                    href={`/products/${l.productId}`}
                    className="font-bold text-white hover:text-gz-accent"
                  >
                    {l.name}
                  </Link>
                  <p className="text-xs text-gz-muted">
                    {formatPriceUZS(l.price)} × {l.qty}
                  </p>
                  {l.shopName ? (
                    <p className="mt-0.5 text-[11px] text-gz-muted">🏪 {l.shopName}</p>
                  ) : null}
                </div>
                <button
                  type="button"
                  className="shrink-0 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold"
                  onClick={() => remove(l.productId)}
                >
                  O‘chirish
                </button>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-gz-border bg-gz-elevated p-4">
            <div className="flex justify-between text-sm">
              <span className="text-gz-muted">Jami ({count} ta)</span>
              <span className="text-lg font-black text-gz-accent">{formatPriceUZS(total)}</span>
            </div>
            <Button
              type="button"
              className="mt-4 w-full py-3.5 text-sm font-bold"
              disabled={busy}
              onClick={() => void onCheckout()}
            >
              {busy ? "Yuborilmoqda…" : "✅ Buyurtma berish"}
            </Button>
            <p className="mt-2 text-center text-[11px] leading-relaxed text-gz-muted">
              Vercel da TELEGRAM_BOT_TOKEN va SUPABASE_SERVICE_ROLE_KEY bo‘lsa, buyurtma Supabase ga
              yoziladi; aks holda Telegram ochiladi. Backend + raqamli ID bo‘lsa — Prisma checkout.
            </p>
          </div>
          <button
            type="button"
            className="w-full text-center text-xs text-gz-muted underline"
            onClick={() => setLines([])}
          >
            Savatchani tozalash
          </button>
        </>
      )}
    </div>
  );
}
