import { useAuth } from "../../auth/AuthContext";
import { TopBar } from "../../components/TopBar";

export function AdminProfile() {
  const { state } = useAuth();
  if (state.status !== "ready") return null;
  const u = state.user;

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
          <p className="pill">Rol: admin</p>
        </div>
      </div>
    </>
  );
}
