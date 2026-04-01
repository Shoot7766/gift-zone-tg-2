import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { TopBar } from "../../components/TopBar";

type Order = {
  id: number;
  status: string;
  quantity: number;
  totalPrice: number;
  createdAt: string;
  product: { id: number; name: string };
  customer: { firstName: string | null; username: string | null; phoneNumber: string | null };
};

const statuses = ["pending", "confirmed", "shipped", "completed", "cancelled"] as const;
const labels: Record<string, string> = {
  pending: "Kutilmoqda",
  confirmed: "Tasdiqlandi",
  shipped: "Yo‘lda",
  completed: "Yakunlandi",
  cancelled: "Bekor",
};

export function SellerOrders() {
  const [orders, setOrders] = useState<Order[]>([]);

  async function load() {
    const r = await api<{ orders: Order[] }>("/api/seller/orders");
    setOrders(r.orders);
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <>
      <TopBar title="Buyurtmalar" />
      <div className="page">
        {orders.length === 0 ? (
          <div className="empty">Buyurtmalar yo‘q</div>
        ) : (
          orders.map((o) => (
            <div key={o.id} className="card">
              <strong>{o.product.name}</strong>
              <p className="muted">
                Mijoz: {o.customer.firstName ?? o.customer.username ?? o.customer.phoneNumber}
              </p>
              <p className="muted">
                {o.quantity} ta · {o.totalPrice.toLocaleString("uz-UZ")} so‘m
              </p>
              <div className="field" style={{ marginTop: 10 }}>
                <label>Holat</label>
                <select
                  value={o.status}
                  onChange={async (e) => {
                    await api(`/api/seller/orders/${o.id}/status`, {
                      method: "PATCH",
                      json: { status: e.target.value },
                    });
                    void load();
                  }}
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {labels[s]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
