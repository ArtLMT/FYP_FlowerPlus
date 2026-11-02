import type { OrderStatus } from "@/lib/services/orders";

/** Change Order status labels, badge colours, and lifecycle button text in this file. */
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  AWAITING_PAYMENT: "Chờ thanh toán",
  AWAITING_CONFIRMATION: "Chờ xác nhận",
  REQUESTED: "Đã yêu cầu",
  CHANGES_PROPOSED: "Đề xuất thay đổi",
  APPROVED: "Đã duyệt",
  CONFIRMED: "Đã xác nhận",
  PREPARING: "Đang chuẩn bị",
  READY: "Sẵn sàng giao",
  DELIVERING: "Đang giao",
  COMPLETED: "Hoàn tất",
  CANCELLED: "Đã hủy",
  PENDING_REFUND: "Chờ hoàn tiền",
  REFUNDED: "Đã hoàn tiền",
  FAILED_DELIVERY: "Giao thất bại",
};

export const ORDER_STATUS_STYLES: Record<OrderStatus, string> = {
  AWAITING_PAYMENT: "bg-amber-50 text-amber-800",
  AWAITING_CONFIRMATION: "bg-amber-50 text-amber-800",
  REQUESTED: "bg-neutral-raised text-text-secondary",
  CHANGES_PROPOSED: "bg-neutral-raised text-text-secondary",
  APPROVED: "bg-tertiary text-primary-deep",
  CONFIRMED: "bg-tertiary text-primary-deep",
  PREPARING: "bg-tertiary text-primary-deep",
  READY: "bg-accent-sage-light text-text-primary",
  DELIVERING: "bg-blue-50 text-blue-800",
  COMPLETED: "bg-accent-sage-light text-text-primary",
  CANCELLED: "bg-red-50 text-red-800",
  PENDING_REFUND: "bg-amber-50 text-amber-800",
  REFUNDED: "bg-neutral-raised text-text-secondary",
  FAILED_DELIVERY: "bg-red-50 text-red-800",
};

export const ADVANCE_LABELS: Partial<Record<OrderStatus, string>> = {
  AWAITING_CONFIRMATION: "Xác nhận & bắt đầu chuẩn bị",
  CONFIRMED: "Bắt đầu chuẩn bị",
  PREPARING: "Đánh dấu sẵn sàng",
  READY: "Đã giao cho đơn vị vận chuyển",
  DELIVERING: "Xác nhận khách đã nhận",
};

export const MANAGED_ORDER_STATUSES: OrderStatus[] = [
  "AWAITING_CONFIRMATION",
  "PREPARING",
  "READY",
  "DELIVERING",
  "COMPLETED",
  "CANCELLED",
];
