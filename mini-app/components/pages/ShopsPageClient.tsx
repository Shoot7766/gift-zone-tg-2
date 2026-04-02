"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ShopCard } from "@/components/shop/ShopCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ShopCardSkeleton } from "@/components/ui/Skeleton";
import { useSupabase } from "@/hooks/useSupabase";
import { fetchApprovedShops } from "@/services/shops";

export default function ShopsPageClient() {
  const supabase = useSupabase();
  const sbKey = supabase ? "sb" : "mock";

  const q = useQuery({
    queryKey: ["shops", sbKey],
    queryFn: () => fetchApprovedShops(supabase, { limit: 48 }),
    staleTime: 90_000,
    gcTime: 240_000,
  });

  const list = q.data ?? [];

  return (
    <div className="space-y-5 pb-6">
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-gradient-to-br from-sky-950/40 via-gz-surface to-emerald-950/30 p-5 shadow-[0_20px_50px_-24px_rgba(56,189,248,0.2)]">
        <div className="pointer-events-none absolute -right-8 top-0 h-32 w-32 rounded-full bg-sky-400/10 blur-3xl" />
        <h1 className="text-xl font-black tracking-tight text-white">Do‘konlar</h1>
        <p className="mt-2 text-sm leading-relaxed text-gz-muted">
          Tasdiqlangan va ishonchli sotuvchilar. VIP va TOP belgilari bilan ajralib turadi.
        </p>
      </div>
      <Link href="/" className="text-xs font-semibold text-gz-accent2">
        ← Bosh sahifa
      </Link>

      {q.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <ShopCardSkeleton key={i} />
          ))}
        </div>
      ) : list.length === 0 ? (
        <EmptyState
          emoji="🏪"
          title="Do‘konlar hozircha yo‘q"
          hint="Keyinroq kiring — yangi do‘konlar qo‘shilmoqda."
        />
      ) : (
        <div className="space-y-3">
          {list.map((s) => (
            <ShopCard key={s.id} shop={s} />
          ))}
        </div>
      )}
    </div>
  );
}
