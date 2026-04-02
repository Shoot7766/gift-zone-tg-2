import { NextResponse } from "next/server";
import { requireBotAndServiceSupabase } from "@/lib/supabaseAdmin";
import { validateTelegramInitData } from "@/lib/telegramInitData";

export const runtime = "nodejs";

/**
 * Profil roli: Supabase `users` dan service_role bilan o‘qiladi
 * (brauzer anon kaliti RLS tufayli o‘qiy olmasa ham ishlaydi).
 */
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
    return NextResponse.json({ error: "empty_init" }, { status: 400 });
  }

  const v = validateTelegramInitData(initData, gate.botToken);
  if (!v.ok) {
    return NextResponse.json({ error: "invalid_init" }, { status: 401 });
  }

  const { data, error } = await gate.supabase
    .from("users")
    .select("role")
    .eq("telegram_id", v.user.id)
    .maybeSingle();

  if (error) {
    console.error("[user-role]", error.message);
    return NextResponse.json({ error: "db" }, { status: 500 });
  }

  const r = (data as { role?: string } | null)?.role;
  if (r === "seller" || r === "admin") {
    return NextResponse.json({ role: r });
  }
  return NextResponse.json({ role: "customer" as const });
}
