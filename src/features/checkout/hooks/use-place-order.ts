import { useState } from "react";
import { useRouter } from "next/navigation";
import { asApiError } from "@/lib/api";
import { useResource } from "@/lib/hooks/use-resource";
import { getAddresses } from "@/lib/services/addresses";
import { placeOrder } from "@/lib/services/orders";
import { useCart } from "@/features/cart/cart-provider";
import { isSlotOpen, readSelection, savePlacedOrder } from "@/features/checkout/checkout-session";

/**
 * Checkout step 2: review the current Cart with the chosen address, date, slot and note, then place
 * a COD order. Only those and the Cart version shown are sent; the server prices the Order itself.
 * A failure keeps every Cart line and re-reads the Cart so its flags are current.
 */
export function usePlaceOrder() {
  const router = useRouter();
  const { cart, refresh } = useCart();
  const [selection] = useState(readSelection);
  const addresses = useResource(getAddresses, selection ? "addresses" : null);
  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState<string | null>(null);

  const address = addresses.data?.find((candidate) => candidate.id === selection?.addressId) ?? null;
  const selectionValid = selection !== null && isSlotOpen(selection.deliveryDate, selection.deliveryTimeSlot);
  const addressMissing = addresses.data !== undefined && address === null;

  async function submit() {
    if (!selection || !cart) return;
    setPlacing(true);
    setPlaceError(null);
    try {
      const order = await placeOrder({
        addressId: selection.addressId,
        deliveryDate: selection.deliveryDate,
        deliveryTimeSlot: selection.deliveryTimeSlot,
        customerNote: selection.customerNote || undefined,
        cartVersion: cart.version,
      });
      savePlacedOrder(order);
      router.push("/checkout/done");
      void refresh();
    } catch (cause) {
      const error = asApiError(cause);
      setPlaceError(error.message);
      if (!error.isNetworkError) await refresh();
      setPlacing(false);
    }
  }

  return {
    cart,
    selection,
    address,
    /** The saved choice is gone, expired or points at a deleted address: pick again. */
    needsNewSelection: !selectionValid || addressMissing,
    placing,
    error: placeError ?? addresses.error?.message ?? null,
    submit,
  };
}
