import { NextResponse } from "next/server";
import { buildGiftSearchQuery } from "@/lib/aiGiftOptions";
import { clientIp, rateLimitAllow } from "@/lib/rateLimitSimple";

export const runtime = "nodejs";

const AI_RL_MAX = 30;
const AI_RL_MS = 60_000;

type Body = {
  recipient?: string;
  occasion?: string;
  extra?: string;
};

/**
 * OPENAI_API_KEY bo‘lsa — qisqa kalit so‘zlar; yo‘q bo‘lsa — qoida asosida qidiruv qatori.
 */
export async function POST(req: Request) {
  const ip = clientIp(req);
  if (!rateLimitAllow(`ai:${ip}`, AI_RL_MAX, AI_RL_MS)) {
    return NextResponse.json({ error: "rate_limit" }, { status: 429 });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const recipient = typeof body.recipient === "string" ? body.recipient : "hamma";
  const occasion = typeof body.occasion === "string" ? body.occasion : "tug";
  const extra = typeof body.extra === "string" ? body.extra : "";

  const rulesQ = buildGiftSearchQuery({ recipient, occasion, extra });
  const key = process.env.OPENAI_API_KEY?.trim();

  if (!key) {
    return NextResponse.json({ q: rulesQ, source: "rules" as const });
  }

  try {
    const prompt = `Vazifa: foydalanuvchi sovg'a qidiradi. Faqat 6-10 ta qisqa kalit so'z qaytaring (o'zbek yoki rus, probel bilan ajratilgan), boshqa matn yo'q.
Kontekst: ${rulesQ}`;

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 80,
        temperature: 0.6,
      }),
    });

    if (!r.ok) {
      return NextResponse.json({ q: rulesQ, source: "rules" as const });
    }

    const j = (await r.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = j.choices?.[0]?.message?.content?.trim() || "";
    const q = text.replace(/^["']|["']$/g, "").slice(0, 200) || rulesQ;
    return NextResponse.json({ q, source: "openai" as const });
  } catch {
    return NextResponse.json({ q: rulesQ, source: "rules" as const });
  }
}
