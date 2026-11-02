import {
  api,
  groupFieldErrors,
  path,
  withQuery,
  type ErrorMessages,
  type Page,
  type ValidationFieldError,
} from "@/lib/api";

/** Staff/Admin management of the materials used in product recipes. */

export type MaterialType = "FLOWER" | "DECORATION";
export type MaterialUnit = "STEM" | "PIECE" | "METRE" | "SHEET";
export type MaterialStatus = "ACTIVE" | "DEACTIVATED";
export type MaterialSort =
  | "NAME_ASC"
  | "NAME_DESC"
  | "PRICE_ASC"
  | "PRICE_DESC"
  | "CREATED_NEWEST"
  | "CREATED_OLDEST";

export interface Material {
  id: string;
  name: string;
  type: MaterialType;
  unitOfMeasure: MaterialUnit;
  sellingPrice: number;
  status: MaterialStatus;
  version: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
}

/** The editor's values; the price stays "" until something is typed. */
export interface MaterialForm {
  name: string;
  type: MaterialType;
  unitOfMeasure: MaterialUnit;
  sellingPrice: number | "";
}

export interface MaterialQuery {
  page: number;
  size: number;
  search?: string;
  type?: MaterialType;
  status?: MaterialStatus;
  sort: MaterialSort;
}

const FIELD_LABELS: Record<string, string> = {
  name: "Tên nguyên liệu",
  type: "Loại",
  unitOfMeasure: "Đơn vị",
  sellingPrice: "Giá bán",
};

function fieldMessage({ field, rule }: ValidationFieldError) {
  const label = FIELD_LABELS[field] ?? "Thông tin";
  if (field === "name" && rule === "NotBlank") return `${label} là bắt buộc.`;
  if (field === "name" && rule === "Size") return `${label} tối đa 100 ký tự.`;
  if (field === "sellingPrice" && rule === "Min") return `${label} phải lớn hơn 0.`;
  if (field === "sellingPrice" && rule === "Digits") return `${label} phải là số VND nguyên, tối đa 12 chữ số.`;
  return `${label} chưa hợp lệ.`;
}

const saveErrors: ErrorMessages = { fields: (fields) => groupFieldErrors(fields, fieldMessage) };

const fetchPage = (query: MaterialQuery, errors?: ErrorMessages) =>
  api<Page<Material>>(withQuery("/api/manage/materials", {
    page: query.page,
    size: query.size,
    sort: query.sort,
    search: query.search?.trim(),
    type: query.type,
    status: query.status,
  }), { errors });

/** One page of materials. If that page no longer exists (items were removed), the last page instead. */
export async function listMaterials(query: MaterialQuery, errors?: ErrorMessages): Promise<Page<Material>> {
  const result = await fetchPage(query, errors);
  const lastPage = result.totalPages - 1;
  return result.totalPages > 0 && query.page > lastPage
    ? fetchPage({ ...query, page: lastPage }, errors)
    : result;
}

export const getMaterial = (id: string) => api<Material>(path`/api/manage/materials/${id}`);

/** Creates a material, or updates `existing` (with its version, so concurrent edits are caught). */
export function saveMaterial(existing: Material | null, form: MaterialForm) {
  const body = {
    name: form.name.trim(),
    type: form.type,
    unitOfMeasure: form.unitOfMeasure,
    sellingPrice: Number(form.sellingPrice),
  };
  return existing
    ? api<Material>(path`/api/manage/materials/${existing.id}`, {
      method: "PUT",
      body: { ...body, version: existing.version },
      errors: saveErrors,
    })
    : api<Material>("/api/manage/materials", { method: "POST", body, errors: saveErrors });
}

/** Deactivates an Active material, or reactivates a deactivated one. */
export function toggleMaterialStatus(material: Material) {
  const action = material.status === "ACTIVE" ? "deactivate" : "reactivate";
  return api<Material>(path`/api/manage/materials/${material.id}/${action}`, {
    method: "PUT",
    body: { version: material.version },
  });
}
