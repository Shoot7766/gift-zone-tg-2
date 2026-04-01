"use client";

import { useMemo } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";

export function useSupabase() {
  return useMemo(() => createSupabaseBrowserClient(), []);
}
