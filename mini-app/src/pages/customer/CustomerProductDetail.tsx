import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../../api/client";
import { TopBar } from "../../components/TopBar";
import { cartCount, loadCart, saveCart } from "../../lib/cart";

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  stock: number;
  shop: {
    id: number;
    name: string;
    city: string;
    logoUrl: string | null;
    ownerUsername?: string | null;
  };
};

export function CustomerProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [fav, setFav] = useState(false);
  const [qty, setQty] = useState(1);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    void api<{ product: Product }>(`/api/public/products/${id}`).then((r) => setProduct(r.product));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    void api<{ favorites: { product: { id: number } }[] }>("/api/customer/favorites")
      .then((r) => setFav(r.favorites.some((f) => f.product.id === Number(id))))
      .catch(() => {});
  }, [id]);

  async function toggleFavorite() {
    if (!product) return;
    try {
      if (fav) {
        await api(`/api/customer/favorites/${product.id}`, { method: "DELETE" });
        setFav(false);
        setMsg("Saqlanganlardan olib tashlandi");
      } else {
        await api(`/api/customer/favorites/${product.id}`, { method: "POST" });
        setFav(true);
        setMsg("Saqlanganlarga qo‘shildi");
      }
    } catch {
      setMsg("Amaliyot bajarilmadi");
    }
    setTimeout(() => setMsg(null), 2000);
  }

  function addToCart() {
    if (!product) return;
    const lines = loadCart();
    const next = [...lines.filter((l) => l.productId !== product.id)];
    const q = Math.max(1, Math.min(qty, product.stock || 1));
    next.push({
      productId: product.id,
      quantity: q,
      name: product.name,
      price: product.price,
    });
    saveCart(next);
    setMsg(`Savatchada ${cartCount(next)} ta mahsulot`);
    setTimeout(() => setMsg(null), 2000);
  }

  if (!product) {
    return (
      <>
        <TopBar title="Mahsulot" backTo="/c/products" />
        <div className="page">
          <p className="muted">Yuklanmoqda…</p>
        </div>
      </>
    );
  }

  const owner = product.shop.ownerUsername;

  return (
    <>
      <TopBar title="Tafsilot" backTo="/c/products" />
      <div className="page">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt=""
            style={{ width: "100%", borderRadius: 14, border: "1px solid var(--border)" }}
          />
        ) : null}
        <div className="card" style={{ marginTop: 12 }}>
          <h2 style={{ margin: "0 0 8px" }}>{product.name}</h2>
          <div className="price" style={{ fontSize: "1.25rem" }}>
            {product.price.toLocaleString("uz-UZ")} so‘m
          </div>
          <p className="muted">{product.description}</p>
          <p className="muted">Ombor: {product.stock}</p>
          <Link to={`/c/shops/${product.shop.id}`} className="muted">
            Do‘kon: {product.shop.name} →
          </Link>
          {owner ? (
            <p className="muted" style={{ marginTop: 10 }}>
              Sotuvchi bilan bog‘lanish: @{owner}
            </p>
          ) : (
            <p className="muted" style={{ marginTop: 10 }}>
              Sotuvchi username Telegram’da ko‘rinmayapti.
            </p>
          )}
        </div>
        <div className="field">
          <label>Miqdor</label>
          <input
            type="number"
            min={1}
            max={product.stock}
            value={qty}
            onChange={(e) => setQty(parseInt(e.target.value, 10) || 1)}
          />
        </div>
        {msg ? <p className="pill" style={{ display: "inline-flex" }}>{msg}</p> : null}
        <div className="row" style={{ marginTop: 12, flexWrap: "wrap" }}>
          <button type="button" className="btn btn-primary" onClick={addToCart}>
            Savatchaga qo‘shish
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => void toggleFavorite()}>
            {fav ? "Saqlanganlardan olib tashlash" : "Saqlash"}
          </button>
        </div>
      </div>
    </>
  );
}
