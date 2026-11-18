import { api, withQuery, type Page } from "@/lib/api";
import { groupFieldErrors, type ErrorMessages, type ValidationFieldError } from "@/lib/api/errors";

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
  /** Goods total after the voucher, before shipping; checkout adds GHN's fee for the chosen address. */
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

/** Vietnamese wording for each voucher field the backend can reject. */
function voucherFieldMessage({ field, rule }: ValidationFieldError): string {
  switch (field) {
    case "code":
      if (rule === "Unique") return "Mã voucher này đã được dùng.";
      if (rule === "Pattern") return "Mã voucher chỉ gồm chữ cái và chữ số.";
      if (rule === "Size") return "Mã voucher tối đa 100 ký tự.";
      return "Hãy nhập mã voucher.";
    case "discountType": return "Hãy chọn loại giảm giá.";
    case "discountValue":
      return rule === "Range" ? "Giảm theo phần trăm phải từ 1 đến 100." : "Giá trị giảm phải là số nguyên lớn hơn 0.";
    case "minimumOrderAmount": return "Đơn tối thiểu phải là số nguyên từ 0 trở lên.";
    case "maxRedemptions": return "Giới hạn lượt phải lớn hơn 0.";
    case "activeFrom": return "Hãy chọn thời điểm bắt đầu.";
    case "expiresOn":
      return rule === "AfterStart" ? "Ngày hết hạn phải sau thời điểm bắt đầu." : "Hãy chọn ngày hết hạn.";
    case "audience": return "Hãy chọn đối tượng áp dụng.";
    case "email": return "Email không hợp lệ.";
    default: return "Một trường thông tin chưa hợp lệ.";
  }
}

const voucherErrors: ErrorMessages = {
  codes: {
    VOUCHER_NOT_APPLICABLE: "Mã giảm giá không áp dụng cho giỏ hàng này.",
    VOUCHER_LIMIT_REACHED: "Mã giảm giá đã hết lượt sử dụng.",
    VOUCHER_INVALID_STATE: "Trạng thái mã giảm giá đã thay đổi. Hãy tải lại.",
    CONCURRENT_MODIFICATION: "Mã giảm giá vừa được người khác cập nhật. Hãy tải lại rồi thử lại.",
    VALIDATION_FAILED: (error) => error.fieldMessages.join(" ") || "Một số thông tin chưa hợp lệ.",
  },
  fields: (fields) => groupFieldErrors(fields, voucherFieldMessage),
};

export const listUsableVouchers = () => api<UsableVoucher[]>("/api/vouchers");
export const previewVoucher = (code: string) => api<VoucherPreview>("/api/cart/voucher-preview", {
  method: "POST", body: { code }, errors: voucherErrors,
});
export const listManagedVouchers = () => api<Page<ManagedVoucher>>(withQuery("/api/manage/vouchers", { page: 0, size: 100 }));
export const createManagedVoucher = (input: Record<string, unknown>) => api<ManagedVoucher>("/api/manage/vouchers", { method: "POST", body: input, errors: voucherErrors });
export const updateManagedVoucher = (id: string, input: Record<string, unknown>) => api<ManagedVoucher>(`/api/manage/vouchers/${id}`, { method: "PUT", body: input, errors: voucherErrors });
export const setManagedVoucherActive = (id: string, version: number, active: boolean) => api<ManagedVoucher>(`/api/manage/vouchers/${id}/${active ? "activate" : "deactivate"}`, { method: "POST", body: { version }, errors: voucherErrors });
export const assignManagedVoucher = (id: string, email: string) => api<{ email: string; matched: boolean; assigned: boolean }>(`/api/manage/vouchers/${id}/assignments`, { method: "POST", body: { email }, errors: voucherErrors });
