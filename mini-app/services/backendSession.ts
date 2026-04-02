import type { UserRole } from "@/types/database";

export const GZ_JWT_STORAGE_KEY = "gz_api_jwt";

function apiBase(): string | null {
  const u = process.env.NEXT_PUBLIC_API_BASE_URL?.trim().replace(/\/$/, "");
  return u || null;
}

/** Backend (Prisma) dagi rol — bot bilan bir xil manba. Tarmoq xatosi → null. */
export async function fetchRoleFromBackend(): Promise<UserRole | null> {
  try {
    const base = apiBase();
    if (!base || typeof window === "undefined") return null;

    const initData = window.Telegram?.WebApp?.initData ?? "";
    if (!initData) return null;

    let token = sessionStorage.getItem(GZ_JWT_STORAGE_KEY);

    if (token) {
      const me = await fetch(`${base}/api/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (me.ok) {
        const j = (await me.json()) as { user?: { role?: string } };
        const r = j.user?.role;
        if (r === "customer" || r === "seller" || r === "admin") return r;
      }
      sessionStorage.removeItem(GZ_JWT_STORAGE_KEY);
      token = null;
    }

    const authRes = await fetch(`${base}/api/auth/telegram`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ initData }),
    });

    if (!authRes.ok) return null;

    const authJson = (await authRes.json()) as {
      token?: string;
      user?: { role?: string };
    };

    if (typeof authJson.token === "string") {
      sessionStorage.setItem(GZ_JWT_STORAGE_KEY, authJson.token);
    }

    const r = authJson.user?.role;
    if (r === "customer" || r === "seller" || r === "admin") return r;
    return null;
  } catch {
    return null;
  }
}

export function clearBackendSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(GZ_JWT_STORAGE_KEY);
}

export function getStoredJwt(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(GZ_JWT_STORAGE_KEY);
}
