import { DELIVERY_SLOTS, type DeliveryTimeSlot, type PlacedOrder } from "@/lib/services/orders";
import { shopMinutesNow, shopToday } from "@/lib/utils";

/**
 * What the customer picked between checkout steps, and the order just placed. Kept in
 * sessionStorage (this tab only); every read tolerates storage being unavailable or stale.
 * The server validates the address, date and slot again.
 */

export interface CheckoutSelection {
  addressId: string;
  /** YYYY-MM-DD, shop time. */
  deliveryDate: string;
  deliveryTimeSlot: DeliveryTimeSlot;
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

export const isSlotOpen = (deliveryDate: string, slot: DeliveryTimeSlot) =>
  openSlots(deliveryDate).some((open) => open.slot === slot);

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
