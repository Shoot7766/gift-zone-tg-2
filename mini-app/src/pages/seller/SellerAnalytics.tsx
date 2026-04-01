import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { TopBar } from "../../components/TopBar";

export function SellerAnalytics() {
  const [data, setData] = useState<{
    analytics: {
      viewsCount: number;
      clicksCount: number;
      ordersCount: number;
      revenue: number;
    } | null;
    subscriptionType: string;
  } | null>(null);

  useEffect(() => {
    void api<{
      analytics: { viewsCount: number; clicksCount: number; ordersCount: number; revenue: number } | null;
      subscriptionType: string;
    }>("/api/seller/analytics").then(setData);
  }, []);

  return (
    <>
      <TopBar title="Analitika" />
      <div className="page">
        {!data?.analytics ? (
          <div className="empty">Avval do‘kon yarating</div>
        ) : (
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Ko‘rsatkichlar</h3>
            <p className="muted">Ko‘rishlar: {data.analytics.viewsCount}</p>
            <p className="muted">Bosishlar: {data.analytics.clicksCount}</p>
            <p className="muted">Buyurtmalar: {data.analytics.ordersCount}</p>
            <p className="price">Tushum: {data.analytics.revenue.toLocaleString("uz-UZ")} so‘m</p>
          </div>
        )}
      </div>
    </>
  );
}
