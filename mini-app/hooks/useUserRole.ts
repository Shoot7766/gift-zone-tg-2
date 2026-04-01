"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchUserRoleByTelegramId } from "@/services/users";
import type { UserRole } from "@/types/database";
import { useSupabase } from "./useSupabase";
import { useTelegramUserId } from "./useTelegramUser";

export function useUserRole() {
  const supabase = useSupabase();
  const tgId = useTelegramUserId();

  return useQuery({
    queryKey: ["user-role", tgId],
    queryFn: async () => {
      if (tgId == null) return "customer" as UserRole;
      return fetchUserRoleByTelegramId(supabase, tgId);
    },
    staleTime: 5 * 60 * 1000,
    enabled: true,
  });
}
