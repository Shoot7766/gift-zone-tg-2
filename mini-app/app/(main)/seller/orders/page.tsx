import Link from "next/link";

export default function SellerOrdersPage() {
  return (
    <div className="space-y-4 pb-8">
      <Link href="/seller" className="text-xs text-gz-accent2">
        ← Sotuvchi paneli
      </Link>
      <h1 className="text-xl font-black">Buyurtmalar</h1>
      <p className="text-sm text-gz-muted">Yangi buyurtmalar shu yerda ko‘rinadi.</p>
    </div>
  );
}
