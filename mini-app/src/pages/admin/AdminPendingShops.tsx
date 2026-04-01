import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { TopBar } from "../../components/TopBar";

type Shop = {
  id: number;
  name: string;
  description: string;
  city: string;
  owner: { username: string | null; phoneNumber: string | null };
};

export function AdminPendingShops() {
  const [shops, setShops] = useState<Shop[]>([]);

  async function load() {
    const r = await api<{ shops: Shop[] }>("/api/admin/shops/pending");
    setShops(r.shops);
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <>
      <TopBar title="Tasdiq" />
      <div className="page">
        {shops.length === 0 ? (
          <div className="empty">Navbatda do‘kon yo‘q</div>
        ) : (
          shops.map((s) => (
            <div key={s.id} className="card">
              <strong>{s.name}</strong>
              <p className="muted">{s.city}</p>
              <p className="muted">{s.description}</p>
              <p className="muted">Egasi: @{s.owner.username ?? "—"}</p>
              <div className="row" style={{ marginTop: 10, flexWrap: "wrap", gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={async () => {
                    await api(`/api/admin/shops/${s.id}/approve`, { method: "POST", json: {} });
                    void load();
                  }}
                >
                  Tasdiqlash
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={async () => {
                    await api(`/api/admin/shops/${s.id}/reject`, { method: "POST", json: {} });
                    void load();
                  }}
                >
                  Rad etish
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={async () => {
                    await api(`/api/admin/shops/${s.id}/featured`, {
                      method: "POST",
                      json: { featured: true },
                    });
                    void load();
                  }}
                >
                  VIP / featured
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={async () => {
                    await api(`/api/admin/shops/${s.id}/subscription`, {
                      method: "POST",
                      json: { type: "vip" },
                    });
                    void load();
                  }}
                >
                  VIP obuna
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
