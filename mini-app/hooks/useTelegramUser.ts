"use client";

import { useSyncExternalStore } from "react";

function getSnap(): number | null {
  if (typeof window === "undefined") return null;
  const u = window.Telegram?.WebApp?.initDataUnsafe?.user;
  return u?.id ?? null;
}

function subscribe(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const id = window.setInterval(cb, 800);
  return () => window.clearInterval(id);
}

export function useTelegramUserId(): number | null {
  return useSyncExternalStore(subscribe, getSnap, () => null);
}
