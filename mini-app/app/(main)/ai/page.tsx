import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function AiGiftPage() {
  return (
    <div className="mx-auto max-w-md space-y-6 px-2 py-6">
      <h1 className="text-2xl font-black text-white">🤖 AI yordamchisi</h1>
      <p className="text-sm leading-relaxed text-gz-muted">
        Tez orada: qabul qiluvchi va byudjet bo‘yicha sovg‘a tavsiyalari, to‘g‘ridan-to‘g‘ri
        mahsulotlar ro‘yxatiga yo‘naltirish.
      </p>
      <div className="rounded-3xl border border-violet-500/30 bg-violet-950/30 p-4 text-sm text-gz-muted">
        Hozircha bu sahifa tayyorlanmoqda. Mahsulotlarni oddiy qidiruv orqali ko‘rishingiz
        mumkin.
      </div>
      <Link href="/products">
        <Button type="button" className="w-full">
          🛍 Mahsulotlarni ko‘rish
        </Button>
      </Link>
      <Link href="/">
        <Button type="button" variant="secondary" className="w-full">
          Bosh sahifa
        </Button>
      </Link>
    </div>
  );
}
