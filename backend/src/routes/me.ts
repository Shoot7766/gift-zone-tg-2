import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import type { AuthedRequest } from "../middleware/auth.js";
import { requireAuth } from "../middleware/auth.js";

export function meRouter(jwtSecret: string) {
  const r = Router();
  r.use(requireAuth(jwtSecret));

  r.get("/", async (req: AuthedRequest, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.auth!.sub } });
    if (!user) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    res.json({
      user: {
        id: user.id,
        telegramId: user.telegramId.toString(),
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        role: user.role,
      },
    });
  });

  return r;
}
