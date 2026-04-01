import { NextResponse } from "next/server";
import { readTelegramPostBody } from "@/lib/readTelegramBody";
import { assertShopOwned } from "@/lib/sellerScope";

export const runtime = "nodejs";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function str(v: unknown, max: number): string | undefined {
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  if (!t) return undefined;
  return t.slice(0, max);
}

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

  const patch: Record<string, string> = {};
  const name = str(r.data.body.name, 120);
  const description = str(r.data.body.description, 2000);
  const city = str(r.data.body.city, 80);
  const owner = str(r.data.body.owner_telegram_username, 64);

  if (name !== undefined) patch.name = name;
  if (description !== undefined) patch.description = description;
  if (city !== undefined) patch.city = city;
  if (owner !== undefined) patch.owner_telegram_username = owner.replace(/^@/, "");

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "no_fields" }, { status: 400 });
  }

  const { error } = await r.data.supabase.from("shops").update(patch).eq("id", shopId);

  if (error) {
    return NextResponse.json({ error: "db", detail: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
