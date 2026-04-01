import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { TopBar } from "../../components/TopBar";

type Stats = {
  usersCount: number;
  sellersCount: number;
  productsCount: number;
  shopsCount: number;
  ordersCount: number;
  revenueTotal: number;
  pendingShopsCount: number;
};

export function AdminHome() {
  const [s, setS] = useState<Stats | null>(null);

  useEffect(() => {
    void api<Stats>("/api/admin/stats").then(setS);
  }, []);

  return (
    <>
      <TopBar title="Admin" />
      <div className="page">
        {!s ? (
          <p className="muted">Yuklanmoqda…</p>
        ) : (
          <>
            <div className="card">
              <h3 style={{ marginTop: 0 }}>Umumiy statistika</h3>
              <p className="muted">Foydalanuvchilar: {s.usersCount}</p>
              <p className="muted">Sotuvchilar: {s.sellersCount}</p>
              <p className="muted">Mahsulotlar: {s.productsCount}</p>
              <p className="muted">Do‘konlar: {s.shopsCount}</p>
              <p className="muted">Buyurtmalar: {s.ordersCount}</p>
              <p className="price">Jami tushum: {s.revenueTotal.toLocaleString("uz-UZ")} so‘m</p>
              <p className="pill" style={{ marginTop: 10 }}>
                Tasdiqlanmagan do‘konlar: {s.pendingShopsCount}
              </p>
            </div>
          </>
        )}
      </div>
    </>
  );
}
