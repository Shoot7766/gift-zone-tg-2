import { NextResponse } from "next/server";
import { isAdminTelegramUserId, isConfiguredAdminGate } from "@/lib/adminTelegramIds";
import { readTelegramPostBody } from "@/lib/readTelegramBody";

export const runtime = "nodejs";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(req: Request) {
  const r = await readTelegramPostBody(req);
  if (!r.ok) return r.response;

  if (!isConfiguredAdminGate()) {
    return NextResponse.json({ error: "admin_ids_not_configured" }, { status: 503 });
  }

  if (!isAdminTelegramUserId(r.data.user.id)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const shopId = typeof r.data.body.shopId === "string" ? r.data.body.shopId.trim() : "";
  if (!UUID_RE.test(shopId)) {
    return NextResponse.json({ error: "bad_shop_id" }, { status: 400 });
  }

  const patch: Record<string, boolean> = {};
  if (typeof r.data.body.is_approved === "boolean") patch.is_approved = r.data.body.is_approved;
  if (typeof r.data.body.is_featured === "boolean") patch.is_featured = r.data.body.is_featured;

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "no_fields" }, { status: 400 });
  }

  const { error } = await r.data.supabase.from("shops").update(patch).eq("id", shopId);

  if (error) {
    console.error("[admin/shops/update]", error.message);
    return NextResponse.json({ error: "db", detail: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
