import type { ManagedProduct, ManagedProductStatus } from "@/lib/services/managed-products";

/** How products are named and formatted on the admin screens. */

export const PRODUCT_STATUS_LABELS: Record<ManagedProductStatus, string> = {
  ACTIVE: "Đang bán",
  DRAFT: "Bản nháp",
  DEACTIVATED: "Đã ngừng bán",
};

export const PRODUCT_STATUS_STYLES: Record<ManagedProductStatus, string> = {
  ACTIVE: "bg-accent-sage-light/60 text-[#465d40]",
  DRAFT: "bg-[#F5E9CF] text-[#805119]",
  DEACTIVATED: "bg-[#F0DEDA] text-[#8A4640]",
};

export function formatMoney(value: number | null) {
  return value == null
    ? "Chưa đặt"
    : new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(value) + " ₫";
}

export function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
  }).format(date);
}

/** "3f2a9c1e-…-…-…-1b2c" → "3f2a9c1e…1b2c" */
export function shortId(value: string | null) {
  return value ? `${value.slice(0, 8)}…${value.slice(-4)}` : "—";
}

export function productTypeLabel(value: ManagedProduct["type"]) {
  return value === "PRE_MADE" ? "Làm sẵn" : "Đặt trước";
}

export function productSetupSummary(product: ManagedProduct) {
  return `Công thức: ${product.recipe.length} nguyên liệu · Ảnh: ${product.images.length}`;
}
