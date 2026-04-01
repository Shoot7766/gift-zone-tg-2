import type { CartLine } from "@/hooks/useCart";
import { getStoredJwt } from "@/services/backendSession";

function apiBase(): string | null {
  const u = process.env.NEXT_PUBLIC_API_BASE_URL?.trim().replace(/\/$/, "");
  return u || null;
}

export type CheckoutResult =
  | { ok: true; mode: "api"; orderIds: number[] }
  | { ok: true; mode: "supabase"; requestId: string }
  | { ok: true; mode: "telegram" }
  | { ok: false; message: string };

/**
 * 1) Raqamli productId + JWT + API — Prisma backend checkout.
 * 2) Telegram initData + serverda TELEGRAM_BOT_TOKEN va SUPABASE_SERVICE_ROLE_KEY — Supabase order_requests.
 * 3) Aks holda — Telegram orqali buyurtma matni.
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

  if (typeof window !== "undefined" && lines.length > 0) {
    const initData = window.Telegram?.WebApp?.initData ?? "";
    if (initData) {
      const res = await fetch("/api/order-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          initData,
          lines: lines.map((l) => ({
            productId: l.productId,
            name: l.name,
            price: l.price,
            qty: l.qty,
            sellerUsername: l.sellerUsername ?? null,
            shopName: l.shopName ?? null,
          })),
        }),
      });

      if (res.ok) {
        const j = (await res.json()) as { ok?: boolean; id?: string | null };
        if (j.ok) {
          return { ok: true, mode: "supabase", requestId: j.id ?? "" };
        }
      }

      if (res.status === 401) {
        return {
          ok: false,
          message: "Telegram sessiyasi yaroqsiz. Mini ilovani qayta oching.",
        };
      }

      if (res.status === 500) {
        const j = (await res.json().catch(() => ({}))) as { detail?: string };
        return {
          ok: false,
          message:
            j.detail?.includes("order_requests") || j.detail?.includes("relation")
              ? "Buyurtma jadvali topilmadi. Supabase da order_requests ni yarating (schema-reference.sql)."
              : "Buyurtma saqlanmadi. Keyinroq urinib ko‘ring.",
        };
      }
      /* 503 server_misconfigured — Telegram ga tushamiz */
    }
  }

  return { ok: true, mode: "telegram" };
}
