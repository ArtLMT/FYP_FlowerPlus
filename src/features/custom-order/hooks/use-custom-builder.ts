import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { asApiError, type ApiError } from "@/lib/api";
import { useResource } from "@/lib/hooks/use-resource";
import { getAddresses, type AccountAddress } from "@/lib/services/addresses";
import { getCustomOrderOptions, submitCustomOrder, type CustomOrderOptions } from "@/lib/services/custom-orders";
import type { DeliveryTimeSlot } from "@/lib/services/orders";
import { useCart } from "@/features/cart/cart-provider";
import { openSlots } from "@/features/checkout/checkout-session";
import { MAX_LINES, useMaterialQuantities } from "@/features/custom-order/hooks/use-material-quantities";
import { shopToday } from "@/lib/utils";

async function loadBuilder(): Promise<{ options: CustomOrderOptions; addresses: AccountAddress[] }> {
  const [options, addresses] = await Promise.all([getCustomOrderOptions(), getAddresses()]);
  return { options, addresses };
}

/**
 * The "Thiết kế bó hoa" form: one arrangement type, flowers and optional decorations with quantities,
 * notes, an address and an optional delivery wish. The estimate on screen comes from the options; the
 * server prices the request itself. Submitting asks for confirmation, then opens the new order's page.
 */
export function useCustomBuilder() {
  const router = useRouter();
  const { shopper } = useCart();
  const data = useResource(loadBuilder, "custom-builder");
  const materialQuantities = useMaterialQuantities();
  const { quantities, picks, onRemoveMany } = materialQuantities;
  const [materialsRefresh, setMaterialsRefresh] = useState(0);
  const [pickedTypeId, setTypeId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [customerNote, setCustomerNote] = useState("");
  const [pickedAddressId, setAddressId] = useState<string | null>(null);
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState<DeliveryTimeSlot | "">("");
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState<string[] | null>(null);

  const options = data.data?.options;
  const addresses = data.data?.addresses ?? [];
  const addressId = pickedAddressId
    ?? addresses.find((address) => address.isDefault)?.id
    ?? addresses[0]?.id
    ?? null;
  // A type the shop has just stopped offering counts as not chosen, so the customer is asked again.
  const type = options?.arrangementTypes.find((candidate) => candidate.id === pickedTypeId) ?? null;

  // Picks are kept as they were when chosen, whichever page of the catalog is on screen; the server
  // prices the request itself. A line whose box is being retyped stays on screen but is not sent.
  const picked = Object.keys(quantities)
    .filter((id) => picks[id] !== undefined)
    .map((id) => ({ material: picks[id], quantity: Number(quantities[id]) || 0 }));
  const chosen = picked.filter((line) => line.quantity > 0);
  const hasFlower = chosen.some((line) => line.material.type === "FLOWER");
  const subtotal = Math.round(chosen.reduce((sum, line) => sum + line.material.sellingPrice * line.quantity, 0));
  const fee = type?.labourFee ?? null;

  const today = shopToday();
  const slots = date ? openSlots(date) : [];
  const dateValid = !date || date >= today;
  const suspended = shopper === "suspended";
  const missing = [
    ...(suspended ? ["Tài khoản đang bị tạm khóa đặt hàng"] : []),
    ...(type === null ? ["Chọn kiểu cắm"] : []),
    ...(hasFlower ? [] : ["Chọn ít nhất một loại hoa"]),
    ...(chosen.length > MAX_LINES ? [`Chọn tối đa ${MAX_LINES} loại nguyên liệu`] : []),
    ...(addressId === null ? ["Thêm địa chỉ giao hàng"] : []),
    ...(dateValid ? [] : ["Chọn ngày giao từ hôm nay trở đi"]),
  ];
  const canSubmit = missing.length === 0 && !submitting;

  /** Names what the server refused, takes it off the bouquet, and shows the fresh lists. */
  function dropUnavailable(failure: ApiError) {
    const { arrangementTypeIds = [], materialIds = [] } = failure.details;
    setUnavailable([
      ...(options?.arrangementTypes ?? []).filter((candidate) => arrangementTypeIds.includes(candidate.id)).map((candidate) => `Kiểu cắm ${candidate.name}`),
      ...materialIds.flatMap((id) => (picks[id] ? [picks[id].name] : [])),
    ]);
    if (pickedTypeId && arrangementTypeIds.includes(pickedTypeId)) setTypeId(null);
    onRemoveMany(materialIds);
    data.reload();
    setMaterialsRefresh((count) => count + 1);
  }

  async function send() {
    if (!canSubmit || type === null || addressId === null) return;
    setSubmitting(true);
    setError(null);
    try {
      const order = await submitCustomOrder({
        arrangementTypeId: type.id,
        items: chosen.map((line) => ({ materialId: line.material.id, quantity: line.quantity })),
        note: note.trim() || undefined,
        addressId,
        deliveryDate: date || undefined,
        deliveryTimeSlot: date && slot ? slot : undefined,
        customerNote: customerNote.trim() || undefined,
      });
      router.push(`/account/orders/${order.id}`);
    } catch (cause) {
      const failure = asApiError(cause);
      if (failure.is("CUSTOM_CHOICE_UNAVAILABLE")) dropUnavailable(failure);
      else setError(failure.message);
      setConfirming(false);
      setSubmitting(false);
    }
  }

  return {
    loadError: data.error,
    reload: data.reload,
    options,
    addresses,
    addressId,
    address: addresses.find((address) => address.id === addressId) ?? null,
    setAddressId,
    type,
    typeId: type?.id ?? null,
    setTypeId,
    ...materialQuantities,
    materialsRefresh,
    picked,
    chosen,
    note,
    setNote,
    customerNote,
    setCustomerNote,
    today,
    date,
    setDate,
    dateValid,
    slots,
    slot,
    setSlot,
    subtotal,
    fee,
    estimate: subtotal + (fee ?? 0),
    missing,
    suspended,
    canSubmit,
    submitting,
    error,
    confirming,
    askToConfirm: (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (canSubmit) setConfirming(true);
    },
    closeConfirm: () => setConfirming(false),
    send,
    unavailable,
    closeUnavailable: () => setUnavailable(null),
  };
}
