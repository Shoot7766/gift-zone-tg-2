import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { prisma } from "./lib/prisma.js";
import { createBot } from "./bot/bot.js";
import { authRouter } from "./routes/auth.js";
import { publicRouter } from "./routes/public.js";
import { customerRouter } from "./routes/customer.js";
import { sellerRouter } from "./routes/seller.js";
import { adminRouter } from "./routes/admin.js";
import { meRouter } from "./routes/me.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = parseInt(process.env.PORT ?? "3000", 10);
const BOT_TOKEN = process.env.BOT_TOKEN ?? "";
const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-change-me";
const MINI_APP_URL = process.env.MINI_APP_URL ?? "http://localhost:5173";
const PUBLIC_API_BASE = (process.env.PUBLIC_API_BASE_URL ?? `http://localhost:${PORT}`).replace(/\/$/, "");
const WEBHOOK_URL = process.env.WEBHOOK_URL?.replace(/\/$/, "");

const uploadDir = path.join(__dirname, "..", "uploads");
const publicUploadUrl = `${PUBLIC_API_BASE}/uploads`;

async function main() {
  if (!BOT_TOKEN) {
    console.error("BOT_TOKEN is required");
    process.exit(1);
  }

  const app = express();
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: "2mb" }));
  app.use("/uploads", express.static(uploadDir));

  const bot = createBot({ token: BOT_TOKEN, miniAppUrl: MINI_APP_URL });

  try {
    const me = await bot.telegram.getMe();
    console.log(`Telegram bot: @${me.username} (${me.first_name})`);
  } catch (e) {
    console.error("BOT_TOKEN noto‘g‘ri yoki Telegram tarmog‘iga ulanib bo‘lmadi:", e);
    process.exit(1);
  }

  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    console.log("Ma'lumotlar bazasiga muvaffaqiyatli ulandi.");
  } catch (e) {
    console.error(
      "Prisma / SQLite xato. Backend papkada `npx prisma db push` ni ishga tushiring; DATABASE_URL ni tekshiring.",
      e
    );
    process.exit(1);
  }

  if (process.env.NODE_ENV === "production" && !WEBHOOK_URL) {
    console.warn(
      "[eslatma] Productionda odatda WEBHOOK_URL kerak (serverless / sleep rejimida long polling ishlamaydi)."
    );
  }

  app.use("/api/auth", authRouter({ botToken: BOT_TOKEN, jwtSecret: JWT_SECRET }));
  app.use("/api/public", publicRouter());
  app.use("/api/me", meRouter(JWT_SECRET));
  app.use("/api/customer", customerRouter(JWT_SECRET));
  app.use("/api/seller", sellerRouter(JWT_SECRET, uploadDir, publicUploadUrl));
  app.use("/api/admin", adminRouter(JWT_SECRET));

  app.get("/health", async (_req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.json({ ok: true, database: "up" });
    } catch {
      res.status(503).json({ ok: false, database: "down" });
    }
  });

  const webhookPath = "/telegram/webhook";
  if (WEBHOOK_URL) {
    app.use(bot.webhookCallback(webhookPath));
  }

  app.listen(PORT, () => {
    console.log(`API http://localhost:${PORT}`);
  });

  if (WEBHOOK_URL) {
    await bot.telegram.setWebhook(`${WEBHOOK_URL}${webhookPath}`, {
      secret_token: process.env.BOT_WEBHOOK_SECRET,
    });
    console.log(`Webhook set: ${WEBHOOK_URL}${webhookPath}`);
  } else {
    await bot.telegram.deleteWebhook({ drop_pending_updates: true }).catch(() => {});
    await bot.launch();
    console.log("Bot polling started");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
