import type { MaterialSort, MaterialStatus, MaterialType, MaterialUnit } from "@/lib/services/materials";

/** How materials are named on the admin screens. */

export const MATERIAL_TYPE_LABELS: Record<MaterialType, string> = { FLOWER: "Hoa", DECORATION: "Trang trí" };

export const MATERIAL_UNIT_LABELS: Record<MaterialUnit, string> = {
  STEM: "Cành",
  PIECE: "Chiếc",
  METRE: "Mét",
  SHEET: "Tờ",
};

export const MATERIAL_SORT_OPTIONS: { value: MaterialSort; label: string }[] = [
  { value: "NAME_ASC", label: "Tên A–Z" },
  { value: "NAME_DESC", label: "Tên Z–A" },
  { value: "PRICE_ASC", label: "Giá tăng dần" },
  { value: "PRICE_DESC", label: "Giá giảm dần" },
  { value: "CREATED_NEWEST", label: "Mới tạo trước" },
  { value: "CREATED_OLDEST", label: "Cũ tạo trước" },
];

export const materialStatusLabel = (status: MaterialStatus) =>
  status === "ACTIVE" ? "Đang hoạt động" : "Đã ngừng";

/** 12000 → "12.000 ₫" */
export const formatMaterialPrice = (price: number) => `${Number(price).toLocaleString("vi-VN")} ₫`;
