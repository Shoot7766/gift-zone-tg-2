import { NextResponse } from "next/server";
import { requireBotAndServiceSupabase } from "@/lib/supabaseAdmin";
import { validateTelegramInitData } from "@/lib/telegramInitData";

export const runtime = "nodejs";

const MAX_ORDER_SCAN = 2500;

type Line = { productId?: string; price?: number; qty?: number };

export async function POST(req: Request) {
  const gate = requireBotAndServiceSupabase();
  if (!gate.ok) {
    return NextResponse.json({ error: "server_misconfigured" }, { status: 503 });
  }

  let body: { initData?: string };
  try {
    body = (await req.json()) as { initData?: string };
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const initData = typeof body.initData === "string" ? body.initData : "";
  if (!initData) {
    return NextResponse.json({ error: "empty" }, { status: 400 });
  }

  const v = validateTelegramInitData(initData, gate.botToken);
  if (!v.ok) {
    return NextResponse.json({ error: "invalid_init" }, { status: 401 });
  }

  const uname = v.user.username?.replace(/^@/, "").trim().toLowerCase() || "";
  if (!uname) {
    return NextResponse.json({
      shopCount: 0,
      productCount: 0,
      orderCount: 0,
      revenueApprox: 0,
      shopNames: [] as string[],
      hint: "no_username",
    });
  }

  const sb = gate.supabase;

  const { data: myShops, error: se } = await sb
    .from("shops")
    .select("id, name")
    .ilike("owner_telegram_username", uname);

  if (se) {
    console.error("[stats/seller] shops", se.message);
    return NextResponse.json({ error: "db" }, { status: 500 });
  }

  const shops = myShops ?? [];
  const shopIds = shops.map((s: { id: string }) => s.id);
  const shopNames = shops.map((s: { name: string }) => s.name);

  if (shopIds.length === 0) {
    return NextResponse.json({
      shopCount: 0,
      productCount: 0,
      orderCount: 0,
      revenueApprox: 0,
      shopNames: [],
    });
  }

  const { data: prows, error: pe } = await sb.from("products").select("id").in("shop_id", shopIds);

  if (pe) {
    return NextResponse.json({ error: "db" }, { status: 500 });
  }

  const productIds = new Set((prows ?? []).map((p: { id: string }) => p.id));
  const productCount = productIds.size;

  const { data: orows, error: oe } = await sb.from("order_requests").select("lines").limit(MAX_ORDER_SCAN);

  if (oe) {
    return NextResponse.json({ error: "db" }, { status: 500 });
  }

  let orderCount = 0;
  let revenueApprox = 0;

  for (const row of orows ?? []) {
    const lines = row.lines as Line[] | null;
    if (!Array.isArray(lines)) continue;
    let touches = false;
    for (const l of lines) {
      const pid = l.productId;
      if (!pid || !productIds.has(pid)) continue;
      touches = true;
      const q = Math.max(1, Math.floor(Number(l.qty) || 1));
      revenueApprox += Number(l.price || 0) * q;
    }
    if (touches) orderCount += 1;
  }

  return NextResponse.json({
    shopCount: shopIds.length,
    productCount,
    orderCount,
    revenueApprox,
    shopNames,
  });
}
