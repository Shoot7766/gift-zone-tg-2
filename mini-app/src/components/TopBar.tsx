import { Link } from "react-router-dom";

export function TopBar({ title, backTo }: { title: string; backTo?: string }) {
  return (
    <header className="topbar">
      <div className="row" style={{ gap: 12 }}>
        {backTo ? (
          <Link to={backTo} className="muted" style={{ fontSize: "0.9rem" }}>
            ← Orqaga
          </Link>
        ) : (
          <span />
        )}
      </div>
      <h1>{title}</h1>
      <span style={{ width: 56 }} />
    </header>
  );
}
