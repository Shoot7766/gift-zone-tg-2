import { Navigate, NavLink, Outlet, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";
import { CustomerHome } from "./pages/customer/CustomerHome";
import { CustomerProducts } from "./pages/customer/CustomerProducts";
import { CustomerProductDetail } from "./pages/customer/CustomerProductDetail";
import { CustomerShops } from "./pages/customer/CustomerShops";
import { CustomerShopDetail } from "./pages/customer/CustomerShopDetail";
import { CustomerFavorites } from "./pages/customer/CustomerFavorites";
import { CustomerCart } from "./pages/customer/CustomerCart";
import { CustomerProfile } from "./pages/customer/CustomerProfile";
import { CustomerOrders } from "./pages/customer/CustomerOrders";
import { SellerHome } from "./pages/seller/SellerHome";
import { SellerShop } from "./pages/seller/SellerShop";
import { SellerProducts } from "./pages/seller/SellerProducts";
import { SellerProductEdit } from "./pages/seller/SellerProductEdit";
import { SellerOrders } from "./pages/seller/SellerOrders";
import { SellerAnalytics } from "./pages/seller/SellerAnalytics";
import { SellerSubscription } from "./pages/seller/SellerSubscription";
import { SellerProfile } from "./pages/seller/SellerProfile";
import { AdminHome } from "./pages/admin/AdminHome";
import { AdminPendingShops } from "./pages/admin/AdminPendingShops";
import { AdminProducts } from "./pages/admin/AdminProducts";
import { AdminAnalytics } from "./pages/admin/AdminAnalytics";
import { AdminProfile } from "./pages/admin/AdminProfile";

function GateScreen({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="page" style={{ display: "grid", placeItems: "center", minHeight: "70vh" }}>
      <div className="card" style={{ maxWidth: 420, textAlign: "center" }}>
        <h2 style={{ marginTop: 0 }}>{title}</h2>
        <p className="muted">{detail}</p>
      </div>
    </div>
  );
}

function CustomerLayout() {
  return (
    <div className="app-shell">
      <Outlet />
      <nav className="nav">
        <NavLink to="/c" end className={({ isActive }) => (isActive ? "active" : "")}>
          Bosh sahifa
        </NavLink>
        <NavLink to="/c/products" className={({ isActive }) => (isActive ? "active" : "")}>
          Mahsulotlar
        </NavLink>
        <NavLink to="/c/shops" className={({ isActive }) => (isActive ? "active" : "")}>
          Do‘konlar
        </NavLink>
        <NavLink to="/c/cart" className={({ isActive }) => (isActive ? "active" : "")}>
          Savatcha
        </NavLink>
        <NavLink to="/c/profile" className={({ isActive }) => (isActive ? "active" : "")}>
          Profil
        </NavLink>
      </nav>
    </div>
  );
}

function SellerLayout() {
  return (
    <div className="app-shell">
      <Outlet />
      <nav className="nav">
        <NavLink to="/s" end className={({ isActive }) => (isActive ? "active" : "")}>
          Boshqaruv
        </NavLink>
        <NavLink to="/s/shop" className={({ isActive }) => (isActive ? "active" : "")}>
          Do‘kon
        </NavLink>
        <NavLink to="/s/products" className={({ isActive }) => (isActive ? "active" : "")}>
          Mahsulotlar
        </NavLink>
        <NavLink to="/s/orders" className={({ isActive }) => (isActive ? "active" : "")}>
          Buyurtmalar
        </NavLink>
        <NavLink to="/s/profile" className={({ isActive }) => (isActive ? "active" : "")}>
          Profil
        </NavLink>
      </nav>
    </div>
  );
}

function AdminLayout() {
  return (
    <div className="app-shell">
      <Outlet />
      <nav className="nav">
        <NavLink to="/a" end className={({ isActive }) => (isActive ? "active" : "")}>
          Statistika
        </NavLink>
        <NavLink to="/a/pending" className={({ isActive }) => (isActive ? "active" : "")}>
          Tasdiq
        </NavLink>
        <NavLink to="/a/products" className={({ isActive }) => (isActive ? "active" : "")}>
          Mahsulotlar
        </NavLink>
        <NavLink to="/a/analytics" className={({ isActive }) => (isActive ? "active" : "")}>
          Analitika
        </NavLink>
        <NavLink to="/a/profile" className={({ isActive }) => (isActive ? "active" : "")}>
          Profil
        </NavLink>
      </nav>
    </div>
  );
}

export default function App() {
  const { state } = useAuth();

  if (state.status === "loading") {
    return <GateScreen title="Yuklanmoqda…" detail="Iltimos, biroz kuting." />;
  }
  if (state.status === "need_bot") {
    return <GateScreen title="Telegram kerak" detail={state.message} />;
  }
  if (state.status === "incomplete") {
    return (
      <GateScreen
        title="Ro‘yxatdan o‘tish tugallanmagan"
        detail="Botda telefon va rolni yakunlang, keyin mini ilovani qayta oching."
      />
    );
  }
  if (state.status === "error") {
    return <GateScreen title="Xatolik" detail={state.message} />;
  }

  const role = state.user.role;
  const devBanner =
    state.devPreview === true ? (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          background: "rgba(255, 193, 7, 0.95)",
          color: "#111",
          padding: "8px 12px",
          textAlign: "center",
          fontSize: 12,
          fontWeight: 600,
        }}
      >
        Lokal sinov rejimi (brauzer). Haqiqiy foydalanish: Telegram → bot → «Gift Zone'ni ochish».
      </div>
    ) : null;

  return (
    <>
      {devBanner}
      <Routes>
      {role === "customer" && (
        <>
          <Route path="/" element={<Navigate to="/c" replace />} />
          <Route element={<CustomerLayout />}>
            <Route path="/c" element={<CustomerHome />} />
            <Route path="/c/products" element={<CustomerProducts />} />
            <Route path="/c/products/:id" element={<CustomerProductDetail />} />
            <Route path="/c/shops" element={<CustomerShops />} />
            <Route path="/c/shops/:id" element={<CustomerShopDetail />} />
            <Route path="/c/favorites" element={<CustomerFavorites />} />
            <Route path="/c/cart" element={<CustomerCart />} />
            <Route path="/c/orders" element={<CustomerOrders />} />
            <Route path="/c/profile" element={<CustomerProfile />} />
          </Route>
        </>
      )}
      {role === "seller" && (
        <>
          <Route path="/" element={<Navigate to="/s" replace />} />
          <Route element={<SellerLayout />}>
            <Route path="/s" element={<SellerHome />} />
            <Route path="/s/shop" element={<SellerShop />} />
            <Route path="/s/products" element={<SellerProducts />} />
            <Route path="/s/products/new" element={<SellerProductEdit />} />
            <Route path="/s/products/:id" element={<SellerProductEdit />} />
            <Route path="/s/orders" element={<SellerOrders />} />
            <Route path="/s/analytics" element={<SellerAnalytics />} />
            <Route path="/s/subscription" element={<SellerSubscription />} />
            <Route path="/s/profile" element={<SellerProfile />} />
          </Route>
        </>
      )}
      {role === "admin" && (
        <>
          <Route path="/" element={<Navigate to="/a" replace />} />
          <Route element={<AdminLayout />}>
            <Route path="/a" element={<AdminHome />} />
            <Route path="/a/pending" element={<AdminPendingShops />} />
            <Route path="/a/products" element={<AdminProducts />} />
            <Route path="/a/analytics" element={<AdminAnalytics />} />
            <Route path="/a/profile" element={<AdminProfile />} />
          </Route>
        </>
      )}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  );
}
