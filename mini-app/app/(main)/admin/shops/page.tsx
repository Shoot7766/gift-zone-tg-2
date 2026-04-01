import Link from "next/link";

export default function AdminShopsPage() {
  return (
    <div className="space-y-4 pb-8">
      <Link href="/admin" className="text-xs text-gz-accent2">
        ← Admin
      </Link>
      <h1 className="text-xl font-black">Do‘konlar</h1>
      <p className="text-sm text-gz-muted">Tasdiqlash va VIP belgilash — integratsiya keyingi qadam.</p>
    </div>
  );
}
