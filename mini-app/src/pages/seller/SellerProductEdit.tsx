import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../api/client";
import { TopBar } from "../../components/TopBar";

export function SellerProductEdit() {
  const { id } = useParams();
  const isNew = !id || id === "new";
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("0");
  const [isActive, setIsActive] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isNew || !id) return;
    void (async () => {
      const r = await api<{
        products: {
          id: number;
          name: string;
          description: string;
          price: number;
          category: string;
          stock: number;
          isActive: boolean;
        }[];
      }>("/api/seller/products");
      const p = r.products.find((x) => String(x.id) === id);
      if (!p) return;
      setName(p.name);
      setDescription(p.description);
      setPrice(String(p.price));
      setCategory(p.category);
      setStock(String(p.stock));
      setIsActive(p.isActive);
    })();
  }, [id, isNew]);

  async function save() {
    setMsg(null);
    try {
      if (isNew) {
        const r = await api<{ product: { id: number } }>("/api/seller/products", {
          method: "POST",
          json: {
            name,
            description,
            price: parseFloat(price),
            category,
            stock: parseInt(stock, 10),
          },
        });
        nav(`/s/products/${r.product.id}`);
        setMsg("Yaratildi.");
      } else {
        await api(`/api/seller/products/${id}`, {
          method: "PATCH",
          json: {
            name,
            description,
            price: parseFloat(price),
            category,
            stock: parseInt(stock, 10),
            isActive,
          },
        });
        setMsg("Saqlandi.");
      }
    } catch {
      setMsg("Xatolik.");
    }
  }

  async function uploadImage(file: File | null) {
    if (!file || isNew || !id) return;
    const fd = new FormData();
    fd.append("file", file);
    try {
      await api(`/api/seller/products/${id}/image`, { method: "POST", formData: fd });
      setMsg("Rasm yangilandi.");
    } catch {
      setMsg("Yuklash xatosi.");
    }
  }

  return (
    <>
      <TopBar title={isNew ? "Yangi mahsulot" : "Tahrirlash"} backTo="/s/products" />
      <div className="page">
        <div className="field">
          <label>Nomi</label>
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="field">
          <label>Tavsif</label>
          <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="field">
          <label>Narx (so‘m)</label>
          <input inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} />
        </div>
        <div className="field">
          <label>Kategoriya</label>
          <input value={category} onChange={(e) => setCategory(e.target.value)} />
        </div>
        <div className="field">
          <label>Ombor</label>
          <input inputMode="numeric" value={stock} onChange={(e) => setStock(e.target.value)} />
        </div>
        {!isNew ? (
          <label className="row" style={{ marginBottom: 14 }}>
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            <span>Faol</span>
          </label>
        ) : null}
        {!isNew ? (
          <div className="field">
            <label>Rasm yuklash</label>
            <input type="file" accept="image/*" onChange={(e) => void uploadImage(e.target.files?.[0] ?? null)} />
          </div>
        ) : null}
        <button type="button" className="btn btn-primary" onClick={() => void save()}>
          Saqlash
        </button>
        {msg ? <p className="muted" style={{ marginTop: 10 }}>{msg}</p> : null}
      </div>
    </>
  );
}
