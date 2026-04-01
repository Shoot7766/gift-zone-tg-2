import type { SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { requireBotAndServiceSupabase } from "@/lib/supabaseAdmin";
import { validateTelegramInitData } from "@/lib/telegramInitData";

export type TelegramAuthedBody = {
  supabase: SupabaseClient;
  user: { id: number; username?: string; first_name?: string };
  body: Record<string, unknown>;
};

export type ReadTelegramResult =
  | { ok: true; data: TelegramAuthedBody }
  | { ok: false; response: NextResponse };

export async function readTelegramPostBody(req: Request): Promise<ReadTelegramResult> {
  const gate = requireBotAndServiceSupabase();
  if (!gate.ok) {
    return { ok: false, response: NextResponse.json({ error: "server_misconfigured" }, { status: 503 }) };
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return { ok: false, response: NextResponse.json({ error: "bad_json" }, { status: 400 }) };
  }

  const initData = typeof body.initData === "string" ? body.initData : "";
  if (!initData) {
    return { ok: false, response: NextResponse.json({ error: "empty_init" }, { status: 400 }) };
  }

  const v = validateTelegramInitData(initData, gate.botToken);
  if (!v.ok) {
    return {
      ok: false,
      response: NextResponse.json({ error: "invalid_init", reason: v.reason }, { status: 401 }),
    };
  }

  return {
    ok: true,
    data: { supabase: gate.supabase, user: v.user, body },
  };
}
