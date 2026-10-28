import { useEffect } from "react";
import { useCart } from "@/features/cart/cart-provider";

/** Why checkout is closed for this shopper, or "open". */
export type CheckoutGateState =
  | "loading"
  | "failed"
  | "guest"
  | "suspended"
  | "empty"
  | "problems"
  | "open";

/**
 * Checkout is open to any signed-in, non-suspended account (Customer, Staff or Admin) with a
 * non-empty Cart whose lines are all purchasable. Re-reads the Cart on entry, since stock and product status change on their own.
 */
export function useCheckoutGate() {
  const { shopper, cart, loading, loadFailed, reload, refresh } = useCart();

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const state: CheckoutGateState =
    loading && !cart ? "loading"
      : loadFailed ? "failed"
        : shopper === "guest" ? "guest"
          : shopper === "suspended" ? "suspended"
            : !cart || cart.lines.length === 0 ? "empty"
              : cart.hasProblems ? "problems"
                : "open";

  return { state, reload };
}
