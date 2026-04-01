/** ADMIN_TELEGRAM_IDS=111,222 — Telegram user id (raqam), vergul yoki probel bilan. */
export function parseAdminTelegramIds(): Set<number> {
  const raw = process.env.ADMIN_TELEGRAM_IDS?.trim();
  if (!raw) return new Set();
  const set = new Set<number>();
  for (const part of raw.split(/[,\s]+/)) {
    const t = part.trim();
    if (!t) continue;
    const n = parseInt(t, 10);
    if (!Number.isNaN(n)) set.add(n);
  }
  return set;
}

export function isConfiguredAdminGate(): boolean {
  return parseAdminTelegramIds().size > 0;
}

export function isAdminTelegramUserId(userId: number): boolean {
  return parseAdminTelegramIds().has(userId);
}
