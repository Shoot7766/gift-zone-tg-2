import { NextResponse } from "next/server";
import { requireBotAndServiceSupabase } from "@/lib/supabaseAdmin";
import { validateTelegramInitData } from "@/lib/telegramInitData";

export const runtime = "nodejs";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(req: Request) {
  const gate = requireBotAndServiceSupabase();
  if (!gate.ok) {
    return NextResponse.json({ error: "server_misconfigured" }, { status: 503 });
  }

  let body: { initData?: string; productId?: string };
  try {
    body = (await req.json()) as { initData?: string; productId?: string };
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const initData = typeof body.initData === "string" ? body.initData : "";
  const productId = typeof body.productId === "string" ? body.productId.trim() : "";
  if (!initData || !productId || !UUID_RE.test(productId)) {
    return NextResponse.json({ error: "bad_input" }, { status: 400 });
  }

  const v = validateTelegramInitData(initData, gate.botToken);
  if (!v.ok) {
    return NextResponse.json({ error: "invalid_init", reason: v.reason }, { status: 401 });
  }

  const tid = v.user.id;

  const { data: existing, error: selErr } = await gate.supabase
    .from("favorites")
    .select("id")
    .eq("telegram_id", tid)
    .eq("product_id", productId)
    .maybeSingle();

  if (selErr) {
    console.error("[favorites/toggle]", selErr.message);
    return NextResponse.json({ error: "db", detail: selErr.message }, { status: 500 });
  }

  if (existing) {
    const { error: delErr } = await gate.supabase
      .from("favorites")
      .delete()
      .eq("telegram_id", tid)
      .eq("product_id", productId);
    if (delErr) {
      return NextResponse.json({ error: "db", detail: delErr.message }, { status: 500 });
    }
    return NextResponse.json({ favorited: false });
  }

  const { error: insErr } = await gate.supabase.from("favorites").insert({
    telegram_id: tid,
    product_id: productId,
  });
  if (insErr) {
    return NextResponse.json({ error: "db", detail: insErr.message }, { status: 500 });
  }
  return NextResponse.json({ favorited: true });
}
