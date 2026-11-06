import { api, groupFieldErrors, path, withQuery, type ErrorMessages, type Page } from "@/lib/api";
import type { MaterialType, MaterialUnit } from "@/lib/services/materials";
import type { PublicProductType } from "@/lib/services/products";

export type OrderStatus =
  | "AWAITING_PAYMENT"
  | "AWAITING_CONFIRMATION"
  | "REQUESTED"
  | "CHANGES_PROPOSED"
  | "APPROVED"
  | "CONFIRMED"
  | "PREPARING"
  | "READY"
  | "DELIVERING"
  | "COMPLETED"
  | "CANCELLED"
  | "PENDING_REFUND"
  | "REFUNDED"
  | "FAILED_DELIVERY";

export type PlacedOrderStatus = OrderStatus;

export type OrderType = "STANDARD" | "CUSTOM";

export type TermsState = "REQUESTED" | "PENDING" | "ACCEPTED" | "DECLINED" | "REPLACED";

/** One version of a custom order's terms; a snapshot that never changes after it is written. */
export interface CustomOrderTerms {
  termsNo: number;
  state: TermsState;
  arrangementTypeId: string;
  arrangementTypeName: string;
  labourFee: number;
  materialsSubtotal: number;
  price: number;
  note: string | null;
  responseNote: string | null;
  createdAt: string;
  respondedAt: string | null;
  materials: {
    materialId: string;
    materialName: string;
    materialType: MaterialType;
    unitOfMeasure: MaterialUnit;
    unitPrice: number;
    quantity: number;
  }[];
}

/** `allTerms` is staff-only; a customer gets the agreed terms and the waiting proposal. */
export interface CustomOrderDetails {
  agreed: CustomOrderTerms | null;
  pending: CustomOrderTerms | null;
  allTerms: CustomOrderTerms[] | null;
}

export type DeliveryTimeSlot = "MORNING" | "NOON" | "AFTERNOON" | "EVENING";

/** The server's delivery slots, in shop time. The picker offers a slot until it starts; it is only a wish. */
export const DELIVERY_SLOTS: { slot: DeliveryTimeSlot; label: string; startMinutes: number }[] = [
  { slot: "MORNING", label: "9:00 – 12:00", startMinutes: 9 * 60 },
  { slot: "NOON", label: "12:00 – 15:00", startMinutes: 12 * 60 },
  { slot: "AFTERNOON", label: "15:00 – 18:00", startMinutes: 15 * 60 },
  { slot: "EVENING", label: "18:00 – 21:00", startMinutes: 18 * 60 },
];

export const deliverySlotLabel = (slot: DeliveryTimeSlot) =>
  DELIVERY_SLOTS.find((candidate) => candidate.slot === slot)?.label ?? slot;

/** The Order exactly as the server created it, with the prices it fixed. */
export interface PlacedOrder {
  id: string;
  status: PlacedOrderStatus;
  type: OrderType;
  deliveryDate: string | null;
  deliveryTimeSlot: DeliveryTimeSlot | null;
  /** Built by the server; null when the customer stated no wish. */
  deliveryWishText: string | null;
  customerNote: string | null;
  address: { recipientName: string; recipientPhone: string; deliveryAddress: string };
  lines: {
    /** Null on an approved custom order's line. */
    productId: string | null;
    productName: string;
    productType: PublicProductType | null;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }[];
  shippingFee: number;
  total: number;
  createdAt: string;
}

/* ── Customer's own orders ──────────────────────── */

/** The statuses a customer can see: READY is internal and comes back as PREPARING. */
export type CustomerOrderStatus = Exclude<OrderStatus, "READY">;

export interface CustomerOrderSummary {
  id: string;
  status: CustomerOrderStatus;
  type: OrderType;
  deliveryDate: string | null;
  deliveryTimeSlot: DeliveryTimeSlot | null;
  deliveryWishText: string | null;
  firstLine: {
    productId: string | null;
    productName: string;
    quantity: number;
    unitPrice: number;
    imageUrl: string | null;
  } | null;
  lineCount: number;
  itemCount: number;
  total: number;
  createdAt: string;
}

export interface CustomerOrder {
  id: string;
  status: CustomerOrderStatus;
  /** True only before preparation starts. */
  canCancel: boolean;
  type: OrderType;
  deliveryDate: string | null;
  deliveryTimeSlot: DeliveryTimeSlot | null;
  deliveryWishText: string | null;
  custom: CustomOrderDetails | null;
  customerNote: string | null;
  address: { recipientName: string; recipientPhone: string; deliveryAddress: string };
  lines: {
    productId: string | null;
    productName: string;
    productType: PublicProductType | null;
    quantity: number;
    unitPrice: number;
    discountAmount: number;
    lineTotal: number;
    /** The product's current main image; null once it is no longer on sale. */
    imageUrl: string | null;
  }[];
  shippingFee: number;
  total: number;
  paymentMethod: "COD" | (string & {});
  paymentStatus: string;
  paidAt: string | null;
  createdAt: string;
  /** Oldest first; READY rows are left out. A cancellation carries its note. */
  history: { status: CustomerOrderStatus; note: string | null; createdAt: string }[];
}

const customerErrors: ErrorMessages = {
  codes: { ORDER_NOT_FOUND: "Không tìm thấy đơn hàng này." },
};

/** The signed-in account's orders, newest first. PREPARING also matches orders the shop marked ready. */
export function listMyOrders(query: { page: number; size: number; status?: CustomerOrderStatus }) {
  return api<Page<CustomerOrderSummary>>(withQuery("/api/orders", query), { errors: customerErrors });
}

/** Another account's order id answers ORDER_NOT_FOUND, like a missing one. */
export function getMyOrder(id: string) {
  return api<CustomerOrder>(path`/api/orders/${id}`, { errors: customerErrors });
}

const customerCancelErrors: ErrorMessages = {
  codes: {
    ORDER_NOT_FOUND: "Không tìm thấy đơn hàng này.",
    ORDER_INVALID_STATE: "Đơn hàng đã được cửa hàng xử lý nên không thể hủy nữa.",
  },
  fields: (fields) => groupFieldErrors(fields, ({ field }) =>
    field === "note" ? "Vui lòng nhập lý do hủy đơn." : "Thông tin chưa hợp lệ."),
};

/**
 * Cancels the signed-in account's own order before preparation starts; the reason is required.
 * `expectedStatus` is the status the customer sees; a changed order answers ORDER_INVALID_STATE.
 */
export function cancelMyOrder(id: string, note: string, expectedStatus: CustomerOrderStatus) {
  return api<CustomerOrder>(path`/api/orders/${id}/cancel`, {
    method: "POST",
    body: { note, expectedStatus },
    errors: customerCancelErrors,
  });
}

export interface PlaceOrderInput {
  addressId: string;
  deliveryDate?: string;
  deliveryTimeSlot?: DeliveryTimeSlot;
  customerNote?: string;
  /** The Cart version the customer reviewed. */
  cartVersion: number;
}

/**
 * COD checkout. Only the address id, delivery date and slot, the note and the Cart version are
 * sent — the server loads the Cart, prices, names and recipes itself.
 */
export const placeOrder = (input: PlaceOrderInput) =>
  api<PlacedOrder>("/api/orders", { method: "POST", body: input });

/** Backend contract used by the Admin Order table; this file intentionally contains no UI. */
export interface ManagementOrderSummary {
  id: string;
  status: OrderStatus;
  nextStatus: OrderStatus | null;
  canCancel: boolean;
  type: OrderType;
  deliveryDate: string | null;
  deliveryTimeSlot: DeliveryTimeSlot | null;
  deliveryWishText: string | null;
  recipientName: string;
  recipientPhone: string;
  total: number;
  createdAt: string;
}

export interface ManagementOrder extends ManagementOrderSummary {
  customerId: string;
  custom: CustomOrderDetails | null;
  customerNote: string | null;
  address: { recipientName: string; recipientPhone: string; deliveryAddress: string };
  lines: PlacedOrder["lines"];
  shippingFee: number;
  paymentMethod: "COD" | string;
  paymentStatus: string;
  history: {
    oldStatus: OrderStatus | null;
    newStatus: OrderStatus;
    changedBy: string | null;
    note: string | null;
    createdAt: string;
  }[];
}

const managementErrors: ErrorMessages = {
  codes: {
    ORDER_NOT_FOUND: "Không tìm thấy đơn hàng này.",
    ORDER_INVALID_STATE: "Đơn hàng đã thay đổi trạng thái. Hãy tải lại trước khi thao tác.",
    // Confirming takes the materials now, all or nothing (BR-INV-15); the stock alert names what is short.
    INSUFFICIENT_STOCK: "Kho chưa đủ nguyên liệu để chuẩn bị đơn này. Hãy nhập lô hàng còn thiếu rồi xác nhận lại.",
    CONCURRENT_MODIFICATION: "Kho hoặc đơn hàng đang được cập nhật cùng lúc. Vui lòng thử lại.",
  },
  fields: (fields) => groupFieldErrors(fields, ({ field }) =>
    field === "note" ? "Vui lòng nhập ghi chú hủy đơn." : "Thông tin chưa hợp lệ."),
};

export function listManagementOrders(query: {
  page: number;
  size: number;
  status?: OrderStatus;
  type?: OrderType;
  sort?: "createdAt" | "deliveryWish";
}) {
  return api<Page<ManagementOrderSummary>>(withQuery("/api/manage/orders", query), { errors: managementErrors });
}

export function getManagementOrder(id: string) {
  return api<ManagementOrder>(path`/api/manage/orders/${id}`, { errors: managementErrors });
}

/**
 * `expectedStatus` is the status on the staff member's screen; if the Order has moved since, the
 * server refuses with ORDER_INVALID_STATE instead of moving it again (BR-STATUS-12).
 */
export function advanceManagementOrder(id: string, expectedStatus: OrderStatus) {
  return api<ManagementOrder>(path`/api/manage/orders/${id}/advance`, {
    method: "POST",
    body: { expectedStatus },
    errors: managementErrors,
  });
}

export function cancelManagementOrder(id: string, note: string, expectedStatus: OrderStatus) {
  return api<ManagementOrder>(path`/api/manage/orders/${id}/cancel`, {
    method: "POST",
    body: { note, expectedStatus },
    errors: managementErrors,
  });
}
