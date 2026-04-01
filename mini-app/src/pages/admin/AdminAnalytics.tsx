import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { TopBar } from "../../components/TopBar";

export function AdminAnalytics() {
  const [a, setA] = useState<{
    viewsTotal: number;
    clicksTotal: number;
    ordersTotal: number;
    revenueTotal: number;
  } | null>(null);

  useEffect(() => {
    void api<{
      viewsTotal: number;
      clicksTotal: number;
      ordersTotal: number;
      revenueTotal: number;
    }>("/api/admin/analytics/overview").then(setA);
  }, []);

  return (
    <>
      <TopBar title="Platforma analitikasi" />
      <div className="page">
        {!a ? (
          <p className="muted">Yuklanmoqda…</p>
        ) : (
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Jamlanma</h3>
            <p className="muted">Ko‘rishlar: {a.viewsTotal}</p>
            <p className="muted">Bosishlar: {a.clicksTotal}</p>
            <p className="muted">Buyurtmalar (analitika): {a.ordersTotal}</p>
            <p className="price">Tushum (analitika): {a.revenueTotal.toLocaleString("uz-UZ")} so‘m</p>
          </div>
        )}
      </div>
    </>
  );
}
