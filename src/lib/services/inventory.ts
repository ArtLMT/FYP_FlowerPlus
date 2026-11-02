import {
  api,
  groupFieldErrors,
  path,
  withQuery,
  type ErrorMessages,
  type Page,
  type ValidationFieldError,
} from "@/lib/api";
import type { MaterialStatus, MaterialType, MaterialUnit } from "@/lib/services/materials";

/**
 * Staff/Admin stock receipts: record a delivery as a material batch and list the batches.
 * The backend decides every rule (active material, unit wholeness, expiry by type, dates, cost);
 * this service only words its answers.
 */

/** One batch of one material. Quantities are in the material's unit; `unitCost` is whole VND. */
export interface MaterialBatch {
  id: string;
  materialId: string;
  materialName: string;
  materialType: MaterialType;
  unitOfMeasure: MaterialUnit;
  /** YYYY-MM-DD */
  receivedDate: string;
  /** YYYY-MM-DD; null for a decoration batch. */
  expiryDate: string | null;
  /** Past its expiry in the shop time zone, so it no longer counts as usable stock. */
  expired: boolean;
  unitCost: number;
  receivedQuantity: number;
  availableQuantity: number;
  reservedQuantity: number;
  consumedQuantity: number;
  createdAt: string;
  createdBy: string | null;
}

export type InventoryTransactionType = "RECEIVED" | "RESERVED" | "RELEASED" | "CONSUMED" | "EXPIRED" | "ADJUSTED";

/** One append-only ledger row. Quantity is in the material's unit; signed only for ADJUSTED. */
export interface InventoryTransaction {
  id: string;
  type: InventoryTransactionType;
  quantity: number;
  materialBatchId: string;
  materialId: string;
  materialName: string;
  materialType: MaterialType;
  unitOfMeasure: MaterialUnit;
  /** The Order that reserved, released or consumed stock. */
  orderId: string | null;
  /** The staff member who received, adjusted or wrote off stock. */
  actorId: string | null;
  note: string | null;
  createdAt: string;
}

export interface ReceiveBatchInput {
  materialId: string;
  quantity: number;
  unitCost: number;
  /** Omitted: the server uses today. */
  receivedDate?: string;
  /** Flowers only; never sent for a decoration. */
  expiryDate?: string;
}

export interface AdjustBatchInput {
  /** Signed: + puts stock back into Available, − takes bad stock out. Never 0. */
  quantity: number;
  /** Why the stock changed: damage, a miscount, an intact return. Required. */
  note: string;
}

const FIELD_LABELS: Record<string, string> = {
  materialId: "Nguyên liệu",
  quantity: "Số lượng",
  unitCost: "Giá nhập",
  receivedDate: "Ngày nhận",
  expiryDate: "Hạn sử dụng",
  note: "Ghi chú",
};

function fieldMessage({ field, rule }: ValidationFieldError) {
  const label = FIELD_LABELS[field] ?? "Thông tin";
  if (rule === "NotNull" && field === "expiryDate") return "Lô hoa phải có hạn sử dụng.";
  if (rule === "NotNull") return `${label} là bắt buộc.`;
  if (field === "quantity" && rule === "Positive") return `${label} phải lớn hơn 0.`;
  if (field === "quantity" && rule === "Digits") return `${label} tối đa 2 chữ số thập phân.`;
  if (field === "quantity" && rule === "NonZero") return `${label} điều chỉnh phải khác 0.`;
  if (field === "quantity" && rule === "AvailableNotNegative") return "Không thể giảm nhiều hơn số lượng còn sẵn của lô.";
  if (field === "note" && rule === "NotBlank") return "Ghi chú lý do điều chỉnh là bắt buộc.";
  if (field === "note" && rule === "Size") return `${label} tối đa 1000 ký tự.`;
  if (field === "quantity" && rule === "UnitOfMeasure") return "Chỉ nguyên liệu tính theo mét mới được nhập số lẻ.";
  if (field === "unitCost" && rule === "PositiveOrZero") return `${label} không được âm.`;
  if (field === "unitCost" && rule === "Digits") return `${label} phải là số VND nguyên, tối đa 12 chữ số.`;
  if (field === "receivedDate" && rule === "PastOrPresent") return `${label} không được ở tương lai.`;
  if (field === "expiryDate" && rule === "NotBeforeReceivedDate") return `${label} không được trước ngày nhận.`;
  if (field === "expiryDate" && rule === "NotExpired") return "Lô hàng này đã hết hạn.";
  if (field === "expiryDate" && rule === "Null") return "Lô trang trí không có hạn sử dụng.";
  return `${label} chưa hợp lệ.`;
}

const receiveErrors: ErrorMessages = {
  codes: {
    MATERIAL_DEACTIVATED: "Nguyên liệu này đã ngừng sử dụng. Hãy kích hoạt lại hoặc chọn nguyên liệu khác.",
    MATERIAL_NOT_FOUND: "Không tìm thấy nguyên liệu. Danh sách nguyên liệu đã được làm mới.",
  },
  fields: (fields) => groupFieldErrors(fields, fieldMessage),
};

/** Records a delivery: a new batch, fully Available, with its RECEIVED ledger row. */
export function receiveBatch(input: ReceiveBatchInput) {
  return api<MaterialBatch>("/api/manage/inventory/batches", {
    method: "POST",
    body: input,
    errors: receiveErrors,
  });
}

const adjustErrors: ErrorMessages = {
  codes: {
    BATCH_NOT_FOUND: "Không tìm thấy lô hàng. Danh sách lô đã được làm mới.",
  },
  fields: (fields) => groupFieldErrors(fields, fieldMessage),
};

/** Raises or lowers one batch's Available quantity, recorded as an ADJUSTED ledger row. */
export function adjustBatch(batchId: string, input: AdjustBatchInput) {
  return api<MaterialBatch>(path`/api/manage/inventory/batches/${batchId}/adjustments`, {
    method: "POST",
    body: input,
    errors: adjustErrors,
  });
}

/** One page of batches, newest received first; optionally one material's only. */
export function listBatches(query: { page: number; size: number; materialId?: string }) {
  return api<Page<MaterialBatch>>(withQuery("/api/manage/inventory/batches", query));
}

/**
 * Stock against Orders waiting for preparation. Negative stock exists only in this answer, as a
 * display: batch counters never go below 0. An Order whose stock is already reserved needs nothing.
 */
export interface StockShortages {
  checkedAt: string;
  /** `left` = usable − needed, always negative. Sorted by material name. */
  shortMaterials: {
    materialId: string;
    materialName: string;
    materialType: MaterialType;
    unitOfMeasure: MaterialUnit;
    materialStatus: MaterialStatus;
    usable: number;
    needed: number;
    left: number;
    /** Oldest Order first; `shortBy` is what that Order still lacks of this material. */
    blockedOrders: { orderId: string; shortBy: number }[];
  }[];
  /** Enough today, short tomorrow once today's expiring batches are gone. */
  atRiskMaterials: {
    materialId: string;
    materialName: string;
    unitOfMeasure: MaterialUnit;
    needed: number;
    expiringToday: number;
    /** Negative. */
    leftTomorrow: number;
  }[];
  /** Every waiting Order, oldest first. */
  orders: OrderStock[];
}

export interface OrderStock {
  orderId: string;
  canPrepare: boolean;
  shortages: { materialId: string; materialName: string; unitOfMeasure: MaterialUnit; shortBy: number }[];
}

export function getStockShortages() {
  return api<StockShortages>("/api/manage/inventory/shortages");
}

/** One page of the stock ledger, newest first. */
export function listTransactions(query: { page: number; size: number }) {
  return api<Page<InventoryTransaction>>(withQuery("/api/manage/inventory/transactions", query));
}
