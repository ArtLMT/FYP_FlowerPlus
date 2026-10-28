import { useResource } from "@/lib/hooks/use-resource";
import { deliverySlotLabel, type PlacedOrder } from "@/lib/services/orders";
import { formatCalendarDate, formatVND } from "@/lib/utils";
import { readPlacedOrder } from "@/features/checkout/checkout-session";

const STATUS_LABEL: Record<string, string> = {
  AWAITING_CONFIRMATION: "Chờ cửa hàng xác nhận",
};

/** The summary rows under the order's lines on the success screen. */
export function orderSummaryRows(order: PlacedOrder) {
  const itemCount = order.lines.reduce((sum, line) => sum + line.quantity, 0);
  return [
    { k: "Trạng thái", v: STATUS_LABEL[order.status] ?? order.status },
    { k: "Sản phẩm", v: `${itemCount} món` },
    { k: "Người nhận", v: `${order.address.recipientName} · ${order.address.recipientPhone}` },
    { k: "Địa chỉ", v: order.address.deliveryAddress },
    {
      k: "Giao hàng",
      v: `${formatCalendarDate(order.deliveryDate)} · ${deliverySlotLabel(order.deliveryTimeSlot)}`,
    },
    ...(order.customerNote ? [{ k: "Ghi chú", v: order.customerNote }] : []),
    { k: "Thanh toán", v: "Khi nhận hàng (COD)" },
    { k: "Phí giao hàng", v: order.shippingFee === 0 ? "Miễn phí" : formatVND(order.shippingFee) },
  ];
}

/**
 * Checkout step 3: the Order exactly as the server created it. It is kept in sessionStorage, which
 * only exists in the browser, so it is read after mount: undefined while reading, null if missing.
 */
export function usePlacedOrder(): PlacedOrder | null | undefined {
  const { data, loading } = useResource(async () => readPlacedOrder(), "placed-order");
  return loading ? undefined : data ?? null;
}
