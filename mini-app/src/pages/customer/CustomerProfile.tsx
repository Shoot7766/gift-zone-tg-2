import { Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { TopBar } from "../../components/TopBar";
import { cartCount, loadCart } from "../../lib/cart";

export function CustomerProfile() {
  const { state } = useAuth();
  if (state.status !== "ready") return null;
  const u = state.user;
  const n = cartCount(loadCart());

  return (
    <>
      <TopBar title="Profil" />
      <div className="page">
        <div className="card">
          <h2 style={{ marginTop: 0 }}>
            {u.firstName} {u.lastName ?? ""}
          </h2>
          <p className="muted">@{u.username ?? "username yo‘q"}</p>
          <p className="muted">Telefon: {u.phoneNumber}</p>
          <p className="pill">Rol: mijoz</p>
        </div>
        <Link to="/c/orders" className="card" style={{ display: "block", marginTop: 12 }}>
          <strong>Buyurtmalar tarixi</strong>
          <p className="muted" style={{ margin: "6px 0 0" }}>
            Barcha buyurtmalaringiz
          </p>
        </Link>
        <Link to="/c/favorites" className="card" style={{ display: "block", marginTop: 12 }}>
          <strong>Saqlanganlar</strong>
        </Link>
        <div className="card" style={{ marginTop: 12 }}>
          <strong>Savatcha</strong>
          <p className="muted" style={{ margin: "6px 0 0" }}>
            {n} ta pozitsiya
          </p>
          <Link to="/c/cart" className="btn btn-ghost" style={{ display: "inline-block", marginTop: 10 }}>
            Savatchaga o‘tish
          </Link>
        </div>
      </div>
    </>
  );
}
