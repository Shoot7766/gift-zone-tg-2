import { Telegraf, Markup } from "telegraf";
import { Prisma } from "@prisma/client";
import type { Role } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import {
  MSG_START,
  MSG_AFTER_CONTACT,
  MSG_REG_SUCCESS,
  MSG_RETURNING,
  MSG_CHANGE_ROLE,
  MSG_ROLE_UPDATED,
  MSG_WRONG_PHONE_INPUT,
  MSG_ROLE_MISSING,
  MSG_TECH_ERROR,
  MSG_USE_PRIVATE_CHAT,
  BTN_OPEN_APP,
  BTN_SHARE_PHONE,
  ROLE_CUSTOMER,
  ROLE_SELLER,
  ROLE_ADMIN,
  CALLBACK_ROLE_CUSTOMER,
  CALLBACK_ROLE_SELLER,
  CALLBACK_ROLE_ADMIN,
} from "./messages.js";

type BotOptions = {
  token: string;
  miniAppUrl: string;
};

/**
 * Matnda havola chiqarmaymiz. HTTPS + ochiq domen bo‘lsa faqat Web App tugmasi.
 * Localhost/http da Telegram Web App tug‘masini qabul qilmaydi — matn + nusxa havola.
 */
async function replyOpenMiniApp(
  ctx: { reply: (text: string, extra?: object) => Promise<unknown> },
  bodyText: string,
  miniAppUrl: string
) {
  let parsed: URL;
  try {
    parsed = new URL(miniAppUrl);
  } catch {
    await ctx.reply(
      `${bodyText}\n\n⚠️ MINI_APP_URL sozlanmagan.`,
      Markup.removeKeyboard()
    );
    return;
  }

  const host = parsed.hostname;
  const isLocal =
    host === "localhost" || host === "127.0.0.1" || host === "[::1]" || host.endsWith(".local");
  const isHttps = parsed.protocol === "https:";

  if (isHttps && !isLocal) {
    await ctx.reply(
      bodyText,
      Markup.keyboard([[Markup.button.webApp(BTN_OPEN_APP, miniAppUrl)]]).resize()
    );
    return;
  }

  await ctx.reply(
    bodyText + miniAppDevHint(miniAppUrl) + `\n\n🔗 ${miniAppUrl}`,
    Markup.removeKeyboard()
  );
}

function miniAppDevHint(url: string): string {
  try {
    const h = new URL(url).hostname;
    if (h === "localhost" || h === "127.0.0.1") {
      return "\n\n📱 Mini App tugmasi uchun MINI_APP_URL da HTTPS manzil (masalan Vercel) kerak.";
    }
  } catch {
    return "";
  }
  return "";
}

function phoneKeyboard() {
  return Markup.keyboard([[Markup.button.contactRequest(BTN_SHARE_PHONE)]]).resize();
}

function roleInlineKeyboard() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(ROLE_CUSTOMER, CALLBACK_ROLE_CUSTOMER),
      Markup.button.callback(ROLE_SELLER, CALLBACK_ROLE_SELLER),
    ],
    [Markup.button.callback(ROLE_ADMIN, CALLBACK_ROLE_ADMIN)],
  ]);
}

async function upsertUserFromTelegram(ctx: {
  from?: { id: number; username?: string; first_name?: string; last_name?: string };
}) {
  const from = ctx.from;
  if (!from) return null;
  const telegramId = BigInt(from.id);
  const run = () =>
    prisma.user.upsert({
      where: { telegramId },
      create: {
        telegramId,
        username: from.username ?? null,
        firstName: from.first_name ?? null,
        lastName: from.last_name ?? null,
      },
      update: {
        username: from.username ?? null,
        firstName: from.first_name ?? null,
        lastName: from.last_name ?? null,
      },
    });
  return withDbRetry(run);
}

async function withDbRetry<T>(fn: () => Promise<T>, attempts = 4): Promise<T> {
  let last: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      last = e;
      const msg = e instanceof Error ? e.message : String(e);
      const busy =
        msg.includes("SQLITE_BUSY") ||
        msg.includes("database is locked") ||
        (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2034");
      if (busy && i < attempts - 1) {
        await new Promise((r) => setTimeout(r, 80 * (i + 1)));
        continue;
      }
      throw e;
    }
  }
  throw last;
}

function parseRoleFromCallback(data: string): Role | null {
  if (data === CALLBACK_ROLE_CUSTOMER) return "customer";
  if (data === CALLBACK_ROLE_SELLER) return "seller";
  if (data === CALLBACK_ROLE_ADMIN) return "admin";
  return null;
}

export function createBot({ token, miniAppUrl }: BotOptions) {
  const bot = new Telegraf(token);

  bot.start(async (ctx) => {
    try {
      if (!ctx.from?.id) {
        await ctx.reply(MSG_TECH_ERROR);
        return;
      }
      if (ctx.chat?.type !== "private") {
        await ctx.reply(MSG_USE_PRIVATE_CHAT);
        return;
      }

      await upsertUserFromTelegram(ctx);
      const telegramId = BigInt(ctx.from.id);
      const user = await withDbRetry(() =>
        prisma.user.findUnique({ where: { telegramId } })
      );

      if (user?.role != null) {
        await replyOpenMiniApp(ctx, MSG_RETURNING, miniAppUrl);
        return;
      }

      await ctx.reply(MSG_START, roleInlineKeyboard());
    } catch (e) {
      console.error("[bot /start]", e);
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        console.error("  Prisma kod:", e.code, e.meta);
      }
      if (e instanceof Error) {
        console.error("  Xabar:", e.message);
      }
      await ctx.reply(MSG_TECH_ERROR);
    }
  });

  bot.command(["rol", "role"], async (ctx) => {
    try {
      if (!ctx.from?.id) {
        await ctx.reply(MSG_TECH_ERROR);
        return;
      }
      if (ctx.chat?.type !== "private") {
        await ctx.reply(MSG_USE_PRIVATE_CHAT);
        return;
      }

      await ctx.reply(MSG_CHANGE_ROLE, roleInlineKeyboard());
    } catch (e) {
      console.error("[bot /rol]", e);
      await ctx.reply(MSG_TECH_ERROR);
    }
  });

  bot.on("contact", async (ctx) => {
    if (ctx.chat?.type !== "private") {
      await ctx.reply(MSG_USE_PRIVATE_CHAT);
      return;
    }
    const contact = ctx.message.contact;
    if (!contact?.phone_number) {
      await ctx.reply(MSG_WRONG_PHONE_INPUT, phoneKeyboard());
      return;
    }

    const telegramId = BigInt(ctx.from!.id);
    const updated = await withDbRetry(() =>
      prisma.user.update({
        where: { telegramId },
        data: { phoneNumber: contact.phone_number },
      })
    );

    await ctx.reply("Rahmat!", Markup.removeKeyboard());

    if (updated.role != null) {
      await replyOpenMiniApp(ctx, MSG_RETURNING, miniAppUrl);
      return;
    }

    await ctx.reply(MSG_AFTER_CONTACT, roleInlineKeyboard());
  });

  bot.on("text", async (ctx) => {
    if (ctx.chat?.type !== "private") {
      return;
    }
    const entities = ctx.message.entities;
    if (entities?.[0]?.type === "bot_command" && entities[0].offset === 0) {
      return;
    }

    const telegramId = BigInt(ctx.from!.id);
    const user = await withDbRetry(() =>
      prisma.user.findUnique({ where: { telegramId } })
    );

    if (user?.role != null) {
      await replyOpenMiniApp(ctx, MSG_RETURNING, miniAppUrl);
      return;
    }

    await ctx.reply(MSG_ROLE_MISSING, roleInlineKeyboard());
  });

  bot.on("callback_query", async (ctx) => {
    const data = "data" in ctx.callbackQuery ? ctx.callbackQuery.data : undefined;
    if (!data || !data.startsWith("role:")) {
      await ctx.answerCbQuery();
      return;
    }

    const role = parseRoleFromCallback(data);
    if (!role) {
      await ctx.answerCbQuery();
      return;
    }

    const telegramId = BigInt(ctx.from!.id);
    const user = await withDbRetry(() =>
      prisma.user.findUnique({ where: { telegramId } })
    );

    if (!user) {
      await ctx.answerCbQuery();
      return;
    }

    const hadRole = user.role != null;

    await ctx.answerCbQuery();

    try {
      await withDbRetry(() =>
        prisma.user.update({
          where: { telegramId },
          data: { role },
        })
      );
    } catch (e) {
      console.error("[bot role callback]", e);
      await ctx.reply(MSG_TECH_ERROR);
      return;
    }

    await ctx.deleteMessage().catch(() => {});
    await replyOpenMiniApp(
      ctx,
      hadRole ? MSG_ROLE_UPDATED : MSG_REG_SUCCESS,
      miniAppUrl
    );
  });

  bot.catch((err, ctx) => {
    console.error("[bot]", err);
    if (ctx?.chat?.id) {
      ctx.reply(MSG_TECH_ERROR).catch(() => {});
    }
  });

  return bot;
}
