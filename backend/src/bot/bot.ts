import { Telegraf, Markup } from "telegraf";
import { Prisma } from "@prisma/client";
import type { Role } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import {
  MSG_START,
  MSG_AFTER_PHONE,
  MSG_REG_SUCCESS,
  MSG_RETURNING,
  MSG_WRONG_PHONE_INPUT,
  MSG_ROLE_MISSING,
  MSG_TECH_ERROR,
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

function webAppButton(url: string) {
  return Markup.keyboard([[Markup.button.webApp(BTN_OPEN_APP, url)]]).resize();
}

function phoneKeyboard() {
  return Markup.keyboard([
    [Markup.button.contactRequest(BTN_SHARE_PHONE)],
  ]).resize();
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
  return prisma.user.upsert({
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
      await upsertUserFromTelegram(ctx);
      const telegramId = BigInt(ctx.from.id);
      const user = await prisma.user.findUnique({ where: { telegramId } });

      if (user?.phoneNumber && user.role != null) {
        await ctx.reply(MSG_RETURNING, webAppButton(miniAppUrl));
        return;
      }

      await ctx.reply(MSG_START, phoneKeyboard());
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

  bot.on("contact", async (ctx) => {
    const contact = ctx.message.contact;
    if (!contact?.phone_number) {
      await ctx.reply(MSG_WRONG_PHONE_INPUT, phoneKeyboard());
      return;
    }

    const telegramId = BigInt(ctx.from!.id);
    await prisma.user.update({
      where: { telegramId },
      data: { phoneNumber: contact.phone_number },
    });

    // Telegram bitta xabarda inline klaviatura bilan remove_keyboard ni birlashtira olmaydi.
    // Avval telefon tugmalarini yopamiz, keyin rol uchun inline tugmalar yuboramiz.
    await ctx.reply(MSG_AFTER_PHONE, Markup.removeKeyboard());
    await ctx.reply("Quyidagi tugmalardan birini bosing:", roleInlineKeyboard());
  });

  bot.on("text", async (ctx) => {
    const telegramId = BigInt(ctx.from!.id);
    const user = await prisma.user.findUnique({ where: { telegramId } });

    if (user?.phoneNumber && user.role != null) {
      await ctx.reply(MSG_RETURNING, webAppButton(miniAppUrl));
      return;
    }

    if (!user?.phoneNumber) {
      await ctx.reply(MSG_WRONG_PHONE_INPUT, phoneKeyboard());
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
    const user = await prisma.user.findUnique({ where: { telegramId } });

    if (!user?.phoneNumber) {
      await ctx.answerCbQuery();
      await ctx.reply(MSG_WRONG_PHONE_INPUT, phoneKeyboard());
      return;
    }

    await prisma.user.update({
      where: { telegramId },
      data: { role },
    });

    await ctx.answerCbQuery();
    await ctx.deleteMessage().catch(() => {});
    await ctx.reply(MSG_REG_SUCCESS, webAppButton(miniAppUrl));
  });

  bot.catch((err, ctx) => {
    console.error("[bot]", err);
    if (ctx?.chat?.id) {
      ctx.reply(MSG_TECH_ERROR).catch(() => {});
    }
  });

  return bot;
}
