import { Link } from "react-router-dom";
import { TopBar } from "../../components/TopBar";

export function SellerHome() {
  return (
    <>
      <TopBar title="Sotuvchi" />
      <div className="page">
        <div className="card">
          <div className="pill">Sotuvchi paneli</div>
          <h2 style={{ margin: "12px 0 6px" }}>Boshqaruv</h2>
          <p className="muted" style={{ margin: 0 }}>
            Do‘koningiz, mahsulotlar va buyurtmalar shu yerda.
          </p>
        </div>
        <div className="grid2" style={{ marginTop: 14 }}>
          <Link to="/s/shop" className="card" style={{ display: "block" }}>
            <strong>Mening do‘konim</strong>
          </Link>
          <Link to="/s/products" className="card" style={{ display: "block" }}>
            <strong>Mahsulotlar</strong>
          </Link>
          <Link to="/s/orders" className="card" style={{ display: "block" }}>
            <strong>Buyurtmalar</strong>
          </Link>
          <Link to="/s/analytics" className="card" style={{ display: "block" }}>
            <strong>Analitika</strong>
          </Link>
          <Link to="/s/subscription" className="card" style={{ display: "block" }}>
            <strong>Obuna</strong>
          </Link>
        </div>
      </div>
    </>
  );
}
