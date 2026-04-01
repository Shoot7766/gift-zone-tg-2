import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import { TopBar } from "../../components/TopBar";

type Shop = {
  id: number;
  name: string;
  description: string;
  city: string;
  isFeatured: boolean;
  productCount: number;
};

export function CustomerShops() {
  const [q, setQ] = useState("");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const p = new URLSearchParams();
    if (q.trim()) p.set("q", q.trim());
    if (featuredOnly) p.set("featured", "1");
    const s = p.toString();
    void api<{ shops: Shop[] }>(`/api/public/shops${s ? `?${s}` : ""}`)
      .then((r) => setShops(r.shops))
      .finally(() => setLoading(false));
  }, [q, featuredOnly]);

  return (
    <>
      <TopBar title="Do‘konlar" />
      <div className="page">
        <div className="field">
          <label>Qidiruv</label>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Do‘kon nomi" />
        </div>
        <label className="row" style={{ marginBottom: 14, cursor: "pointer" }}>
          <input type="checkbox" checked={featuredOnly} onChange={(e) => setFeaturedOnly(e.target.checked)} />
          <span>Faqat VIP / featured</span>
        </label>
        {loading ? (
          <p className="muted">Yuklanmoqda…</p>
        ) : shops.length === 0 ? (
          <div className="empty">Do‘kon topilmadi</div>
        ) : (
          shops.map((s) => (
            <Link key={s.id} to={`/c/shops/${s.id}`} className="card" style={{ display: "block" }}>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <div>
                  <strong>{s.name}</strong>
                  {s.isFeatured ? <span className="pill" style={{ marginLeft: 8 }}>VIP</span> : null}
                  <div className="muted" style={{ marginTop: 4 }}>
                    {s.city || "Shahar ko‘rsatilmagan"} · {s.productCount} ta mahsulot
                  </div>
                </div>
              </div>
              <p className="muted" style={{ margin: "10px 0 0", fontSize: "0.88rem" }}>
                {s.description}
              </p>
            </Link>
          ))
        )}
      </div>
    </>
  );
}
