import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { TopBar } from "../../components/TopBar";

const names: Record<string, string> = {
  free: "Bepul",
  basic: "Asosiy",
  vip: "VIP",
};

export function SellerSubscription() {
  const [type, setType] = useState<string>("free");

  useEffect(() => {
    void api<{ subscriptionType: string }>("/api/seller/analytics").then((r) => setType(r.subscriptionType));
  }, []);

  return (
    <>
      <TopBar title="Obuna" />
      <div className="page">
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Obuna ma’lumotlari</h3>
          <p className="muted">
            Joriy tarif: <span className="pill">{names[type] ?? type}</span>
          </p>
          <p className="muted" style={{ marginTop: 12 }}>
            VIP va featured holatini platforma admini boshqaradi. Savollar bo‘yicha qo‘llab-quvvatlashga
            murojaat qiling.
          </p>
        </div>
      </div>
    </>
  );
}
