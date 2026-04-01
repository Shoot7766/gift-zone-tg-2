"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { useUserRole } from "@/hooks/useUserRole";
import { useTelegramUserId } from "@/hooks/useTelegramUser";
import { getTelegramWebApp } from "@/lib/telegram";

export default function ProfilePageClient() {
  const tgId = useTelegramUserId();
  const roleQ = useUserRole();
  const [names, setNames] = useState<{ line: string; username?: string }>({
    line: "",
  });

  useEffect(() => {
    const u = getTelegramWebApp()?.initDataUnsafe?.user;
    if (!u) return;
    const line = [u.first_name, u.last_name].filter(Boolean).join(" ");
    setNames({ line, username: u.username });
  }, []);

  const role = roleQ.data ?? "customer";
  const roleUz =
    role === "admin" ? "Admin" : role === "seller" ? "Sotuvchi" : "Mijoz";

  return (
    <div className="space-y-5 pb-8">
      <h1 className="text-xl font-black text-white">Profil</h1>
      <div className="rounded-3xl border border-gz-border bg-gradient-to-br from-gz-surface to-gz-elevated p-5 shadow-card">
        <p className="text-sm text-gz-muted">Telegram ID</p>
        <p className="text-lg font-bold text-white">{tgId ?? "—"}</p>
        <p className="mt-3 text-sm text-gz-muted">Ism</p>
        <p className="font-semibold text-white">{names.line || "—"}</p>
        {names.username ? (
          <p className="mt-1 text-sm text-gz-accent2">@{names.username}</p>
        ) : null}
        <div className="mt-4">
          <Badge variant="trust">Rol: {roleUz}</Badge>
        </div>
      </div>

      <div className="space-y-2">
        <Link
          href="/favorites"
          className="block rounded-2xl border border-gz-border bg-gz-surface px-4 py-3 text-sm font-semibold"
        >
          ⭐ Saqlangan mahsulotlar
        </Link>
        <Link
          href="/cart"
          className="block rounded-2xl border border-gz-border bg-gz-surface px-4 py-3 text-sm font-semibold"
        >
          🧺 Savatcha
        </Link>
      </div>

      {(role === "seller" || role === "admin") && (
        <div className="space-y-2 rounded-3xl border border-emerald-500/20 bg-emerald-950/20 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-gz-accent">
            Sotuvchi zonasi
          </p>
          <Link
            href="/seller"
            className="block rounded-2xl bg-gz-elevated px-4 py-3 text-sm font-semibold"
          >
            🏪 Sotuvchi paneli
          </Link>
        </div>
      )}

      {role === "admin" && (
        <div className="space-y-2 rounded-3xl border border-sky-500/20 bg-sky-950/20 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-sky-300">
            Admin
          </p>
          <Link
            href="/admin"
            className="block rounded-2xl bg-gz-elevated px-4 py-3 text-sm font-semibold"
          >
            🛠 Admin paneli
          </Link>
        </div>
      )}
    </div>
  );
}
