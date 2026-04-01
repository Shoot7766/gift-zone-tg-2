import { NextResponse } from "next/server";
import { requireBotAndServiceSupabase } from "@/lib/supabaseAdmin";
import { validateTelegramInitData } from "@/lib/telegramInitData";

export const runtime = "nodejs";

type Line = {
  productId: string;
  name: string;
  price: number;
  qty: number;
  sellerUsername?: string | null;
  shopName?: string | null;
};

/**
 * Savatchadan buyurtma: Telegram initData tekshiriladi, keyin Supabase ga yoziladi.
 * Kerak: TELEGRAM_BOT_TOKEN, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SUPABASE_URL (server).
 */
export async function POST(req: Request) {
  const gate = requireBotAndServiceSupabase();
  if (!gate.ok) {
    return NextResponse.json({ error: "server_misconfigured" }, { status: 503 });
  }

  let body: { initData?: string; lines?: Line[] };
  try {
    body = (await req.json()) as { initData?: string; lines?: Line[] };
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const initData = typeof body.initData === "string" ? body.initData : "";
  const lines = Array.isArray(body.lines) ? body.lines : [];

  if (!initData || lines.length === 0) {
    return NextResponse.json({ error: "empty" }, { status: 400 });
  }

  const v = validateTelegramInitData(initData, gate.botToken);
  if (!v.ok) {
    return NextResponse.json({ error: "invalid_init", reason: v.reason }, { status: 401 });
  }

  const total = lines.reduce((a, l) => a + Number(l.price || 0) * Math.max(1, Math.floor(Number(l.qty) || 1)), 0);

  const { data, error } = await gate.supabase
    .from("order_requests")
    .insert({
      telegram_id: v.user.id,
      username: v.user.username ?? null,
      first_name: v.user.first_name ?? null,
      lines: lines as unknown as Record<string, unknown>,
      total,
      status: "pending",
    })
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("[order-request]", error.message);
    return NextResponse.json({ error: "db_insert", detail: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: data?.id ?? null });
}
