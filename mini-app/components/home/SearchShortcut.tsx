"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchShortcut() {
  const [q, setQ] = useState("");
  const router = useRouter();

  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const s = q.trim();
        router.push(s ? `/products?q=${encodeURIComponent(s)}` : "/products");
      }}
    >
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Mahsulot qidirish…"
        className="min-w-0 flex-1 rounded-2xl border border-gz-border bg-black/30 px-4 py-3 text-sm text-white placeholder:text-gz-muted"
      />
      <button
        type="submit"
        className="shrink-0 rounded-2xl bg-gz-accent px-4 py-3 text-sm font-bold text-black"
      >
        Qidirish
      </button>
    </form>
  );
}
