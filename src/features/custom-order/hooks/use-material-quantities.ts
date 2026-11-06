import { useState, type KeyboardEvent } from "react";
import type { Material } from "@/features/custom-order/QuantityStepper";

const MAX_QUANTITY = 999;

/** The backend's limit on one request or proposal. */
export const MAX_LINES = 30;

/** Two decimals, as the backend stores them; also hides float noise such as 0.1 + 0.2 = 0.30000000000000004. */
const toHundredths = (quantity: number) => Math.round(quantity * 100) / 100;

/**
 * Only METRE takes decimals, at most two (the backend refuses more). An empty value is kept so the box
 * can be cleared and retyped; a typed "1." is kept as typed so the user can go on to "1.5".
 */
function cleanQuantity(material: Material, value: string): string {
  const quantity = Number(value);
  if (value === "" || !Number.isFinite(quantity) || quantity < 0) return "";
  if (quantity > MAX_QUANTITY) return String(MAX_QUANTITY);
  if (material.unitOfMeasure !== "METRE") return String(Math.trunc(quantity));
  return /\.\d{3,}$/.test(value) ? value.replace(/(\.\d{2})\d+$/, "$1") : value;
}

function without(quantities: Record<string, string>, id: string) {
  const rest = { ...quantities };
  delete rest[id];
  return rest;
}

/** Enter in a text box means "I finished typing", never "send this form". */
export function keepFormOpen(event: KeyboardEvent<HTMLElement>) {
  if (event.key === "Enter" && event.target instanceof HTMLInputElement) event.preventDefault();
}

/**
 * Which materials are picked and how many, shared by the customer's builder and the staff proposal form.
 * The pickers load the catalog a page at a time, so each picked material is remembered as it was when
 * picked (`picks`): the selected lines and the estimate never depend on which page is on screen.
 */
export function useMaterialQuantities(initial: Record<string, string> = {}) {
  const [quantities, setQuantities] = useState(initial);
  const [picks, setPicks] = useState<Record<string, Material>>({});
  const remember = (material: Material) =>
    setPicks((all) => (all[material.id] === material ? all : { ...all, [material.id]: material }));

  return {
    quantities,
    picks,
    onSet: (material: Material, value: string) => {
      remember(material);
      setQuantities((all) => ({ ...all, [material.id]: cleanQuantity(material, value) }));
    },
    onChange: (material: Material, change: number) => {
      remember(material);
      setQuantities((all) => {
        const next = Math.min(MAX_QUANTITY, toHundredths((Number(all[material.id]) || 0) + change));
        return next > 0 ? { ...all, [material.id]: String(next) } : without(all, material.id);
      });
    },
    /** Takes a line off once its box is left empty or at zero. */
    onSettle: (id: string) => setQuantities((all) => (Number(all[id]) > 0 ? all : without(all, id))),
    onRemove: (id: string) => setQuantities((all) => without(all, id)),
    onRemoveMany: (ids: string[]) => setQuantities((all) => ids.reduce(without, all)),
  };
}
