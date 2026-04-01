import { NextResponse } from "next/server";
import { isAdminTelegramUserId, isConfiguredAdminGate } from "@/lib/adminTelegramIds";
import { readTelegramPostBody } from "@/lib/readTelegramBody";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const r = await readTelegramPostBody(req);
  if (!r.ok) return r.response;

  if (!isConfiguredAdminGate()) {
    return NextResponse.json({ error: "admin_ids_not_configured" }, { status: 503 });
  }

  if (!isAdminTelegramUserId(r.data.user.id)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { data, error } = await r.data.supabase
    .from("shops")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(300);

  if (error) {
    console.error("[admin/shops/list]", error.message);
    return NextResponse.json({ error: "db" }, { status: 500 });
  }

  return NextResponse.json({ shops: data ?? [] });
}
