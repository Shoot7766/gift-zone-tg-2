import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import { TopBar } from "../../components/TopBar";
import { loadCart, saveCart, type CartLine } from "../../lib/cart";

export function CustomerCart() {
  const [, bump] = useState(0);
  const lines = loadCart();

  const total = useMemo(
    () => lines.reduce((a, b) => a + b.price * b.quantity, 0),
    [lines]
  );

  function setLines(next: CartLine[]) {
    saveCart(next);
    bump((x) => x + 1);
  }

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function checkout() {
    if (lines.length === 0) return;
    setBusy(true);
    setMsg(null);
    try {
      await api("/api/customer/orders/checkout", {
        method: "POST",
        json: { items: lines.map((l) => ({ productId: l.productId, quantity: l.quantity })) },
      });
      saveCart([]);
      bump((x) => x + 1);
      setMsg("Buyurtma qabul qilindi!");
    } catch {
      setMsg("Buyurtma yuborilmadi. Ombor yoki tarmoqni tekshiring.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <TopBar title="Savatcha" />
      <div className="page">
        {lines.length === 0 ? (
          <div className="empty">Savatcha bo‘sh</div>
        ) : (
          lines.map((l) => (
            <div key={l.productId} className="card">
              <div className="row" style={{ justifyContent: "space-between" }}>
                <div>
                  <Link to={`/c/products/${l.productId}`}>
                    <strong>{l.name}</strong>
                  </Link>
                  <div className="muted">{l.price.toLocaleString("uz-UZ")} so‘m × {l.quantity}</div>
                </div>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setLines(lines.filter((x) => x.productId !== l.productId))}
                >
                  O‘chirish
                </button>
              </div>
              <div className="field" style={{ marginTop: 10, marginBottom: 0 }}>
                <label>Miqdor</label>
                <input
                  type="number"
                  min={1}
                  value={l.quantity}
                  onChange={(e) => {
                    const q = Math.max(1, parseInt(e.target.value, 10) || 1);
                    setLines(
                      lines.map((x) => (x.productId === l.productId ? { ...x, quantity: q } : x))
                    );
                  }}
                />
              </div>
            </div>
          ))
        )}
        {lines.length > 0 ? (
          <div className="card" style={{ marginTop: 12 }}>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <strong>Jami</strong>
              <span className="price">{total.toLocaleString("uz-UZ")} so‘m</span>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              style={{ width: "100%", marginTop: 12 }}
              disabled={busy}
              onClick={() => void checkout()}
            >
              {busy ? "Yuborilmoqda…" : "Buyurtma berish"}
            </button>
            {msg ? <p className="muted" style={{ marginTop: 10 }}>{msg}</p> : null}
          </div>
        ) : null}
      </div>
    </>
  );
}
