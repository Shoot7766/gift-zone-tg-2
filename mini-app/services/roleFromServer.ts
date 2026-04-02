import type { UserRole } from "@/types/database";

/**
 * Vercel server: Supabase `users` + service_role (RLS dan tashqari).
 */
export async function fetchRoleFromMiniServer(): Promise<UserRole | null> {
  if (typeof window === "undefined") return null;
  const initData = window.Telegram?.WebApp?.initData ?? "";
  if (!initData) return null;
  try {
    const res = await fetch("/api/user-role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ initData }),
    });
    if (res.status === 503) return null;
    if (!res.ok) return null;
    const j = (await res.json()) as { role?: string };
    const r = j.role;
    if (r === "customer" || r === "seller" || r === "admin") return r;
    return null;
  } catch {
    return null;
  }
}
