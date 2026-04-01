/**
 * Bir foydalanuvchini admin qilish: TELEGRAM_ID va DATABASE_URL .env da bo‘lishi kerak.
 * Ishga tushirish: npx tsx scripts/promote-admin.ts
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const id = process.env.TELEGRAM_ID;
if (!id) {
  console.error("TELEGRAM_ID env o‘rnatilmagan");
  process.exit(1);
}

const prisma = new PrismaClient();

async function main() {
  const telegramId = BigInt(id);
  const u = await prisma.user.update({
    where: { telegramId },
    data: { role: "admin" },
  });
  console.log("Admin berildi:", u.id, u.telegramId.toString());
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
