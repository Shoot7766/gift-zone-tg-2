import Link from "next/link";

export default function SellerProductsPage() {
  return (
    <div className="space-y-4 pb-8">
      <Link href="/seller" className="text-xs text-gz-accent2">
        ← Sotuvchi paneli
      </Link>
      <h1 className="text-xl font-black">Mahsulotlar</h1>
      <p className="text-sm text-gz-muted">Ro‘yxat va tahrirlash — keyingi bosqichda.</p>
    </div>
  );
}
