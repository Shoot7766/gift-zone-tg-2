export type CartLine = {
  productId: number;
  quantity: number;
  name: string;
  price: number;
};

const KEY = "giftzone_cart_v1";

export function loadCart(): CartLine[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const v = JSON.parse(raw) as CartLine[];
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export function saveCart(lines: CartLine[]) {
  localStorage.setItem(KEY, JSON.stringify(lines));
}

export function cartCount(lines: CartLine[]) {
  return lines.reduce((a, b) => a + b.quantity, 0);
}
