import Link from "next/link";

export default function SellerAnalyticsPage() {
  return (
    <div className="space-y-4 pb-8">
      <Link href="/seller" className="text-xs text-gz-accent2">
        ← Sotuvchi paneli
      </Link>
      <h1 className="text-xl font-black">Analitika</h1>
      <p className="text-sm text-gz-muted">
        Ko‘rishlar, bosishlar va tushum — Supabase agregatsiyasi bilan ulash mumkin.
      </p>
    </div>
  );
}
