"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import {
  addCartItem,
  getShopperCart,
  removeCartItem,
  updateCartItem,
  type Cart,
  type Shopper,
} from "@/lib/services/cart";

/**
 * Cart store — the signed-in Customer's server Cart, shared app-wide.
 *
 * The header/bottom-nav badge, the product page, /cart and checkout all read it. Every change goes
 * to the server and the store keeps the Cart the server answers with, so `cart.version` is always
 * the one checkout must send back.
 */

interface CartContextValue {
  shopper: Shopper;
  cart: Cart | null;
  /** First load or reload in progress. */
  loading: boolean;
  /** The last load failed (network/server); `reload` retries. */
  loadFailed: boolean;
  /** Re-read the account and Cart, showing the loading state (e.g. a retry button). */
  reload: () => Promise<void>;
  /** Re-read quietly in the background (e.g. on entering /cart or after login). Stable identity. */
  refresh: () => Promise<void>;
  /** Throws ApiError so the caller can show what went wrong. */
  add: (productId: string, quantity?: number) => Promise<void>;
  /** Quantity 0 removes the line. Throws ApiError. */
  setQty: (productId: string, quantity: number) => Promise<void>;
  remove: (productId: string) => Promise<void>;
  /** Total quantity across all lines — for the badge. */
  count: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [shopper, setShopper] = useState<Shopper>("loading");
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  const refresh = useCallback(
    () => getShopperCart()
      .then(
        (next) => {
          setShopper(next.shopper);
          setCart(next.cart);
          setLoadFailed(false);
        },
        () => setLoadFailed(true),
      )
      .finally(() => setLoading(false)),
    [],
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const reload = useCallback(async () => {
    setLoading(true);
    await refresh();
  }, [refresh]);

  const value: CartContextValue = {
    shopper,
    cart,
    loading,
    loadFailed,
    reload,
    refresh,
    add: async (productId, quantity = 1) => setCart(await addCartItem(productId, quantity)),
    setQty: async (productId, quantity) => setCart(await updateCartItem(productId, quantity)),
    remove: async (productId) => setCart(await removeCartItem(productId)),
    count: cart?.itemCount ?? 0,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
