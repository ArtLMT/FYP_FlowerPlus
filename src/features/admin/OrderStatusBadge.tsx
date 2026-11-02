import { ORDER_STATUS_LABELS, ORDER_STATUS_STYLES } from "@/features/admin/order-labels";
import type { OrderStatus } from "@/lib/services/orders";

/** Status pill reused in the Orders table and on the Order detail page. */
export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${ORDER_STATUS_STYLES[status]}`}>{ORDER_STATUS_LABELS[status]}</span>;
}
