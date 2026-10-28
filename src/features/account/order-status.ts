import type { CustomerOrderStatus } from "@/lib/services/orders";

/** Customer-facing order status text and badge colours. READY never reaches the customer. */
export const CUSTOMER_STATUS_LABELS: Record<CustomerOrderStatus, string> = {
  AWAITING_PAYMENT: "Chờ thanh toán",
  AWAITING_CONFIRMATION: "Chờ xác nhận",
  REQUESTED: "Đã gửi yêu cầu",
  CHANGES_PROPOSED: "Cửa hàng đề xuất thay đổi",
  APPROVED: "Đã duyệt",
  CONFIRMED: "Đã xác nhận",
  PREPARING: "Đang chuẩn bị",
  DELIVERING: "Đang giao",
  COMPLETED: "Hoàn tất",
  CANCELLED: "Đã hủy",
  PENDING_REFUND: "Chờ hoàn tiền",
  REFUNDED: "Đã hoàn tiền",
  FAILED_DELIVERY: "Giao không thành công",
};

const WAITING = "bg-amber-50 text-amber-800";
const ACTIVE = "bg-tertiary text-primary-deep";
const DONE = "bg-accent-sage-light text-[#386A20]";
const STOPPED = "bg-red-50 text-red-800";
const NEUTRAL = "bg-neutral-raised text-text-secondary";

export const CUSTOMER_STATUS_STYLES: Record<CustomerOrderStatus, string> = {
  AWAITING_PAYMENT: WAITING,
  AWAITING_CONFIRMATION: WAITING,
  REQUESTED: WAITING,
  CHANGES_PROPOSED: WAITING,
  APPROVED: ACTIVE,
  CONFIRMED: ACTIVE,
  PREPARING: ACTIVE,
  DELIVERING: "bg-blue-50 text-blue-800",
  COMPLETED: DONE,
  CANCELLED: STOPPED,
  PENDING_REFUND: WAITING,
  REFUNDED: NEUTRAL,
  FAILED_DELIVERY: STOPPED,
};

/** The list's filter tabs; PREPARING also matches orders the shop has marked ready. */
export const ORDER_FILTERS: { key: CustomerOrderStatus | "ALL"; label: string }[] = [
  { key: "ALL", label: "TẤT CẢ" },
  { key: "AWAITING_CONFIRMATION", label: "CHỜ XÁC NHẬN" },
  { key: "PREPARING", label: "ĐANG CHUẨN BỊ" },
  { key: "DELIVERING", label: "ĐANG GIAO" },
  { key: "COMPLETED", label: "HOÀN TẤT" },
  { key: "CANCELLED", label: "ĐÃ HỦY" },
];

/** The COD progress shown on an order's details, in order. */
export const TRACK_STEPS: { status: CustomerOrderStatus; label: string }[] = [
  { status: "AWAITING_CONFIRMATION", label: "Đã đặt" },
  { status: "PREPARING", label: "Chuẩn bị" },
  { status: "DELIVERING", label: "Đang giao" },
  { status: "COMPLETED", label: "Hoàn tất" },
];

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: "Chưa thanh toán",
  SUCCESS: "Đã thanh toán",
  FAILED: "Thanh toán thất bại",
  REFUNDED: "Đã hoàn tiền",
};

/** The first block of the order id, enough for a customer to quote. */
export const shortOrderId = (id: string) => id.slice(0, 8).toUpperCase();
