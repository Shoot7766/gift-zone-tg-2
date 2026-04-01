import { NextResponse } from "next/server";
import { requireBotAndServiceSupabase } from "@/lib/supabaseAdmin";
import { validateTelegramInitData } from "@/lib/telegramInitData";

export const runtime = "nodejs";

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
    return NextResponse.json({ error: "invalid_init", reason: v.reason }, { status: 401 });
  }

  const { data, error } = await gate.supabase
    .from("favorites")
    .select("product_id")
    .eq("telegram_id", v.user.id);

  if (error) {
    console.error("[favorites/list]", error.message);
    return NextResponse.json({ error: "db", detail: error.message }, { status: 500 });
  }

  const ids = (data ?? []).map((r: { product_id: string }) => r.product_id);
  return NextResponse.json({ ids });
}
