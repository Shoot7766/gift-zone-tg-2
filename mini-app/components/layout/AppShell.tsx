"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
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
    <div className="flex min-h-screen flex-col pb-[calc(72px+env(safe-area-inset-bottom))]">
      <TelegramBar />
      <main className="flex-1 px-3 pt-2">{children}</main>
      {!hideNav ? (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gz-border bg-gz-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg">
          <div className="flex overflow-x-auto scrollbar-hide">
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
                    "flex min-w-[68px] flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-semibold",
                    active ? "text-gz-accent" : "text-gz-muted"
                  )}
                >
                  <span className="text-lg">{n.emoji}</span>
                  <span className="leading-tight text-center">{n.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      ) : null}
    </div>
  );
}
