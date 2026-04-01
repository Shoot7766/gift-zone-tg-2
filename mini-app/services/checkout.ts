import type { CartLine } from "@/hooks/useCart";
import { getStoredJwt } from "@/services/backendSession";

function apiBase(): string | null {
  const u = process.env.NEXT_PUBLIC_API_BASE_URL?.trim().replace(/\/$/, "");
  return u || null;
}

export type CheckoutResult =
  | { ok: true; mode: "api"; orderIds: number[] }
  | { ok: true; mode: "telegram" }
  | { ok: false; message: string };

/**
 * 1) Agar barcha productId raqamli VA JWT VA API bor bo‘lsa — Prisma backend checkout.
 * 2) Aks holda — Telegram orqali buyurtma matni (Supabase UUID katalog uchun).
 */
export async function submitCheckout(lines: CartLine[]): Promise<CheckoutResult> {
  const base = apiBase();
  const token = getStoredJwt();
  const allNumeric = lines.length > 0 && lines.every((l) => /^\d+$/.test(l.productId));

  if (base && token && allNumeric) {
    const items = lines.map((l) => ({
      productId: parseInt(l.productId, 10),
      quantity: l.qty,
    }));
    const res = await fetch(`${base}/api/customer/orders/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ items }),
    });

    if (res.ok) {
      const j = (await res.json()) as { orderIds?: number[] };
      return { ok: true, mode: "api", orderIds: j.orderIds ?? [] };
    }

    if (res.status === 403) {
      return {
        ok: false,
        message:
          "Buyurtma uchun «Mijoz» roli kerak. Telegram botda /rol orqali «Mijoz» ni tanlang.",
      };
    }

    const err = (await res.json().catch(() => ({}))) as { error?: string; productId?: number };
    if (err.error === "stock_or_product") {
      return {
        ok: false,
        message: "Ba’zi mahsulotlar topilmadi yoki omborda yetarli emas (backend katalogi).",
      };
    }
    return { ok: false, message: "Buyurtma yuborilmadi. Keyinroq urinib ko‘ring." };
  }

  return { ok: true, mode: "telegram" };
}
