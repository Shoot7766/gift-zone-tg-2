"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { DataStatusBanner } from "./DataStatusBanner";
import { TelegramBar } from "./TelegramBar";

const nav = [
  { href: "/", label: "Bosh sahifa", emoji: "🏠" },
  { href: "/products", label: "Mahsulotlar", emoji: "🛍" },
  { href: "/shops", label: "Do‘konlar", emoji: "🏪" },
  { href: "/favorites", label: "Saqlangan", emoji: "⭐" },
  { href: "/cart", label: "Savatcha", emoji: "🧺" },
  { href: "/profile", label: "Profil", emoji: "👤" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const hideNav = path?.startsWith("/ai");

  return (
    <div className="flex min-h-screen flex-col pb-[calc(76px+env(safe-area-inset-bottom))]">
      <TelegramBar />
      <main className="flex-1 px-3 pt-2">
        <DataStatusBanner />
        {children}
      </main>
      {!hideNav ? (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/[0.06] bg-gz-bg/92 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
          <div className="flex overflow-x-auto px-1 pt-1 scrollbar-hide">
            {nav.map((n) => {
              const active =
                n.href === "/"
                  ? path === "/"
                  : path === n.href || path?.startsWith(`${n.href}/`);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={cn(
                    "flex min-w-[68px] flex-1 flex-col items-center gap-0.5 rounded-xl py-2 text-[10px] font-semibold transition",
                    active
                      ? "bg-emerald-500/12 text-gz-accent shadow-[inset_0_0_0_1px_rgba(52,211,153,0.25)]"
                      : "text-gz-muted hover:text-white/90"
                  )}
                >
                  <span className="text-[1.15rem] leading-none">{n.emoji}</span>
                  <span className="max-w-[4.5rem] text-center leading-tight">{n.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      ) : null}
    </div>
  );
}
