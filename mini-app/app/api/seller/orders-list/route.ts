import { NextResponse } from "next/server";
import { readTelegramPostBody } from "@/lib/readTelegramBody";
import { fetchShopsForSeller } from "@/lib/sellerScope";

export const runtime = "nodejs";

const MAX_SCAN = 500;

type Line = { productId?: string; name?: string; price?: number; qty?: number };

export async function POST(req: Request) {
  const r = await readTelegramPostBody(req);
  if (!r.ok) return r.response;

  try {
    const { shops, uname } = await fetchShopsForSeller(r.data.supabase, r.data.user.username);
    if (!uname) {
      return NextResponse.json({ orders: [], hint: "no_username" });
    }
    if (shops.length === 0) {
      return NextResponse.json({ orders: [] });
    }

    const { data: prows } = await r.data.supabase
      .from("products")
      .select("id")
      .in(
        "shop_id",
        shops.map((s) => s.id)
      );

    const productIds = new Set((prows ?? []).map((p: { id: string }) => p.id));

    const { data: orows, error } = await r.data.supabase
      .from("order_requests")
      .select("id, lines, total, status, created_at")
      .order("created_at", { ascending: false })
      .limit(MAX_SCAN);

    if (error) {
      return NextResponse.json({ error: "db" }, { status: 500 });
    }

    const orders: Array<{
      id: string;
      created_at: string;
      status: string | null;
      total: number | null;
      myLines: Line[];
    }> = [];

    for (const row of orows ?? []) {
      const lines = row.lines as Line[] | null;
      if (!Array.isArray(lines)) continue;
      const myLines = lines.filter((l) => l.productId && productIds.has(l.productId));
      if (myLines.length === 0) continue;
      orders.push({
        id: row.id as string,
        created_at: row.created_at as string,
        status: row.status as string | null,
        total: row.total != null ? Number(row.total) : null,
        myLines,
      });
    }

    return NextResponse.json({ orders });
  } catch (e) {
    console.error("[seller/orders-list]", e);
    return NextResponse.json({ error: "db" }, { status: 500 });
  }
}
