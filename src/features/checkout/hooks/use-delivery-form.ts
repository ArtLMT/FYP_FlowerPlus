import { useState } from "react";
import { useRouter } from "next/navigation";
import { useResource } from "@/lib/hooks/use-resource";
import { getAddresses, type AccountAddress } from "@/lib/services/addresses";
import type { DeliveryTimeSlot } from "@/lib/services/orders";
import { addDays, shopToday } from "@/lib/utils";
import {
  isWishOpen,
  openSlots,
  readSelection,
  saveSelection,
  type CheckoutSelection,
} from "@/features/checkout/checkout-session";

export const NOTE_MAX_LENGTH = 500;

export type DateChoice = "none" | "today" | "tomorrow" | "other";

interface DeliveryOptions {
  addresses: AccountAddress[];
  /** The address picked last time, else the default one, else the first. */
  initialAddressId: string | null;
  /** The choice made last time, if its date and slot are still open. */
  saved: CheckoutSelection | null;
}

async function loadDeliveryOptions(): Promise<DeliveryOptions> {
  const addresses = await getAddresses();
  const saved = readSelection();
  return {
    addresses,
    initialAddressId: addresses.find((address) => address.id === saved?.addressId)?.id
      ?? addresses.find((address) => address.isDefault)?.id
      ?? addresses[0]?.id
      ?? null,
    saved: saved && isWishOpen(saved.deliveryDate, saved.deliveryTimeSlot) ? saved : null,
  };
}

/**
 * Checkout step 1: one saved address, an optional wish for the date and slot (no past date, today
 * only slots not yet started, in shop time) and an optional note. The choice is remembered for the
 * confirm step.
 */
export function useDeliveryForm() {
  const router = useRouter();
  const options = useResource(loadDeliveryOptions, "delivery-options");
  const [pickedAddressId, setAddressId] = useState<string | null>(null);
  const [pickedChoice, setPickedChoice] = useState<DateChoice | null>(null);
  const [pickedDate, setPickedDate] = useState<string | null>(null);
  // undefined: nothing picked yet, so the remembered slot stands; null: the customer cleared it.
  const [pickedSlot, setSlot] = useState<DeliveryTimeSlot | null | undefined>(undefined);
  const [pickedNote, setNote] = useState<string | null>(null);

  const today = shopToday();
  const tomorrow = addDays(today, 1);
  const todayClosed = openSlots(today).length === 0;
  const saved = options.data?.saved ?? null;

  const addressId = pickedAddressId ?? options.data?.initialAddressId ?? null;
  const savedDate = saved?.deliveryDate ?? null;
  const dateChoice: DateChoice = pickedChoice
    ?? (savedDate === null ? "none" : savedDate === today ? "today" : savedDate === tomorrow ? "tomorrow" : "other");
  const date = dateChoice === "none" ? null
    : dateChoice === "today" ? today
      : dateChoice === "tomorrow" ? tomorrow
        : pickedDate ?? savedDate ?? tomorrow;
  const slots = date ? openSlots(date) : [];
  const wantedSlot = pickedSlot === undefined ? saved?.deliveryTimeSlot ?? null : pickedSlot;
  // A slot picked for another date drops out when it is not open on this one.
  const slot = wantedSlot && slots.some((open) => open.slot === wantedSlot) ? wantedSlot : null;
  const note = pickedNote ?? saved?.customerNote ?? "";
  const dateValid = date === null || date >= today;

  const canContinue = addressId !== null && dateValid && note.length <= NOTE_MAX_LENGTH;

  function next() {
    if (!canContinue || addressId === null) return;
    saveSelection({ addressId, deliveryDate: date, deliveryTimeSlot: slot, customerNote: note.trim() });
    router.push("/checkout/confirm");
  }

  return {
    addresses: options.data?.addresses,
    loadError: options.error?.message ?? null,
    addressId,
    setAddressId,
    today,
    todayClosed,
    dateChoice,
    chooseDate: setPickedChoice,
    date,
    setDate: setPickedDate,
    dateValid,
    slots,
    slot,
    setSlot,
    note,
    setNote,
    canContinue,
    next,
  };
}
