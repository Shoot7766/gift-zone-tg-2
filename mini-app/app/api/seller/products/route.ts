import { NextResponse } from "next/server";
import { readTelegramPostBody } from "@/lib/readTelegramBody";
import { fetchShopsForSeller } from "@/lib/sellerScope";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const r = await readTelegramPostBody(req);
  if (!r.ok) return r.response;

  try {
    const { shops, uname } = await fetchShopsForSeller(r.data.supabase, r.data.user.username);
    if (!uname) {
      return NextResponse.json({ products: [], hint: "no_username" });
    }
    if (shops.length === 0) {
      return NextResponse.json({ products: [] });
    }

    const shopIds = shops.map((s) => s.id);
    const select = `
      id,
      name,
      description,
      price,
      image_url,
      category,
      shop_id,
      is_active,
      created_at,
      shops (
        id,
        name,
        city,
        owner_telegram_username
      )
    `;

    const { data, error } = await r.data.supabase
      .from("products")
      .select(select)
      .in("shop_id", shopIds)
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) {
      return NextResponse.json({ error: "db" }, { status: 500 });
    }

    return NextResponse.json({ products: data ?? [] });
  } catch (e) {
    console.error("[seller/products]", e);
    return NextResponse.json({ error: "db" }, { status: 500 });
  }
}
