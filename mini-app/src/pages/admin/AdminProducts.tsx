import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { TopBar } from "../../components/TopBar";

type Product = {
  id: number;
  name: string;
  price: number;
  isActive: boolean;
  shop: { name: string };
};

export function AdminProducts() {
  const [q, setQ] = useState("");
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const p = q.trim() ? `?q=${encodeURIComponent(q.trim())}` : "";
    void api<{ products: Product[] }>(`/api/admin/products${p}`).then((r) => setProducts(r.products));
  }, [q]);

  return (
    <>
      <TopBar title="Mahsulotlar" />
      <div className="page">
        <div className="field">
          <label>Qidiruv</label>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nom bo‘yicha" />
        </div>
        {products.map((p) => (
          <div key={p.id} className="card">
            <div className="row" style={{ justifyContent: "space-between" }}>
              <strong>{p.name}</strong>
              <span className="pill">{p.isActive ? "Faol" : "O‘chirilgan"}</span>
            </div>
            <p className="muted">{p.shop.name}</p>
            <p className="muted">{p.price.toLocaleString("uz-UZ")} so‘m</p>
            <button
              type="button"
              className="btn btn-ghost"
              style={{ marginTop: 8 }}
              onClick={async () => {
                await api(`/api/admin/products/${p.id}`, {
                  method: "PATCH",
                  json: { isActive: !p.isActive },
                });
                const r = q.trim()
                  ? await api<{ products: Product[] }>(`/api/admin/products?q=${encodeURIComponent(q.trim())}`)
                  : await api<{ products: Product[] }>("/api/admin/products");
                setProducts(r.products);
              }}
            >
              {p.isActive ? "O‘chirish (nazorat)" : "Qayta yoqish"}
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
