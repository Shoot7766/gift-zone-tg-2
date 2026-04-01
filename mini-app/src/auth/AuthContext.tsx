import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api, setAuthToken } from "../api/client";

export type Role = "customer" | "seller" | "admin";

export type AuthUser = {
  id: number;
  telegramId: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  role: Role;
};

type AuthState =
  | { status: "loading" }
  | { status: "need_bot"; message: string }
  | { status: "incomplete" }
  | { status: "ready"; user: AuthUser; token: string; devPreview?: boolean }
  | { status: "error"; message: string };

const AuthContext = createContext<{
  state: AuthState;
  logout: () => void;
  refresh: () => Promise<void>;
} | null>(null);

async function loginWithInitData(initData: string) {
  return api<{ token: string; user: AuthUser }>("/api/auth/telegram", {
    method: "POST",
    json: { initData },
  });
}

async function loginDevPreview(role: Role) {
  return api<{ token: string; user: AuthUser }>("/api/auth/dev-login", {
    method: "POST",
    json: { role },
  });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "loading" });

  const refresh = useCallback(async () => {
    const params = new URLSearchParams(window.location.search);
    const devRole = params.get("devRole") as Role | null;
    if (
      import.meta.env.DEV &&
      devRole &&
      (devRole === "customer" || devRole === "seller" || devRole === "admin")
    ) {
      try {
        const { token, user } = await loginDevPreview(devRole);
        setAuthToken(token);
        setState({ status: "ready", user, token, devPreview: true });
        return;
      } catch {
        setState({
          status: "error",
          message:
            "Lokal ko‘rish yoqilmagan. Backend .env da DEV_AUTH=true qo‘ying va serverni qayta ishga tushiring.",
        });
        return;
      }
    }

    const tw = window.Telegram?.WebApp;
    if (!tw) {
      setState({
        status: "need_bot",
        message:
          "Telegram ichida oching yoki brauzerda sinash: http://localhost:5173/?devRole=customer (backend: DEV_AUTH=true).",
      });
      return;
    }
    tw.ready();
    tw.expand();
    const initData = tw.initData;
    if (!initData) {
      setState({ status: "need_bot", message: "Telegram orqali kirish talab qilinadi." });
      return;
    }
    try {
      const { token, user } = await loginWithInitData(initData);
      setAuthToken(token);
      setState({ status: "ready", user, token });
    } catch (e: unknown) {
      const err = e as { status?: number; data?: { error?: string } };
      if (err.status === 403 && err.data?.error === "registration_incomplete") {
        setState({ status: "incomplete" });
        return;
      }
      setState({ status: "error", message: "Kirishda xatolik. Qayta urinib ko‘ring." });
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const logout = useCallback(() => {
    setAuthToken(null);
    setState({ status: "need_bot", message: "Chiqildi." });
  }, []);

  const value = useMemo(() => ({ state, logout, refresh }), [state, logout, refresh]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth");
  return ctx;
}
