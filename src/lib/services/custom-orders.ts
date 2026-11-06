import { api, groupFieldErrors, path, withQuery, type ErrorMessages, type Page, type ValidationFieldError } from "@/lib/api";
import type { MaterialType, MaterialUnit } from "@/lib/services/materials";
import type { CustomerOrder, CustomerOrderStatus, DeliveryTimeSlot, ManagementOrder, OrderStatus } from "@/lib/services/orders";

/** A custom order: the customer designs it, staff may propose changes, and approval confirms it (COD). */

export interface CustomOrderOptions {
  arrangementTypes: { id: string; name: string; labourFee: number }[];
}

/** An Active material the custom-order pickers offer, with its selling price. */
export interface CustomMaterial {
  id: string;
  name: string;
  type: MaterialType;
  unitOfMeasure: MaterialUnit;
  sellingPrice: number;
}

export type CustomMaterialSort = "NAME" | "PRICE_ASC" | "PRICE_DESC";

/** The server allows at most this many results per page, and this many ids per lookup. */
export const MAX_MATERIAL_PAGE = 50;

export interface CustomMaterialQuery {
  type?: MaterialType;
  /** Accents and case are ignored; each word must start a word of the name. */
  search?: string;
  /** Only these materials (if still Active): used to refresh picks that are not on screen. */
  ids?: string[];
  sort?: CustomMaterialSort;
  page?: number;
  size?: number;
}

export interface CustomOrderLine {
  materialId: string;
  quantity: number;
}

export interface CustomOrderInput {
  arrangementTypeId: string;
  items: CustomOrderLine[];
  note?: string;
  addressId: string;
  deliveryDate?: string;
  deliveryTimeSlot?: DeliveryTimeSlot;
  customerNote?: string;
}

export interface ProposalInput {
  arrangementTypeId: string;
  items: CustomOrderLine[];
  price: number;
  note?: string;
}

function fieldMessage({ field, rule }: ValidationFieldError) {
  if (rule === "FlowerRequired") return "Hãy chọn ít nhất một loại hoa.";
  if (rule === "WholeQuantity") return "Chỉ nguyên liệu tính theo mét mới có số lẻ.";
  if (rule === "DuplicateMaterial") return "Mỗi nguyên liệu chỉ được chọn một lần.";
  if (rule === "SlotNeedsDate") return "Hãy chọn ngày trước khi chọn khung giờ.";
  if (field === "price") return "Giá phải là số nguyên VND lớn hơn 0.";
  if (field === "note" || field === "customerNote") return "Ghi chú quá dài.";
  return "Số lượng phải lớn hơn 0 và không quá 999.";
}

const validation: ErrorMessages["fields"] = (fields) => groupFieldErrors(fields, fieldMessage);

const CHOICE_GONE = "Có kiểu cắm hoặc nguyên liệu vừa ngừng sử dụng. Hãy tải lại và chọn lựa chọn khác.";
const TERMS_CHANGED = "Nội dung yêu cầu vừa thay đổi. Trang đã được tải lại, hãy xem lại trước khi thao tác.";

const sharedCodes: NonNullable<ErrorMessages["codes"]> = {
  CUSTOM_CHOICE_UNAVAILABLE: CHOICE_GONE,
  CUSTOM_TERMS_CHANGED: TERMS_CHANGED,
  ORDER_NOT_FOUND: "Không tìm thấy đơn hàng này.",
  ORDER_INVALID_STATE: "Đơn hàng đã thay đổi trạng thái. Hãy tải lại trước khi thao tác.",
  ACCOUNT_SUSPENDED: "Tài khoản của bạn đang bị tạm khóa đặt hàng nên chưa thể thực hiện thao tác này.",
  VALIDATION_FAILED: (error) => error.fieldMessages.join(" ") || "Một số thông tin chưa hợp lệ.",
};

const errors: ErrorMessages = { codes: sharedCodes, fields: validation };

export const getCustomOrderOptions = () =>
  api<CustomOrderOptions>("/api/custom-orders/options", { errors: { fallback: "Không thể tải danh sách lựa chọn." } });

/** One page of Active materials; the catalog is never loaded whole (T-ORD-15). */
export const getCustomOrderMaterials = ({ ids, ...query }: CustomMaterialQuery) =>
  api<Page<CustomMaterial>>(
    withQuery("/api/custom-orders/materials", { ...query, ids: ids?.join(",") }),
    { errors: { fallback: "Không thể tải danh sách nguyên liệu." } },
  );

/** The server prices the request from its own rows; only choices and quantities are sent. */
export const submitCustomOrder = (input: CustomOrderInput) =>
  api<CustomerOrder>("/api/custom-orders", { method: "POST", body: input, errors });

export const acceptProposal = (orderId: string, termsNo: number, expectedStatus: CustomerOrderStatus) =>
  api<CustomerOrder>(path`/api/orders/${orderId}/terms/${termsNo}/accept`, {
    method: "POST",
    body: { expectedStatus },
    errors,
  });

export const declineProposal = (orderId: string, termsNo: number, expectedStatus: CustomerOrderStatus, note: string) =>
  api<CustomerOrder>(path`/api/orders/${orderId}/terms/${termsNo}/decline`, {
    method: "POST",
    body: { expectedStatus, note },
    errors,
  });

/** `basedOnTermsNo` is the newest version on screen; the server refuses if the terms moved since. */
export const proposeChanges = (orderId: string, expectedStatus: OrderStatus, basedOnTermsNo: number, input: ProposalInput) =>
  api<ManagementOrder>(path`/api/manage/orders/${orderId}/terms`, {
    method: "POST",
    body: { expectedStatus, basedOnTermsNo, ...input },
    errors,
  });

export const approveCustomOrder = (orderId: string, expectedStatus: OrderStatus, termsNo: number) =>
  api<ManagementOrder>(path`/api/manage/orders/${orderId}/approve`, {
    method: "POST",
    body: { expectedStatus, termsNo },
    errors,
  });
