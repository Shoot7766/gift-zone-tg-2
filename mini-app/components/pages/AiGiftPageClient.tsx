"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { MOCK_CATEGORIES } from "@/lib/mock-data";

const RECIPIENTS = [
  { id: "ayol", label: "Ayolga", q: "ayol qiz" },
  { id: "erkak", label: "Erkakka", q: "erkak ota" },
  { id: "bola", label: "Bolaga", q: "bola bolalar" },
  { id: "hamma", label: "Har kimga", q: "sovg'a universal" },
] as const;

const OCCASIONS = [
  { id: "tug", label: "Tug‘ilgan kun", q: "tug'ilgan kun tort" },
  { id: "bayram", label: "Bayram", q: "bayram sovg'a" },
  { id: "nikoh", label: "To‘y / nikoh", q: "to'y nikoh" },
  { id: "rahmat", label: "Rahmat", q: "rahmat minnatdorlik" },
  { id: "ish", label: "Ish / muvaffaqiyat", q: "ish muvaffaqiyat" },
] as const;

export default function AiGiftPageClient() {
  const router = useRouter();
  const [recipient, setRecipient] = useState<(typeof RECIPIENTS)[number]["id"]>("ayol");
  const [occasion, setOccasion] = useState<(typeof OCCASIONS)[number]["id"]>("tug");
  const [extra, setExtra] = useState("");
  const [category, setCategory] = useState<string>("Hammasi");

  const openProducts = useCallback(() => {
    const r = RECIPIENTS.find((x) => x.id === recipient)?.q ?? "";
    const o = OCCASIONS.find((x) => x.id === occasion)?.q ?? "";
    const bits = ["sovg'a", r, o, extra.trim()].filter(Boolean);
    const q = bits.join(" ");
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (category && category !== "Hammasi") params.set("category", category);
    const href = `/products${params.toString() ? `?${params}` : ""}`;
    router.push(href);
  }, [recipient, occasion, extra, category, router]);

  return (
    <div className="mx-auto max-w-md space-y-6 px-1 py-4">
      <div className="rounded-3xl border border-violet-500/25 bg-gradient-to-br from-violet-950/40 via-gz-surface to-emerald-950/25 p-5 shadow-card">
        <p className="text-[11px] font-bold uppercase tracking-widest text-violet-300/90">
          Gift Zone
        </p>
        <h1 className="mt-2 text-2xl font-black leading-tight text-white">
          🤖 Sovg‘a tanlash yordamchisi
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-gz-muted">
          Bir nechta savol — keyin sizni mos mahsulotlar ro‘yxatiga yo‘naltiramiz (qidiruv orqali).
        </p>
      </div>

      <section className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-wide text-gz-muted">Kimga?</p>
        <div className="grid grid-cols-2 gap-2">
          {RECIPIENTS.map((x) => (
            <button
              key={x.id}
              type="button"
              onClick={() => setRecipient(x.id)}
              className={`rounded-2xl border px-3 py-3 text-left text-sm font-semibold transition ${
                recipient === x.id
                  ? "border-violet-400/50 bg-violet-500/15 text-white ring-1 ring-violet-400/30"
                  : "border-gz-border bg-gz-elevated text-gz-muted hover:text-white"
              }`}
            >
              {x.label}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-wide text-gz-muted">Voqea</p>
        <div className="flex flex-col gap-2">
          {OCCASIONS.map((x) => (
            <button
              key={x.id}
              type="button"
              onClick={() => setOccasion(x.id)}
              className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                occasion === x.id
                  ? "border-emerald-400/50 bg-emerald-500/12 text-white ring-1 ring-emerald-400/25"
                  : "border-gz-border bg-gz-elevated text-gz-muted hover:text-white"
              }`}
            >
              {x.label}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-wide text-gz-muted">
          Kategoriya (ixtiyoriy)
        </p>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-2xl border border-gz-border bg-gz-surface px-4 py-3 text-sm font-medium text-white focus:border-violet-500/40 focus:outline-none focus:ring-1 focus:ring-violet-500/30"
        >
          {MOCK_CATEGORIES.map((c) => (
            <option key={c} value={c} className="bg-gz-bg">
              {c}
            </option>
          ))}
        </select>
      </section>

      <section className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wide text-gz-muted" htmlFor="ai-extra">
          Qo‘shimcha (ixtiyoriy)
        </label>
        <textarea
          id="ai-extra"
          value={extra}
          onChange={(e) => setExtra(e.target.value)}
          rows={3}
          placeholder="Masalan: kitob yoqtiradi, gullarni yaxshi ko‘radi…"
          className="w-full resize-none rounded-2xl border border-gz-border bg-gz-surface px-4 py-3 text-sm text-white placeholder:text-gz-muted focus:border-violet-500/40 focus:outline-none focus:ring-1 focus:ring-violet-500/30"
        />
      </section>

      <Button type="button" className="w-full py-3.5 text-base font-bold shadow-lg shadow-violet-900/25" onClick={openProducts}>
        🔍 Mos mahsulotlarni ko‘rish
      </Button>

      <div className="flex flex-col gap-2 border-t border-gz-border pt-4">
        <Link href="/products">
          <Button type="button" variant="secondary" className="w-full">
            🛍 Barcha mahsulotlar
          </Button>
        </Link>
        <Link href="/">
          <Button type="button" variant="ghost" className="w-full">
            Bosh sahifa
          </Button>
        </Link>
      </div>
    </div>
  );
}
