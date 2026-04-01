import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../../api/client";
import { TopBar } from "../../components/TopBar";

type Shop = {
  id: number;
  name: string;
  description: string;
  city: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  ownerUsername: string | null;
  ownerFirstName: string | null;
  products: { id: number; name: string; price: number; imageUrl: string | null }[];
};

export function CustomerShopDetail() {
  const { id } = useParams();
  const [shop, setShop] = useState<Shop | null>(null);

  useEffect(() => {
    if (!id) return;
    void api<{ shop: Shop }>(`/api/public/shops/${id}`).then((r) => setShop(r.shop));
    void api(`/api/public/shops/${id}/view`, { method: "POST" }).catch(() => {});
  }, [id]);

  if (!shop) {
    return (
      <>
        <TopBar title="Do‘kon" backTo="/c/shops" />
        <div className="page">
          <p className="muted">Yuklanmoqda…</p>
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar title={shop.name} backTo="/c/shops" />
      <div className="page">
        {shop.bannerUrl ? (
          <img src={shop.bannerUrl} alt="" style={{ width: "100%", borderRadius: 14 }} />
        ) : null}
        <div className="card" style={{ marginTop: 12 }}>
          {shop.logoUrl ? (
            <img
              src={shop.logoUrl}
              alt=""
              style={{ width: 64, height: 64, borderRadius: 16, objectFit: "cover" }}
            />
          ) : null}
          <h2 style={{ margin: "10px 0 6px" }}>{shop.name}</h2>
          <p className="muted">{shop.city}</p>
          <p className="muted">{shop.description}</p>
          {shop.ownerUsername ? (
            <p className="muted">Aloqa: @{shop.ownerUsername}</p>
          ) : (
            <p className="muted">Aloqa: {shop.ownerFirstName ?? "—"}</p>
          )}
        </div>
        <h3 style={{ margin: "18px 0 10px" }}>Mahsulotlar</h3>
        {shop.products.length === 0 ? (
          <div className="empty">Hozircha mahsulot yo‘q</div>
        ) : (
          shop.products.map((p) => (
            <Link key={p.id} to={`/c/products/${p.id}`} className="card" style={{ display: "block" }}>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <strong>{p.name}</strong>
                <span className="price">{p.price.toLocaleString("uz-UZ")} so‘m</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </>
  );
}
