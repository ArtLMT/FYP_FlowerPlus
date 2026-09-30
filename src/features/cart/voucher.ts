import type { Voucher } from "@/lib/types";
import { vouchers } from "@/lib/mock-data";
import { formatVND } from "@/lib/utils";

/**
 * Voucher logic — pure functions shared by the cart store and the voucher UI.
 *
 * The catalog of vouchers is mock data (lib/mock-data); this module is the one
 * place that knows how a voucher turns into money off. When a real backend
 * arrives, `findVoucher` becomes a fetch and the maths stays put.
 */

/** Look a code up in the catalog (case-insensitive, trimmed). */
export function findVoucher(code: string): Voucher | undefined {
  const c = code.trim().toUpperCase();
  return vouchers.find((v) => v.code.toUpperCase() === c);
}

export interface VoucherOutcome {
  /** VND taken off the subtotal (0 for a free-shipping voucher). */
  discount: number;
  /** Whether delivery should be free. */
  freeShipping: boolean;
}

/** What an applied voucher is worth against the current subtotal. */
export function computeVoucher(voucher: Voucher | null, subtotal: number): VoucherOutcome {
  if (!voucher || voucherError(voucher, subtotal)) return { discount: 0, freeShipping: false };
  switch (voucher.kind) {
    case "percent":
      return { discount: Math.round((subtotal * voucher.value) / 100), freeShipping: false };
    case "fixed":
      return { discount: Math.min(voucher.value, subtotal), freeShipping: false };
    case "shipping":
      return { discount: 0, freeShipping: true };
    default:
      return { discount: 0, freeShipping: false };
  }
}

/** Why a voucher can't be applied to this subtotal, or null if it's valid. */
export function voucherError(voucher: Voucher, subtotal: number): string | null {
  if (voucher.state !== "active") return "Mã đã hết hạn hoặc đã được sử dụng.";
  if (voucher.minSubtotal && subtotal < voucher.minSubtotal)
    return `Cần đơn tối thiểu ${formatVND(voucher.minSubtotal)} để dùng mã này.`;
  return null;
}
