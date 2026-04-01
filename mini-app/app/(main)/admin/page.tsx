import Link from "next/link";
import { Badge } from "@/components/ui/Badge";

export default function AdminPage() {
  return (
    <div className="space-y-6 pb-8">
      <h1 className="text-xl font-black text-white">Admin paneli</h1>
      <div className="rounded-2xl border border-amber-500/35 bg-amber-950/25 p-3 text-[11px] leading-relaxed text-amber-100/95">
        <strong className="font-bold">Namoyish:</strong> statistikalar hozircha joy ushlovchi.
        Haqiqiy ma’lumotlar backend admin API ulangach ko‘rinadi.
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          ["Foydalanuvchilar", "—"],
          ["Do‘konlar", "—"],
          ["Mahsulotlar", "—"],
          ["Buyurtmalar", "—"],
        ].map(([k, v]) => (
          <div
            key={k}
            className="rounded-3xl border border-gz-border bg-gz-surface p-4 shadow-card"
          >
            <p className="text-xs text-gz-muted">{k}</p>
            <p className="text-2xl font-black text-white">{v}</p>
          </div>
        ))}
      </div>
      <div className="rounded-3xl border border-sky-500/20 bg-sky-950/20 p-4">
        <h2 className="text-sm font-bold text-sky-200">Tasdiqlash navbati</h2>
        <p className="mt-2 text-sm text-gz-muted">
          VIP / featured do‘konlar va mahsulot nazorati — tez orada.
        </p>
        <Badge variant="top" className="mt-2">
          Namoyish rejimi
        </Badge>
      </div>
      <Link href="/admin/shops" className="block rounded-2xl bg-gz-elevated px-4 py-3 text-sm font-semibold">
        🏪 Do‘konlarni boshqarish
      </Link>
      <Link href="/profile" className="block text-center text-sm text-gz-accent2">
        ← Profil
      </Link>
    </div>
  );
}
