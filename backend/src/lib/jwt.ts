import jwt from "jsonwebtoken";
import type { Role } from "@prisma/client";

export type SessionPayload = {
  sub: number;
  telegramId: string;
  role: Role;
};

export function signSession(payload: SessionPayload, secret: string, expiresInSec = 604800): string {
  return jwt.sign(payload, secret, { expiresIn: expiresInSec });
}

export function verifySession(token: string, secret: string): SessionPayload {
  const decoded = jwt.verify(token, secret);
  if (typeof decoded !== "object" || decoded === null) {
    throw new Error("invalid_token");
  }
  const d = decoded as Record<string, unknown>;
  const sub =
    typeof d.sub === "number" ? d.sub : parseInt(String(d.sub), 10);
  const telegramId = d.telegramId;
  const role = d.role;
  if (!Number.isFinite(sub) || typeof telegramId !== "string" || typeof role !== "string") {
    throw new Error("invalid_token");
  }
  return { sub, telegramId, role: role as Role };
}
