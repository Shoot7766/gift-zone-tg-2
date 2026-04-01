import type { Request, Response, NextFunction } from "express";
import type { Role } from "@prisma/client";
import { verifySession, type SessionPayload } from "../lib/jwt.js";

export type AuthedRequest = Request & {
  auth?: SessionPayload;
};

export function requireAuth(jwtSecret: string) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }
    try {
      req.auth = verifySession(token, jwtSecret);
      next();
    } catch {
      res.status(401).json({ error: "invalid_token" });
    }
  };
}

export function requireRole(...roles: Role[]) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.auth) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }
    if (!roles.includes(req.auth.role)) {
      res.status(403).json({ error: "forbidden" });
      return;
    }
    next();
  };
}
