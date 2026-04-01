import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import { TopBar } from "../../components/TopBar";

type Order = {
  id: number;
  quantity: number;
  totalPrice: number;
  status: string;
  createdAt: string;
  product: { id: number; name: string; shop: { name: string } };
};

const statusUz: Record<string, string> = {
  pending: "Kutilmoqda",
  confirmed: "Tasdiqlandi",
  shipped: "Yo‘lda",
  completed: "Yakunlandi",
  cancelled: "Bekor qilindi",
};

export function CustomerOrders() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    void api<{ orders: Order[] }>("/api/customer/orders").then((r) => setOrders(r.orders));
  }, []);

  return (
    <>
      <TopBar title="Buyurtmalar" backTo="/c/profile" />
      <div className="page">
        {orders.length === 0 ? (
          <div className="empty">Hozircha buyurtma yo‘q</div>
        ) : (
          orders.map((o) => (
            <div key={o.id} className="card">
              <div className="row" style={{ justifyContent: "space-between" }}>
                <Link to={`/c/products/${o.product.id}`}>
                  <strong>{o.product.name}</strong>
                </Link>
                <span className="pill">{statusUz[o.status] ?? o.status}</span>
              </div>
              <p className="muted">{o.product.shop.name}</p>
              <p className="muted">
                Miqdor: {o.quantity} · Jami: {o.totalPrice.toLocaleString("uz-UZ")} so‘m
              </p>
              <p className="muted" style={{ fontSize: "0.8rem" }}>
                {new Date(o.createdAt).toLocaleString("uz-UZ")}
              </p>
            </div>
          ))
        )}
      </div>
    </>
  );
}
