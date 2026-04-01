"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatPriceUZS } from "@/lib/format";
import { useCart } from "@/hooks/useCart";

export default function CartPageClient() {
  const { lines, remove, setLines, total, count } = useCart();

  return (
    <div className="space-y-4 pb-6">
      <h1 className="text-xl font-black text-white">Savatcha</h1>
      <Link href="/products" className="text-xs font-semibold text-gz-accent2">
        Mahsulot qo‘shish →
      </Link>

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
                className="flex items-center justify-between gap-3 rounded-3xl border border-gz-border bg-gz-surface p-4 shadow-card"
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
          <div className="rounded-3xl border border-gz-border bg-gz-elevated p-4">
            <div className="flex justify-between text-sm">
              <span className="text-gz-muted">Jami ({count} ta)</span>
              <span className="text-lg font-black text-gz-accent">
                {formatPriceUZS(total)}
              </span>
            </div>
            <Button type="button" className="mt-4 w-full" disabled>
              Buyurtma berish (tez orada)
            </Button>
            <p className="mt-2 text-center text-[11px] text-gz-muted">
              To‘lov va yetkazish — keyingi versiyada.
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
