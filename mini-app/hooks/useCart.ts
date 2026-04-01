"use client";

import { useCallback, useSyncExternalStore } from "react";

export type CartLine = { productId: string; name: string; price: number; qty: number };

const KEY = "gz_cart_v2";

function read(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? "[]") as CartLine[];
    return Array.isArray(v) ? v : [];
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
