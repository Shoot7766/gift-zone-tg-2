"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchRoleFromBackend } from "@/services/backendSession";
import { fetchRoleFromMiniServer } from "@/services/roleFromServer";
import { fetchUserRoleByTelegramId, mergeHighestUserRole } from "@/services/users";
import type { UserRole } from "@/types/database";
import { useSupabase } from "./useSupabase";
import { useTelegramUserId } from "./useTelegramUser";

export function useUserRole() {
  const supabase = useSupabase();
  const tgId = useTelegramUserId();
  const useApi = Boolean(process.env.NEXT_PUBLIC_API_BASE_URL?.trim());

  return useQuery({
    queryKey: ["user-role", tgId, useApi],
    queryFn: async () => {
      if (tgId == null) return "customer" as UserRole;

      // Parallel: oldin backend «customer» qaytsa ham Supabase seller/admin e'tibordan qolmasin.
      const [fromBackend, fromMini, fromAnon] = await Promise.all([
        useApi ? fetchRoleFromBackend() : Promise.resolve(null as UserRole | null),
        fetchRoleFromMiniServer(),
        fetchUserRoleByTelegramId(supabase, tgId),
      ]);

      return mergeHighestUserRole(fromBackend, fromMini, fromAnon);
    },
    staleTime: useApi ? 30 * 1000 : 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    enabled: true,
  });
}
