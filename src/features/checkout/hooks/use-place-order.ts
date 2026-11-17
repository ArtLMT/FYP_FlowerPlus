import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { asApiError } from "@/lib/api";
import { useResource } from "@/lib/hooks/use-resource";
import { getAddresses, hasDeliveryArea } from "@/lib/services/addresses";
import { quoteShippingFee } from "@/lib/services/shipping";
import { placeOrder } from "@/lib/services/orders";
import { useCart } from "@/features/cart/cart-provider";
import { isWishOpen, readSelection, readVoucherCode, savePlacedOrder } from "@/features/checkout/checkout-session";
import { previewVoucher, type VoucherPreview } from "@/lib/services/vouchers";

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
  const [priceChanged, setPriceChanged] = useState<{ currentSubtotal: number; voucherDiscount: number; shippingFee: number; payableTotal: number } | null>(null);
  const [voucherCode] = useState(readVoucherCode);
  const [voucherQuote, setVoucherQuote] = useState<VoucherPreview | null>(null);
  const cartVersion = cart?.version;
  const cartSubtotal = cart?.subtotal;
  useEffect(() => {
    if (!voucherCode || cartVersion === undefined) return;
    let live = true;
    void previewVoucher(voucherCode).then((quote) => { if (live) setVoucherQuote(quote); })
      .catch(() => { if (live) setVoucherQuote(null); });
    return () => { live = false; };
  }, [voucherCode, cartVersion, cartSubtotal]);

  const address = addresses.data?.find((candidate) => candidate.id === selection?.addressId) ?? null;
  const selectionValid = selection !== null && isWishOpen(selection.deliveryDate, selection.deliveryTimeSlot);
  const addressMissing = addresses.data !== undefined && address === null;
  const addressHasArea = address !== null && hasDeliveryArea(address);
  // Re-quoted when the address or the Cart changes. Shown only: the order total does not include it yet.
  const feeQuote = useResource(
    () => quoteShippingFee(address!.id),
    addressHasArea && cartVersion !== undefined ? `shipping-fee-${address!.id}-${cartVersion}` : null,
  );
  const shippingEstimate = address === null ? { state: "loading" as const }
    : !addressHasArea ? { state: "no-area" as const }
      : feeQuote.error ? { state: "error" as const, message: feeQuote.error.message }
        : feeQuote.loading || !feeQuote.data ? { state: "loading" as const }
          : { state: "ready" as const, fee: feeQuote.data.shippingFee };

  async function submit() {
    if (!selection || !cart) return;
    setPlacing(true);
    setPlaceError(null);
    setPriceChanged(null);
    try {
      const quote = voucherCode ? await previewVoucher(voucherCode) : null;
      setVoucherQuote(quote);
      const order = await placeOrder({
        addressId: selection.addressId,
        deliveryDate: selection.deliveryDate ?? undefined,
        deliveryTimeSlot: selection.deliveryTimeSlot ?? undefined,
        customerNote: selection.customerNote || undefined,
        cartVersion: cart.version,
        expectedTotal: quote?.payableTotal ?? cart.subtotal,
        voucherCode: voucherCode ?? undefined,
      });
      savePlacedOrder(order);
      router.push("/checkout/done");
      void refresh();
    } catch (cause) {
      const error = asApiError(cause);
      setPlaceError(error.message);
      if (error.is("CHECKOUT_PRICE_CHANGED")) {
        const { currentSubtotal, voucherDiscount, shippingFee, payableTotal } = error.details;
        if ([currentSubtotal, voucherDiscount, shippingFee, payableTotal].every((value) => typeof value === "number")) {
          setPriceChanged({ currentSubtotal: currentSubtotal as number, voucherDiscount: voucherDiscount as number,
            shippingFee: shippingFee as number, payableTotal: payableTotal as number });
        }
      }
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
    priceChanged,
    voucherCode,
    voucherQuote,
    /** GHN's estimated fee for the chosen address; not part of the total (checkout still charges 0). */
    shippingEstimate,
    submit,
  };
}
