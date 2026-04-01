import Link from "next/link";
import { Badge } from "@/components/ui/Badge";

export default function AdminPage() {
  return (
    <div className="space-y-6 pb-8">
      <h1 className="text-xl font-black text-white">Admin paneli</h1>
      <div className="grid grid-cols-2 gap-3">
        {[
          ["Foydalanuvchilar", "128"],
          ["Do‘konlar", "42"],
          ["Mahsulotlar", "560"],
          ["Buyurtmalar", "89"],
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
