import { DELIVERY_SLOTS, type DeliveryTimeSlot, type PlacedOrder } from "@/lib/services/orders";
import { shopMinutesNow, shopToday } from "@/lib/utils";

/**
 * What the customer picked between checkout steps, and the order just placed. Kept in
 * sessionStorage (this tab only); every read tolerates storage being unavailable or stale.
 * The picker alone judges the date and slot: they are a wish, and the server does not refuse them.
 */

export interface CheckoutSelection {
  addressId: string;
  /** YYYY-MM-DD, shop time; null when the customer states no wish. */
  deliveryDate: string | null;
  deliveryTimeSlot: DeliveryTimeSlot | null;
  customerNote: string;
}

/** The slots still open on a date: all of them later, only those not yet started today. */
export function openSlots(deliveryDate: string) {
  const today = shopToday();
  if (deliveryDate < today) return [];
  if (deliveryDate > today) return DELIVERY_SLOTS;
  const now = shopMinutesNow();
  return DELIVERY_SLOTS.filter((slot) => slot.startMinutes > now);
}

/** Still a sensible wish: none at all, a date not in the past, or a slot that has not started. */
export function isWishOpen(deliveryDate: string | null, slot: DeliveryTimeSlot | null) {
  if (deliveryDate === null) return slot === null;
  if (deliveryDate < shopToday()) return false;
  return slot === null || openSlots(deliveryDate).some((open) => open.slot === slot);
}

const SELECTION_KEY = "flowerplus.checkout.selection";
const ORDER_KEY = "flowerplus.checkout.placedOrder";

function read<T>(key: string): T | null {
  try {
    const raw = window.sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  try {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable: the next step falls back to asking again.
  }
}

export const readSelection = () => read<CheckoutSelection>(SELECTION_KEY);
export const saveSelection = (selection: CheckoutSelection) => write(SELECTION_KEY, selection);

export const readPlacedOrder = () => read<PlacedOrder>(ORDER_KEY);
export function savePlacedOrder(order: PlacedOrder) {
  write(ORDER_KEY, order);
  try {
    window.sessionStorage.removeItem(SELECTION_KEY);
  } catch {
    // ignore
  }
}
