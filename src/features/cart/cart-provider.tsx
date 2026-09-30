"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { CartItem, Product, Voucher } from "@/lib/types";
import { cartItems as seed } from "@/lib/mock-data";
import { computeVoucher, findVoucher, voucherError } from "./voucher";

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
  /* ── Voucher ── */
  /** The currently applied voucher, or null. */
  appliedVoucher: Voucher | null;
  /** Try to apply a code against the current subtotal. */
  applyVoucher: (code: string) => { ok: boolean; error?: string };
  /** Remove any applied voucher. */
  removeVoucher: () => void;
  /** VND off the subtotal from the applied voucher (0 if none / invalid). */
  discount: number;
  /** Whether the applied voucher makes delivery free. */
  freeShipping: boolean;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(seed);
  /** Stored as a code; the Voucher object is resolved from the catalog below. */
  const [voucherCode, setVoucherCode] = useState<string | null>(null);

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

  const clear = () => {
    setItems([]);
    setVoucherCode(null);
  };

  const selected = items.filter((i) => i.selected);
  const subtotal = selected.reduce((s, i) => s + i.product.price * i.qty, 0);

  // Resolve + re-validate the voucher against the *current* subtotal every render,
  // so a code that no longer qualifies (items removed/unticked) simply stops
  // discounting instead of going stale.
  const appliedVoucher = voucherCode ? findVoucher(voucherCode) ?? null : null;
  const { discount, freeShipping } = computeVoucher(appliedVoucher, subtotal);

  const applyVoucher = (code: string): { ok: boolean; error?: string } => {
    const voucher = findVoucher(code);
    if (!voucher) return { ok: false, error: "Mã giảm giá không hợp lệ." };
    const err = voucherError(voucher, subtotal);
    if (err) return { ok: false, error: err };
    setVoucherCode(voucher.code);
    return { ok: true };
  };

  const removeVoucher = () => setVoucherCode(null);

  const value: CartContextValue = {
    items,
    add,
    remove,
    setQty,
    toggle,
    clear,
    count: items.reduce((s, i) => s + i.qty, 0),
    selectedCount: selected.length,
    subtotal,
    appliedVoucher,
    applyVoucher,
    removeVoucher,
    discount,
    freeShipping,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
