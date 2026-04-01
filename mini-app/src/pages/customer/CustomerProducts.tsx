import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import { TopBar } from "../../components/TopBar";

type Product = {
  id: number;
  name: string;
  price: number;
  imageUrl: string | null;
  category: string;
  shop: { id: number; name: string; city: string };
};

export function CustomerProducts() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const qs = useMemo(() => {
    const p = new URLSearchParams();
    if (q.trim()) p.set("q", q.trim());
    if (category) p.set("category", category);
    if (min) p.set("min", min);
    if (max) p.set("max", max);
    const s = p.toString();
    return s ? `?${s}` : "";
  }, [q, category, min, max]);

  useEffect(() => {
    void api<{ categories: string[] }>("/api/public/categories").then((r) => setCategories(r.categories));
  }, []);

  useEffect(() => {
    setLoading(true);
    void api<{ products: Product[] }>(`/api/public/products${qs}`)
      .then((r) => setProducts(r.products))
      .finally(() => setLoading(false));
  }, [qs]);

  return (
    <>
      <TopBar title="Mahsulotlar" />
      <div className="page">
        <div className="field">
          <label>Qidiruv</label>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nom yoki tavsif" />
        </div>
        <div className="field">
          <label>Kategoriya</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Hammasi</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="grid2">
          <div className="field" style={{ marginBottom: 0 }}>
            <label>Min narx</label>
            <input inputMode="decimal" value={min} onChange={(e) => setMin(e.target.value)} />
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>Max narx</label>
            <input inputMode="decimal" value={max} onChange={(e) => setMax(e.target.value)} />
          </div>
        </div>
        {loading ? (
          <p className="muted">Yuklanmoqda…</p>
        ) : products.length === 0 ? (
          <div className="empty">Hech narsa topilmadi</div>
        ) : (
          products.map((p) => (
            <Link key={p.id} to={`/c/products/${p.id}`} className="card" style={{ display: "block" }}>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <div>
                  <strong>{p.name}</strong>
                  <div className="muted" style={{ marginTop: 4 }}>
                    {p.shop.name} · {p.shop.city || "Shahar yo‘q"}
                  </div>
                </div>
                <div className="price">{p.price.toLocaleString("uz-UZ")} so‘m</div>
              </div>
            </Link>
          ))
        )}
      </div>
    </>
  );
}
