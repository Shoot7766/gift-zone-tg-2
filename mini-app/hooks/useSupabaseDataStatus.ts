"use client";

import { useEffect, useState } from "react";
import { isSupabaseConfigured } from "@/lib/supabase";
import { useSupabase } from "@/hooks/useSupabase";

export type SupabaseReachability = "idle" | "checking" | "ok" | "no_config" | "error";

/**
 * Bir marta tekshiruv: jadvalga ulanish bormi (RLS / tarmoq).
 * fetchProducts xatolikda mock qaytaradi — foydalanuvchi buni boshqa yo‘l bilan bilmaydi.
 */
export function useSupabaseDataStatus(): SupabaseReachability {
  const supabase = useSupabase();
  const [status, setStatus] = useState<SupabaseReachability>("idle");

  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) {
      setStatus("no_config");
      return;
    }

    let cancelled = false;
    setStatus("checking");

    void supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .limit(1)
      .then(({ error }) => {
        if (cancelled) return;
        setStatus(error ? "error" : "ok");
      });

    return () => {
      cancelled = true;
    };
  }, [supabase]);

  return status;
}
