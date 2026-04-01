import { Link } from "react-router-dom";
import { TopBar } from "../../components/TopBar";

export function CustomerHome() {
  return (
    <>
      <TopBar title="Gift Zone" />
      <div className="page">
        <div className="card">
          <div className="pill">Mijoz paneli</div>
          <h2 style={{ margin: "12px 0 6px" }}>Xush kelibsiz</h2>
          <p className="muted" style={{ margin: 0 }}>
            Mahsulotlarni ko‘ring, do‘konlarni kashf eting va buyurtma bering.
          </p>
        </div>
        <div className="grid2" style={{ marginTop: 14 }}>
          <Link to="/c/products" className="card" style={{ display: "block" }}>
            <strong>Mahsulotlar</strong>
            <p className="muted" style={{ margin: "8px 0 0", fontSize: "0.85rem" }}>
              Katalog va filtrlar
            </p>
          </Link>
          <Link to="/c/shops" className="card" style={{ display: "block" }}>
            <strong>Do‘konlar</strong>
            <p className="muted" style={{ margin: "8px 0 0", fontSize: "0.85rem" }}>
              Ishonchli sotuvchilar
            </p>
          </Link>
          <Link to="/c/favorites" className="card" style={{ display: "block" }}>
            <strong>Saqlanganlar</strong>
            <p className="muted" style={{ margin: "8px 0 0", fontSize: "0.85rem" }}>
              Sevimlilar ro‘yxati
            </p>
          </Link>
          <Link to="/c/orders" className="card" style={{ display: "block" }}>
            <strong>Buyurtmalar</strong>
            <p className="muted" style={{ margin: "8px 0 0", fontSize: "0.85rem" }}>
              Tarix va holat
            </p>
          </Link>
        </div>
      </div>
    </>
  );
}
