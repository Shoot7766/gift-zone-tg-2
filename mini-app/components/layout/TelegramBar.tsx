"use client";

import Link from "next/link";
import { getTelegramWebApp } from "@/lib/telegram";

export function TelegramBar() {
  return (
    <div className="sticky top-0 z-50 flex items-center justify-between gap-2 border-b border-gz-border bg-gz-bg/90 px-3 py-2 backdrop-blur-md">
      <button
        type="button"
        className="rounded-xl bg-white/5 px-3 py-1.5 text-xs font-semibold text-white"
        onClick={() => getTelegramWebApp()?.close()}
      >
        ⬅️ Botga qaytish
      </button>
      <Link
        href="/ai"
        className="rounded-xl bg-gradient-to-r from-violet-500/30 to-sky-500/30 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-inset ring-white/15"
      >
        🤖 AI orqali sovg‘a topish
      </Link>
    </div>
  );
}
