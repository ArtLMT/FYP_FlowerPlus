import { api, groupFieldErrors, path, type ErrorMessages, type ValidationFieldError } from "@/lib/api";

export interface Category {
  id: string;
  name: string;
}

export const getCategories = (errors?: ErrorMessages) => api<Category[]>("/api/categories", { errors });

/* ── Staff/Admin management ──────────────────────── */

/** A category as the management API returns it, with its version for edits (ADR 0006). */
export interface ManagedCategory extends Category {
  version: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
}

function fieldMessage({ field, rule }: ValidationFieldError) {
  if (field === "name" && rule === "NotBlank") return "Tên danh mục là bắt buộc.";
  if (field === "name" && rule === "Size") return "Tên danh mục tối đa 100 ký tự.";
  return "Thông tin chưa hợp lệ.";
}

const CONFLICT = "Danh mục đã được thay đổi ở nơi khác. Danh sách đã được làm mới; hãy xem lại rồi thử lại.";
const GONE = "Danh mục không còn tồn tại. Danh sách đã được làm mới.";

const saveErrors: ErrorMessages = {
  codes: {
    CATEGORY_NAME_EXISTS: "Tên danh mục này đã được sử dụng.",
    CONCURRENT_MODIFICATION: CONFLICT,
    NOT_FOUND: GONE,
  },
  fields: (fields) => groupFieldErrors(fields, fieldMessage),
};

const deleteErrors: ErrorMessages = {
  codes: {
    // BR-PROD-15: an Active product must keep at least one category.
    PRODUCT_CATEGORY_IN_USE: (error) => {
      const count = Array.isArray(error.details.productIds) ? error.details.productIds.length : 0;
      return `Không thể xóa: ${count || "một số"} sản phẩm đang bán chỉ có danh mục này. Hãy gán thêm danh mục khác cho các sản phẩm đó trước.`;
    },
    CONCURRENT_MODIFICATION: CONFLICT,
    NOT_FOUND: GONE,
  },
};

export const listManagedCategories = () =>
  api<ManagedCategory[]>("/api/manage/categories", { errors: { fallback: "Không thể tải danh mục." } });

/** Creates a category, or renames `existing` (with its version, so concurrent edits are caught). */
export function saveCategory(existing: ManagedCategory | null, name: string) {
  return existing
    ? api<ManagedCategory>(path`/api/manage/categories/${existing.id}`, {
      method: "PUT",
      body: { name: name.trim(), version: existing.version },
      errors: saveErrors,
    })
    : api<ManagedCategory>("/api/manage/categories", { method: "POST", body: { name: name.trim() }, errors: saveErrors });
}

/** Deletes a category; products keep their other categories (BR-PROD-15 guards Active ones). */
export const deleteCategory = (category: ManagedCategory) =>
  api<void>(path`/api/manage/categories/${category.id}`, {
    method: "DELETE",
    body: { version: category.version },
    errors: deleteErrors,
  });
