import Link from "next/link";

export default function SellerShopPage() {
  return (
    <div className="space-y-4 pb-8">
      <Link href="/seller" className="text-xs text-gz-accent2">
        ← Sotuvchi paneli
      </Link>
      <h1 className="text-xl font-black">Mening do‘konim</h1>
      <p className="text-sm text-gz-muted">
        Tez orada: logo, banner, tavsif va shahar — Supabase orqali saqlanadi.
      </p>
    </div>
  );
}
