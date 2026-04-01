import { Router } from "express";
import type { Role } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { validateTelegramInitData } from "../lib/telegramWebApp.js";
import { signSession } from "../lib/jwt.js";

/** Brauzerda lokal ko‘rish (faqat DEV_AUTH=true va production emas) */
const DEV_PREVIEW_TELEGRAM_ID = BigInt("900000000001");

export function authRouter(opts: { botToken: string; jwtSecret: string }) {
  const r = Router();

  r.post("/dev-login", async (req, res) => {
    if (process.env.DEV_AUTH !== "true" || process.env.NODE_ENV === "production") {
      res.status(404).json({ error: "not_found" });
      return;
    }
    const role = req.body?.role as Role | undefined;
    if (role !== "customer" && role !== "seller" && role !== "admin") {
      res.status(400).json({ error: "bad_role" });
      return;
    }
    const user = await prisma.user.upsert({
      where: { telegramId: DEV_PREVIEW_TELEGRAM_ID },
      create: {
        telegramId: DEV_PREVIEW_TELEGRAM_ID,
        phoneNumber: "+10000000000",
        role,
        firstName: "Dev",
        username: "dev_preview",
      },
      update: { role },
    });
    const token = signSession(
      {
        sub: user.id,
        telegramId: user.telegramId.toString(),
        role: user.role!,
      },
      opts.jwtSecret
    );
    res.json({
      token,
      user: {
        id: user.id,
        telegramId: user.telegramId.toString(),
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        role: user.role!,
      },
    });
  });

  r.post("/telegram", async (req, res) => {
    const initData = typeof req.body?.initData === "string" ? req.body.initData : "";
    const v = validateTelegramInitData(initData, opts.botToken);
    if (!v.ok) {
      res.status(401).json({ error: "invalid_init_data", reason: v.reason });
      return;
    }

    const telegramId = BigInt(v.user.id);
    const user = await prisma.user.findUnique({ where: { telegramId } });

    if (!user?.phoneNumber || user.role == null) {
      res.status(403).json({ error: "registration_incomplete" });
      return;
    }

    const token = signSession(
      {
        sub: user.id,
        telegramId: user.telegramId.toString(),
        role: user.role,
      },
      opts.jwtSecret
    );

    res.json({
      token,
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
