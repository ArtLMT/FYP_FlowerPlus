"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { CartItem, Product } from "@/lib/types";
import { cartItems as seed } from "@/lib/mock-data";

/**
 * Cart store — a client Context seeded from the mock cart.
 *
 * This is the one piece of cross-screen state: the PDP adds to it, the header
 * and bottom nav show its count, /cart edits it, and checkout reads it and
 * clears it on order placement.
 *
 * TODO(api): persist the cart (localStorage or a backend cart endpoint) instead
 *            of resetting to the mock seed on reload.
 */

interface CartContextValue {
  items: CartItem[];
  add: (product: Product, qty?: number) => void;
  remove: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  toggle: (productId: string) => void;
  clear: () => void;
  /** total quantity across all lines — for the badge */
  count: number;
  /** number of ticked lines */
  selectedCount: number;
  /** sum of price×qty over ticked lines */
  subtotal: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(seed);

  const add = (product: Product, qty = 1) =>
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) => (i.product.id === product.id ? { ...i, qty: i.qty + qty } : i));
      }
      return [...prev, { product, qty, selected: true }];
    });

  const remove = (productId: string) =>
    setItems((prev) => prev.filter((i) => i.product.id !== productId));

  const setQty = (productId: string, qty: number) =>
    setItems((prev) =>
      prev.map((i) => (i.product.id === productId ? { ...i, qty: Math.max(1, qty) } : i))
    );

  const toggle = (productId: string) =>
    setItems((prev) =>
      prev.map((i) => (i.product.id === productId ? { ...i, selected: !i.selected } : i))
    );

  const clear = () => setItems([]);

  const selected = items.filter((i) => i.selected);
  const value: CartContextValue = {
    items,
    add,
    remove,
    setQty,
    toggle,
    clear,
    count: items.reduce((s, i) => s + i.qty, 0),
    selectedCount: selected.length,
    subtotal: selected.reduce((s, i) => s + i.product.price * i.qty, 0),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
