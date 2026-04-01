export type TelegramWebAppUser = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
};

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        close: () => void;
        initData: string;
        initDataUnsafe: { user?: TelegramWebAppUser };
        themeParams: Record<string, string>;
        setHeaderColor: (c: string) => void;
        setBackgroundColor: (c: string) => void;
        openTelegramLink: (url: string) => void;
      };
    };
  }
}

export function getTelegramWebApp() {
  if (typeof window === "undefined") return null;
  return window.Telegram?.WebApp ?? null;
}

export function getTelegramUser(): TelegramWebAppUser | null {
  return getTelegramWebApp()?.initDataUnsafe?.user ?? null;
}

export function initTelegramUi() {
  const tw = getTelegramWebApp();
  if (!tw) return;
  tw.ready();
  tw.expand();
  tw.setHeaderColor("#070a0f");
  tw.setBackgroundColor("#070a0f");
}
