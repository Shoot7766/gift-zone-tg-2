import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function SellerDashboardPage() {
  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-xl font-black text-white">Sotuvchi boshqaruvi</h1>
        <p className="text-sm text-gz-muted">
          Do‘koningizni o‘siring — VIP va analitika bilan ko‘rinadi.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-2xl border border-gz-border bg-gz-surface p-3 text-center">
          <p className="text-[10px] text-gz-muted">Ko‘rishlar</p>
          <p className="text-lg font-black text-white">1.2k</p>
        </div>
        <div className="rounded-2xl border border-gz-border bg-gz-surface p-3 text-center">
          <p className="text-[10px] text-gz-muted">Buyurtmalar</p>
          <p className="text-lg font-black text-gz-accent">48</p>
        </div>
        <div className="rounded-2xl border border-gz-border bg-gz-surface p-3 text-center">
          <p className="text-[10px] text-gz-muted">Tushum</p>
          <p className="text-lg font-black text-amber-300">12M</p>
        </div>
      </div>

      <div className="rounded-3xl border border-amber-500/25 bg-gradient-to-r from-amber-950/40 to-orange-950/30 p-4">
        <h2 className="text-sm font-bold text-amber-200">Rejalar (ko‘rinish)</h2>
        <div className="mt-3 space-y-2">
          <div className="flex justify-between rounded-2xl bg-black/20 px-3 py-2 text-sm">
            <span>Basic</span>
            <Badge variant="neutral">Bepul</Badge>
          </div>
          <div className="flex justify-between rounded-2xl bg-black/20 px-3 py-2 text-sm ring-1 ring-sky-500/40">
            <span>Pro</span>
            <Badge variant="top">Tavsiya</Badge>
          </div>
          <div className="flex justify-between rounded-2xl bg-black/20 px-3 py-2 text-sm ring-1 ring-amber-400/50">
            <span>VIP</span>
            <Badge variant="vip">Top joylashuv</Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-2">
        <Link href="/seller/shop" className="rounded-2xl border border-gz-border bg-gz-elevated px-4 py-3 text-sm font-semibold">
          🏪 Mening do‘konim
        </Link>
        <Link href="/seller/products" className="rounded-2xl border border-gz-border bg-gz-elevated px-4 py-3 text-sm font-semibold">
          📦 Mahsulotlar
        </Link>
        <Link href="/seller/orders" className="rounded-2xl border border-gz-border bg-gz-elevated px-4 py-3 text-sm font-semibold">
          🧾 Buyurtmalar
        </Link>
        <Link href="/seller/analytics" className="rounded-2xl border border-gz-border bg-gz-elevated px-4 py-3 text-sm font-semibold">
          📈 Analitika
        </Link>
      </div>

      <Link href="/profile">
        <Button type="button" variant="ghost" className="w-full">
          ← Profilga qaytish
        </Button>
      </Link>
    </div>
  );
}
