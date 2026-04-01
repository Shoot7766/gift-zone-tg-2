import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import { TopBar } from "../../components/TopBar";

type Fav = {
  id: number;
  product: {
    id: number;
    name: string;
    price: number;
    shop: { name: string };
  };
};

export function CustomerFavorites() {
  const [rows, setRows] = useState<Fav[]>([]);

  async function load() {
    const r = await api<{ favorites: Fav[] }>("/api/customer/favorites");
    setRows(r.favorites);
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <>
      <TopBar title="Saqlanganlar" backTo="/c" />
      <div className="page">
        {rows.length === 0 ? (
          <div className="empty">Hali sevimlilar yo‘q</div>
        ) : (
          rows.map((f) => (
            <div key={f.id} className="card">
              <Link to={`/c/products/${f.product.id}`}>
                <strong>{f.product.name}</strong>
              </Link>
              <div className="muted">{f.product.shop.name}</div>
              <div className="price">{f.product.price.toLocaleString("uz-UZ")} so‘m</div>
              <button
                type="button"
                className="btn btn-ghost"
                style={{ marginTop: 10 }}
                onClick={async () => {
                  await api(`/api/customer/favorites/${f.product.id}`, { method: "DELETE" });
                  void load();
                }}
              >
                Olib tashlash
              </button>
            </div>
          ))
        )}
      </div>
    </>
  );
}
