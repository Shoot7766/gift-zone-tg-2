import crypto from "node:crypto";

/**
 * Validates Telegram Web App initData per https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
export function validateTelegramInitData(
  initData: string,
  botToken: string,
  maxAgeSeconds = 86400
): { ok: true; user: TelegramWebAppUser } | { ok: false; reason: string } {
  if (!initData || !botToken) return { ok: false, reason: "missing" };

  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return { ok: false, reason: "no_hash" };

  const authDateRaw = params.get("auth_date");
  const authDate = authDateRaw ? parseInt(authDateRaw, 10) : 0;
  if (!authDate || Number.isNaN(authDate)) return { ok: false, reason: "no_auth_date" };

  const now = Math.floor(Date.now() / 1000);
  if (now - authDate > maxAgeSeconds) return { ok: false, reason: "expired" };

  const pairs: string[] = [];
  for (const [k, v] of params.entries()) {
    if (k === "hash") continue;
    pairs.push(`${k}=${v}`);
  }
  pairs.sort();
  const dataCheckString = pairs.join("\n");

  const secretKey = crypto.createHmac("sha256", "WebAppData").update(botToken).digest();
  const calculated = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");

  if (calculated !== hash) return { ok: false, reason: "bad_hash" };

  const userJson = params.get("user");
  if (!userJson) return { ok: false, reason: "no_user" };

  try {
    const user = JSON.parse(userJson) as TelegramWebAppUser;
    if (!user?.id) return { ok: false, reason: "invalid_user" };
    return { ok: true, user };
  } catch {
    return { ok: false, reason: "parse_user" };
  }
}

export type TelegramWebAppUser = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
};
