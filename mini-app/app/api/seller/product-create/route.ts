import { NextResponse } from "next/server";
import { readTelegramPostBody } from "@/lib/readTelegramBody";
import { assertShopOwned } from "@/lib/sellerScope";

export const runtime = "nodejs";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(req: Request) {
  const r = await readTelegramPostBody(req);
  if (!r.ok) return r.response;

  const shopId = typeof r.data.body.shopId === "string" ? r.data.body.shopId.trim() : "";
  if (!UUID_RE.test(shopId)) {
    return NextResponse.json({ error: "bad_shop_id" }, { status: 400 });
  }

  const owned = await assertShopOwned(r.data.supabase, shopId, r.data.user.username);
  if (!owned) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const name = typeof r.data.body.name === "string" ? r.data.body.name.trim().slice(0, 200) : "";
  if (!name) {
    return NextResponse.json({ error: "name_required" }, { status: 400 });
  }

  const description =
    typeof r.data.body.description === "string" ? r.data.body.description.trim().slice(0, 4000) : "";

  const priceRaw = r.data.body.price;
  const price =
    typeof priceRaw === "number" && Number.isFinite(priceRaw) && priceRaw >= 0 ? priceRaw : NaN;
  if (Number.isNaN(price)) {
    return NextResponse.json({ error: "bad_price" }, { status: 400 });
  }

  const category =
    typeof r.data.body.category === "string" ? r.data.body.category.trim().slice(0, 80) : null;

  const image_url =
    typeof r.data.body.image_url === "string" && r.data.body.image_url.trim()
      ? r.data.body.image_url.trim().slice(0, 2000)
      : null;

  const product_type =
    r.data.body.product_type === "service" || r.data.body.product_type === "product"
      ? r.data.body.product_type
      : "product";

  const service_type =
    product_type === "service" && typeof r.data.body.service_type === "string"
      ? r.data.body.service_type.trim().slice(0, 120) || null
      : null;

  let stock: number | null = null;
  if (product_type === "product") {
    const st = r.data.body.stock;
    if (st === null || st === undefined || st === "") {
      stock = null;
    } else if (typeof st === "number" && Number.isFinite(st) && st >= 0) {
      stock = Math.floor(st);
    } else {
      return NextResponse.json({ error: "bad_stock" }, { status: 400 });
    }
  }

  const row: Record<string, unknown> = {
    shop_id: shopId,
    name,
    description: description || null,
    price,
    category,
    image_url,
    product_type,
    stock,
    service_type,
    is_active: true,
  };

  const { data, error } = await r.data.supabase.from("products").insert(row).select("id").maybeSingle();

  if (error) {
    console.error("[product-create]", error.message);
    return NextResponse.json({ error: "db", detail: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: (data as { id?: string } | null)?.id ?? null });
}
