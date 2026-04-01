import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import { TopBar } from "../../components/TopBar";

type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
  isActive: boolean;
};

export function SellerProducts() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    void api<{ products: Product[] }>("/api/seller/products").then((r) => setProducts(r.products));
  }, []);

  return (
    <>
      <TopBar title="Mahsulotlar" />
      <div className="page">
        <Link to="/s/products/new" className="btn btn-primary" style={{ display: "inline-block", marginBottom: 14 }}>
          Mahsulot qo‘shish
        </Link>
        {products.length === 0 ? (
          <div className="empty">Mahsulotlar yo‘q</div>
        ) : (
          products.map((p) => (
            <Link key={p.id} to={`/s/products/${p.id}`} className="card" style={{ display: "block" }}>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <strong>{p.name}</strong>
                <span className="pill">{p.isActive ? "Faol" : "O‘chirilgan"}</span>
              </div>
              <p className="muted">
                Narx: {p.price.toLocaleString("uz-UZ")} so‘m · Ombor: {p.stock}
              </p>
            </Link>
          ))
        )}
      </div>
    </>
  );
}
