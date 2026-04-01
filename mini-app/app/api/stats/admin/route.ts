import type { SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { isAdminTelegramUserId, isConfiguredAdminGate } from "@/lib/adminTelegramIds";
import { requireBotAndServiceSupabase } from "@/lib/supabaseAdmin";
import { validateTelegramInitData } from "@/lib/telegramInitData";

export const runtime = "nodejs";

async function countTable(sb: SupabaseClient, table: string): Promise<number | null> {
  const { count, error } = await sb.from(table).select("*", { count: "exact", head: true });
  if (error) return null;
  return count ?? 0;
}

export async function POST(req: Request) {
  const gate = requireBotAndServiceSupabase();
  if (!gate.ok) {
    return NextResponse.json({ error: "server_misconfigured" }, { status: 503 });
  }

  if (!isConfiguredAdminGate()) {
    return NextResponse.json({ error: "admin_ids_not_configured" }, { status: 503 });
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

  if (!isAdminTelegramUserId(v.user.id)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const sb = gate.supabase;

  const pendingRes = await sb
    .from("shops")
    .select("*", { count: "exact", head: true })
    .eq("is_approved", false);

  const pendingShops = pendingRes.error ? null : pendingRes.count ?? 0;

  const [users, shops, products, orders] = await Promise.all([
    countTable(sb, "users"),
    countTable(sb, "shops"),
    countTable(sb, "products"),
    countTable(sb, "order_requests"),
  ]);

  return NextResponse.json({
    users,
    shops,
    products,
    orders,
    pendingShops,
  });
}
