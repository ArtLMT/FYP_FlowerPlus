/**
 * Domain types.
 *
 * These are placeholder shapes for the mock data — the fields the UI needs.
 * When a real backend arrives, reconcile these in ONE place and TypeScript
 * flags every screen that drifts. TODO(domain): confirm shapes with the API.
 */

/* ── Catalog ─────────────────────────────────────── */

export type StockStatus = "IN STOCK" | "LOW STOCK" | "OUT OF STOCK";
export type Occasion = "Birthdays" | "Weddings" | "Everyday" | "Sympathy";

/**
 * How the arrangement is presented. Stored as a stable key (clean URLs /
 * backend-friendly); the Vietnamese label lives in the catalog filter config.
 */
export type DecorationType = "bouquet" | "basket" | "box" | "vase" | "stand";

/** A product in the catalog / grids. */
export interface Product {
  id: string;
  name: string;
  /** Comma-separated list of floral materials (display copy) */
  materials: string;
  /** Structured flower types for filtering, e.g. ["Hồng", "Mẫu đơn"] */
  flowerTypes: string[];
  /** How the arrangement is presented (bouquet, box, …) */
  decorationType: DecorationType;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  imageUrl: string;
  /** Gallery for the detail page; the PDP falls back to [imageUrl] if absent. */
  images?: string[];
  stock: StockStatus;
  occasion?: Occasion;
}

/** A featured / on-sale item shown in the carousel + sale strip. */
export interface FeaturedItem {
  id: string;
  name: string;
  materials: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  imageUrl: string;
}

/* ── Account ─────────────────────────────────────── */

export type Gender = "female" | "male" | "other";

export interface User {
  id: string;
  username: string;
  fullName: string;
  /** Display value, already masked (e.g. "t****@email.com") */
  email: string;
  /** Display value, already masked (e.g. "***-***-5521") */
  phone: string;
  gender: Gender;
  dob: { day: number; month: string; year: number };
  avatarUrl?: string;
}

export interface Address {
  id: string;
  name: string;
  line1: string;
  line2: string;
  phone: string;
  isDefault: boolean;
}

/* ── Cart & checkout ─────────────────────────────── */

export interface CartItem {
  product: Product;
  qty: number;
  /** Whether the item is ticked for checkout */
  selected: boolean;
}

export type PaymentKind = "cod" | "bank";
export interface PaymentMethod {
  id: string;
  kind: PaymentKind;
  label: string;
  /** Material Symbols icon name */
  icon: string;
}

export interface DeliveryDate {
  key: string;
  label: string;
  /** show a calendar icon (the "pick a date" option) */
  calendar?: boolean;
}

/* ── Orders ──────────────────────────────────────── */

export type OrderStatus = "unpaid" | "processing" | "delivering" | "done" | "cancelled";

export interface OrderItem {
  name: string;
  materials?: string;
  qty: number;
  price: number;
  imageUrl: string;
}

export interface Order {
  id: string;
  date: string;
  status: OrderStatus;
  /** VN display label, e.g. "HOÀN TẤT" */
  statusLabel: string;
  items: OrderItem[];
  total: number;
}

export type TrackStepState = "done" | "current" | "todo";
export interface TrackStep {
  label: string;
  state: TrackStepState;
}
export interface TimelineEntry {
  time: string;
  text: string;
  active: boolean;
}
/** The "live order" tracker on the orders screen. */
export interface LiveOrder {
  id: string;
  steps: TrackStep[];
  timeline: TimelineEntry[];
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
