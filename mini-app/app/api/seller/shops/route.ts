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
      return NextResponse.json({ shops: [], hint: "no_username" });
    }
    return NextResponse.json({ shops });
  } catch (e) {
    console.error("[seller/shops]", e);
    return NextResponse.json({ error: "db" }, { status: 500 });
  }
}
