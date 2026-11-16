import { api, withQuery, type Page } from "@/lib/api";

export type VoucherAudience = "PUBLIC" | "ASSIGNED";
export type VoucherStatus = "ACTIVE" | "INACTIVE";
export type VoucherState = "ACTIVE" | "INACTIVE" | "UPCOMING" | "EXHAUSTED" | "EXPIRED";
export type VoucherDiscountType = "FIXED" | "PERCENTAGE";

export interface UsableVoucher {
  id: string;
  code: string;
  discountType: VoucherDiscountType;
  discountValue: number;
  minimumOrderAmount: number;
  expiresAt: string;
}

export interface VoucherPreview {
  code: string;
  discountType: VoucherDiscountType;
  discountValue: number;
  eligibleSubtotal: number;
  minimumOrderAmount: number;
  discountAmount: number;
  shippingFee: number;
  payableTotal: number;
  expiresAt: string;
}

export interface ManagedVoucher extends UsableVoucher {
  audience: VoucherAudience;
  activeFrom: string;
  status: VoucherStatus;
  state: VoucherState;
  version: number;
  maxRedemptions: number;
  totalRedemptions: number;
  unreleasedRedemptions: number;
  assignedEmails: string[];
}

const voucherErrors = { codes: {
  VOUCHER_NOT_APPLICABLE: "Mã giảm giá không áp dụng cho giỏ hàng này.",
  VOUCHER_LIMIT_REACHED: "Mã giảm giá đã hết lượt sử dụng.",
  VOUCHER_INVALID_STATE: "Trạng thái mã giảm giá đã thay đổi. Hãy tải lại.",
} };

export const listUsableVouchers = () => api<UsableVoucher[]>("/api/vouchers");
export const previewVoucher = (code: string) => api<VoucherPreview>("/api/cart/voucher-preview", {
  method: "POST", body: { code }, errors: voucherErrors,
});
export const listManagedVouchers = () => api<Page<ManagedVoucher>>(withQuery("/api/manage/vouchers", { page: 0, size: 100 }));
export const createManagedVoucher = (input: Record<string, unknown>) => api<ManagedVoucher>("/api/manage/vouchers", { method: "POST", body: input, errors: voucherErrors });
export const updateManagedVoucher = (id: string, input: Record<string, unknown>) => api<ManagedVoucher>(`/api/manage/vouchers/${id}`, { method: "PUT", body: input, errors: voucherErrors });
export const setManagedVoucherActive = (id: string, version: number, active: boolean) => api<ManagedVoucher>(`/api/manage/vouchers/${id}/${active ? "activate" : "deactivate"}`, { method: "POST", body: { version }, errors: voucherErrors });
export const assignManagedVoucher = (id: string, email: string) => api<{ email: string; matched: boolean; assigned: boolean }>(`/api/manage/vouchers/${id}/assignments`, { method: "POST", body: { email }, errors: voucherErrors });
