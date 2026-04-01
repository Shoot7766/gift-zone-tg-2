"use client";

import { useSupabaseDataStatus } from "@/hooks/useSupabaseDataStatus";

export function DataStatusBanner() {
  const s = useSupabaseDataStatus();

  if (s === "idle" || s === "checking" || s === "ok") return null;

  if (s === "no_config") {
    return (
      <div className="mb-2 rounded-xl border border-amber-500/45 bg-amber-950/50 px-3 py-2.5 text-center text-[11px] leading-snug text-amber-100/95">
        <strong className="font-bold">Eslatma:</strong> Supabase sozlanmagan — hozir{" "}
        <strong>namuna</strong> mahsulotlar ko‘rsatilmoqda.{" "}
        <code className="rounded bg-black/30 px-1">NEXT_PUBLIC_SUPABASE_URL</code> va kalitni
        qo‘ying.
      </div>
    );
  }

  return (
    <div className="mb-2 rounded-xl border border-rose-500/40 bg-rose-950/45 px-3 py-2.5 text-center text-[11px] leading-snug text-rose-100/95">
      <strong className="font-bold">Supabase xato:</strong> jadvalga ulanib bo‘lmadi — ehtimol
      RLS yoki tarmoq. Hozir <strong>namuna</strong> ma’lumotlar ishlatilmoqda.
    </div>
  );
}
