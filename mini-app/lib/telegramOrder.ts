import type { CartLine } from "@/hooks/useCart";
import { formatPriceUZS } from "@/lib/format";
import { getTelegramWebApp } from "@/lib/telegram";

export function buildOrderMessage(lines: CartLine[], total: number): string {
  let s = "🎁 Gift Zone — buyurtma so‘rovi\n\n";
  for (const l of lines) {
    s += `• ${l.name}\n  ${l.qty} × ${formatPriceUZS(l.price)} = ${formatPriceUZS(l.price * l.qty)}\n`;
    if (l.shopName) s += `  Do‘kon: ${l.shopName}\n`;
  }
  s += `\n📌 Jami: ${formatPriceUZS(total)}`;
  return s;
}

/** Birinchi sotuvchiga yozish; username bo‘lmasa — ulashish oynasi */
export function openTelegramWithOrder(lines: CartLine[], total: number): void {
  const text = buildOrderMessage(lines, total);
  const first = lines.find((l) => l.sellerUsername);
  const tw = getTelegramWebApp();

  if (first?.sellerUsername) {
    const u = first.sellerUsername.replace(/^@/, "");
    const url = `https://t.me/${u}?text=${encodeURIComponent(text)}`;
    if (tw?.openTelegramLink) tw.openTelegramLink(url);
    else window.open(url, "_blank");
    return;
  }

  const shareUrl = `https://t.me/share/url?url=${encodeURIComponent("https://t.me")}&text=${encodeURIComponent(text)}`;
  if (tw?.openTelegramLink) tw.openTelegramLink(shareUrl);
  else window.open(shareUrl, "_blank");
}
