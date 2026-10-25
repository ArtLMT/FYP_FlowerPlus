/**
 * Shapes of the mock data in lib/mock-data, for screens whose backend does not exist yet.
 *
 * Types for real API responses live next to the service that fetches them (lib/services/*).
 * When one of these screens gets a backend, move its type into that service.
 */

/** A featured / on-sale item shown in the sale strip. */
export interface FeaturedItem {
  id: string;
  name: string;
  materials: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  imageUrl: string;
}

/* ── Vouchers & notifications ────────────────────── */

export type VoucherState = "active" | "used" | "expired";

/**
 * How a voucher reduces the bill:
 * - "percent"  → `value`% off the subtotal
 * - "fixed"    → `value` VND off the subtotal
 * - "shipping" → free delivery (`value` ignored)
 */
export type VoucherKind = "percent" | "fixed" | "shipping";

export interface Voucher {
  code: string;
  /** Headline, e.g. "Giảm 50%" */
  amount: string;
  tag: string;
  desc: string;
  validUntil: string;
  state: VoucherState;
  /** How the discount is computed. */
  kind: VoucherKind;
  /** Percent (0–100) for "percent", VND off for "fixed"; ignored for "shipping". */
  value: number;
  /** Minimum subtotal (VND) required to apply the voucher. */
  minSubtotal?: number;
}

export type NotificationKind = "order" | "voucher" | "account";
export interface Notification {
  id: string;
  kind: NotificationKind;
  /** Uppercase category label */
  cat: string;
  title: string;
  body: string;
  time: string;
  unread: boolean;
}
