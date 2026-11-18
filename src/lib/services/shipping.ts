import { api, withQuery, type ErrorMessages } from "@/lib/api";

/**
 * GHN (Giao Hàng Nhanh) through the backend: the province → district → ward lists for the address
 * form, and a shipping-fee estimate for the whole Cart to one saved address. The GHN token stays on
 * the server.
 */

export interface Province { id: number; name: string }
export interface District { id: number; name: string }
export interface Ward { code: string; name: string }

export interface ShippingFeeQuote {
  /** Whole VND, GHN's current price; checkout charges the fee current at that moment. */
  shippingFee: number;
  itemCount: number;
  parcelWeightGrams: number;
}

const listErrors: ErrorMessages = {
  fallback: "Không tải được danh sách khu vực. Vui lòng thử lại.",
};

const quoteErrors: ErrorMessages = {
  codes: {
    CART_EMPTY: "Giỏ hàng đang trống.",
    ADDRESS_NOT_FOUND: "Không tìm thấy địa chỉ đã chọn.",
    VALIDATION_FAILED: "Địa chỉ chưa có phường/xã — hãy sửa địa chỉ để tính phí giao hàng.",
  },
  fallback: "Chưa tính được phí giao hàng lúc này.",
};

export const getProvinces = () => api<Province[]>("/api/shipping/provinces", { errors: listErrors });

export const getDistricts = (provinceId: number) =>
  api<District[]>(withQuery("/api/shipping/districts", { provinceId }), { errors: listErrors });

export const getWards = (districtId: number) =>
  api<Ward[]>(withQuery("/api/shipping/wards", { districtId }), { errors: listErrors });

export const quoteShippingFee = (addressId: string) =>
  api<ShippingFeeQuote>("/api/shipping/fee-quote", {
    method: "POST",
    body: { addressId },
    errors: quoteErrors,
  });
