"use client";

import { useCallback, useSyncExternalStore } from "react";

export type CartLine = {
  productId: string;
  name: string;
  price: number;
  qty: number;
  /** Sotuvchiga to‘g‘ridan-to‘g‘ri buyurtma matni yuborish uchun */
  sellerUsername?: string | null;
  shopName?: string | null;
};

const KEY = "gz_cart_v2";

function read(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "[]") as unknown;
    if (!Array.isArray(raw)) return [];
    return raw.map((x) => {
      const o = x as Record<string, unknown>;
      return {
        productId: String(o.productId ?? ""),
        name: String(o.name ?? ""),
        price: Number(o.price) || 0,
        qty: Math.max(1, Math.floor(Number(o.qty) || 1)),
        sellerUsername: (o.sellerUsername as string) ?? null,
        shopName: (o.shopName as string) ?? null,
      };
    });
  } catch {
    return [];
  }
}

function write(lines: CartLine[]) {
  localStorage.setItem(KEY, JSON.stringify(lines));
}

let listeners: Array<() => void> = [];

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.push(cb);
  return () => {
    listeners = listeners.filter((x) => x !== cb);
  };
}

export function useCart() {
  const lines = useSyncExternalStore(subscribe, read, () => []);

  const setLines = useCallback((next: CartLine[]) => {
    write(next);
    emit();
  }, []);

  const add = useCallback(
    (line: Omit<CartLine, "qty"> & { qty?: number }) => {
      const cur = read();
      const qty = line.qty ?? 1;
      const i = cur.findIndex((x) => x.productId === line.productId);
      let next: CartLine[];
      if (i >= 0) {
        next = cur.map((x, j) =>
          j === i ? { ...x, qty: x.qty + qty } : x
        );
      } else {
        next = [...cur, { ...line, qty }];
      }
      write(next);
      emit();
    },
    []
  );

  const remove = useCallback((productId: string) => {
    write(read().filter((x) => x.productId !== productId));
    emit();
  }, []);

  const total = lines.reduce((a, b) => a + b.price * b.qty, 0);
  const count = lines.reduce((a, b) => a + b.qty, 0);

  return { lines, add, remove, setLines, total, count };
}
