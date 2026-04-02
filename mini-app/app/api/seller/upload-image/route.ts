import { NextResponse } from "next/server";
import { requireBotAndServiceSupabase } from "@/lib/supabaseAdmin";
import { fetchShopsForSeller } from "@/lib/sellerScope";
import { validateTelegramInitData } from "@/lib/telegramInitData";

export const runtime = "nodejs";

const MAX_BYTES = 2_800_000; // ~2.7 MB
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function extFromMime(mime: string): string {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  return "jpg";
}

/**
 * FormData: initData (string), file (File)
 * Supabase Storage: public bucket (masalan product-images). Dashboard dan yarating.
 */
export async function POST(req: Request) {
  const gate = requireBotAndServiceSupabase();
  if (!gate.ok) {
    return NextResponse.json({ error: "server_misconfigured" }, { status: 503 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "bad_form" }, { status: 400 });
  }

  const initData = typeof form.get("initData") === "string" ? (form.get("initData") as string) : "";
  if (!initData) {
    return NextResponse.json({ error: "empty_init" }, { status: 400 });
  }

  const v = validateTelegramInitData(initData, gate.botToken);
  if (!v.ok) {
    return NextResponse.json({ error: "invalid_init" }, { status: 401 });
  }

  const { shops } = await fetchShopsForSeller(gate.supabase, v.user.username);
  if (shops.length === 0) {
    return NextResponse.json({ error: "no_shop" }, { status: 403 });
  }

  const file = form.get("file");
  if (!file || !(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "no_file" }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "too_large" }, { status: 400 });
  }

  const mime = file.type || "application/octet-stream";
  if (!ALLOWED.has(mime)) {
    return NextResponse.json({ error: "bad_type" }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const bucket =
    process.env.SUPABASE_PRODUCT_IMAGES_BUCKET?.trim() || "product-images";
  const ext = extFromMime(mime);
  const safeName = `${v.user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;

  const { data, error } = await gate.supabase.storage.from(bucket).upload(safeName, buf, {
    contentType: mime,
    cacheControl: "3600",
    upsert: false,
  });

  if (error) {
    console.error("[upload-image]", error.message);
    return NextResponse.json({ error: "upload_failed", detail: error.message }, { status: 500 });
  }

  const { data: pub } = gate.supabase.storage.from(bucket).getPublicUrl(data.path);

  return NextResponse.json({ url: pub.publicUrl });
}
