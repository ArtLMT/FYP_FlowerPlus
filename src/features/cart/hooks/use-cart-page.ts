import { useEffect, useState } from "react";
import { asApiError } from "@/lib/api";
import type { CartLine } from "@/lib/services/cart";
import { useCart } from "@/features/cart/cart-provider";

/** Which screen /cart shows. */
export type CartView = "loading" | "failed" | "guest" | "empty" | "lines";

/**
 * State and actions for /cart. The stepper and delete call the API; a failed change shows why and
 * re-reads the Cart, so its flags are current. Lines with a problem stay visible and block
 * checkout until fixed — they are never removed silently.
 */
export function useCartPage() {
  const { shopper, cart, loading, loadFailed, reload, refresh, setQty, remove } = useCart();
  const [busyLineId, setBusyLineId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fresh Cart on every visit: product status changes without the customer acting.
  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function change(line: CartLine, action: () => Promise<void>) {
    setBusyLineId(line.productId);
    setError(null);
    try {
      await action();
    } catch (cause) {
      setError(asApiError(cause).message);
      await refresh();
    } finally {
      setBusyLineId(null);
    }
  }

  const lines = cart?.lines ?? [];
  const view: CartView =
    loading && !cart ? "loading"
      : loadFailed ? "failed"
        : shopper === "guest" ? "guest"
          : lines.length === 0 ? "empty"
            : "lines";

  return {
    view,
    shopper,
    cart,
    lines,
    reload,
    error,
    isBusy: (line: CartLine) => busyLineId === line.productId,
    decrease: (line: CartLine) => change(line, () => setQty(line.productId, line.quantity - 1)),
    increase: (line: CartLine) => change(line, () => setQty(line.productId, line.quantity + 1)),
    remove: (line: CartLine) => change(line, () => remove(line.productId)),
    canCheckout: shopper === "active" && lines.length > 0 && !cart?.hasProblems,
    showCheckoutBar: shopper !== "guest" && shopper !== "loading" && lines.length > 0,
  };
}
