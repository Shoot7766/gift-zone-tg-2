import { NextResponse } from "next/server";
import { readTelegramPostBody } from "@/lib/readTelegramBody";
import { assertProductOwnedBySeller } from "@/lib/sellerScope";

export const runtime = "nodejs";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(req: Request) {
  const r = await readTelegramPostBody(req);
  if (!r.ok) return r.response;

  const productId = typeof r.data.body.productId === "string" ? r.data.body.productId.trim() : "";
  if (!UUID_RE.test(productId)) {
    return NextResponse.json({ error: "bad_product_id" }, { status: 400 });
  }

  const owned = await assertProductOwnedBySeller(r.data.supabase, productId, r.data.user.username);
  if (!owned) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const patch: Record<string, unknown> = {};

  if (typeof r.data.body.name === "string") {
    const t = r.data.body.name.trim().slice(0, 200);
    if (t) patch.name = t;
  }
  if (typeof r.data.body.description === "string") {
    patch.description = r.data.body.description.trim().slice(0, 4000);
  }
  if (typeof r.data.body.category === "string") {
    const c = r.data.body.category.trim().slice(0, 80);
    patch.category = c.length > 0 ? c : null;
  }
  if (typeof r.data.body.price === "number" && Number.isFinite(r.data.body.price) && r.data.body.price >= 0) {
    patch.price = r.data.body.price;
  }
  if (typeof r.data.body.is_active === "boolean") {
    patch.is_active = r.data.body.is_active;
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "no_fields" }, { status: 400 });
  }

  const { error } = await r.data.supabase.from("products").update(patch).eq("id", productId);

  if (error) {
    return NextResponse.json({ error: "db", detail: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
