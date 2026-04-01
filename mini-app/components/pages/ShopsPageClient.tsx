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
  });

  const list = q.data ?? [];

  return (
    <div className="space-y-5 pb-6">
      <div>
        <h1 className="text-xl font-black tracking-tight text-white">Do‘konlar</h1>
        <p className="mt-1 text-sm text-gz-muted">Tasdiqlangan va ishonchli sotuvchilar.</p>
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
