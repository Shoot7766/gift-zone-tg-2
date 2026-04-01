import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { TopBar } from "../../components/TopBar";

type Shop = {
  id: number;
  name: string;
  description: string;
  city: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  isApproved: boolean;
  subscriptionType: string;
  isFeatured: boolean;
};

export function SellerShop() {
  const [shop, setShop] = useState<Shop | null | undefined>(undefined);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    const r = await api<{ shop: Shop | null }>("/api/seller/shop");
    setShop(r.shop);
    if (r.shop) {
      setName(r.shop.name);
      setDescription(r.shop.description);
      setCity(r.shop.city);
    }
  }

  useEffect(() => {
    void load().catch(() => setShop(null));
  }, []);

  async function createOrSave() {
    setMsg(null);
    try {
      if (!shop) {
        await api("/api/seller/shop", { method: "POST", json: { name, description, city } });
        setMsg("Do‘kon yaratildi. Admin tasdig‘ini kuting.");
      } else {
        await api("/api/seller/shop", { method: "PATCH", json: { name, description, city } });
        setMsg("Saqlandi.");
      }
      await load();
    } catch {
      setMsg("Xatolik yuz berdi.");
    }
  }

  async function upload(kind: "logo" | "banner", file: File | null) {
    if (!file || !shop) return;
    const fd = new FormData();
    fd.append("file", file);
    setMsg(null);
    try {
      await api(`/api/seller/shop/${kind}`, { method: "POST", formData: fd });
      setMsg("Rasm yuklandi.");
      await load();
    } catch {
      setMsg("Yuklash muvaffaqiyatsiz.");
    }
  }

  if (shop === undefined) {
    return (
      <>
        <TopBar title="Do‘kon" />
        <div className="page">
          <p className="muted">Yuklanmoqda…</p>
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar title="Mening do‘konim" />
      <div className="page">
        {shop ? (
          <div className="card">
            <p className="muted">
              Holat: {shop.isApproved ? "Tasdiqlangan" : "Tasdiq kutilmoqda"}
            </p>
            <p className="muted">VIP / featured: {shop.isFeatured ? "Ha" : "Yo‘q"}</p>
          </div>
        ) : null}
        <div className="field">
          <label>Do‘kon nomi</label>
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="field">
          <label>Tavsif</label>
          <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="field">
          <label>Shahar</label>
          <input value={city} onChange={(e) => setCity(e.target.value)} />
        </div>
        <button type="button" className="btn btn-primary" onClick={() => void createOrSave()}>
          {shop ? "Saqlash" : "Do‘kon yaratish"}
        </button>
        {shop ? (
          <div className="card" style={{ marginTop: 14 }}>
            <div className="field">
              <label>Logo yuklash</label>
              <input type="file" accept="image/*" onChange={(e) => void upload("logo", e.target.files?.[0] ?? null)} />
            </div>
            <div className="field">
              <label>Banner yuklash</label>
              <input type="file" accept="image/*" onChange={(e) => void upload("banner", e.target.files?.[0] ?? null)} />
            </div>
            {shop.logoUrl ? <p className="muted">Logo: {shop.logoUrl}</p> : null}
            {shop.bannerUrl ? <p className="muted">Banner: {shop.bannerUrl}</p> : null}
          </div>
        ) : null}
        {msg ? <p className="muted" style={{ marginTop: 12 }}>{msg}</p> : null}
      </div>
    </>
  );
}
