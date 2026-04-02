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

  const { error } = await r.data.supabase.from("products").delete().eq("id", productId);

  if (error) {
    return NextResponse.json({ error: "db", detail: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
