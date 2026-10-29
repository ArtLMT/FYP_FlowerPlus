import {
  api,
  groupFieldErrors,
  onAnyError,
  path,
  withQuery,
  type ErrorMessages,
  type Page,
  type ValidationFieldError,
} from "@/lib/api";
import { getCategories } from "@/lib/services/categories";
import { listMaterials, type Material, type MaterialStatus, type MaterialType, type MaterialUnit } from "@/lib/services/materials";

/** Staff/Admin product management: drafts, edits, images and the Draft → Active lifecycle. */

export type ManagedProductType = "PRE_ORDER" | "PRE_MADE";
export type ManagedProductStatus = "DRAFT" | "ACTIVE" | "DEACTIVATED";

export interface RecipeLine {
  materialId: string;
  materialName: string;
  materialType: MaterialType;
  materialUnit: MaterialUnit;
  materialStatus: MaterialStatus;
  quantityRequired: number;
}

export interface ManagedProduct {
  id: string;
  name: string;
  description: string | null;
  basePrice: number | null;
  type: ManagedProductType;
  status: ManagedProductStatus;
  version: number;
  recipe: RecipeLine[];
  categories: Array<{ id: string; name: string }>;
  /** Sorted by display order; the first one is the main image. */
  images: Array<{ id: string; contentUrl: string; displayOrder: number }>;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
}

export interface ManagedProductInput {
  name: string;
  type: ManagedProductType;
  description: string | null;
  basePrice: number | null;
  categoryIds: string[];
  recipe: Array<{ materialId: string; quantityRequired: number }>;
}

/* ── Image rules (mirrors the backend) ───────────── */

export const MAX_PRODUCT_IMAGES = 5;
export const IMAGE_ACCEPT = ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp";
const MAX_IMAGE_BYTES = 2_000_000;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

/** Why these files cannot be added (too many, wrong type, too large), or null when they can. */
export function imageSelectionError(files: File[], slotsLeft: number, verb: "add" | "choose"): string | null {
  if (files.length > slotsLeft) return `Bạn chỉ có thể ${verb === "add" ? "thêm" : "chọn"} thêm ${slotsLeft} ảnh.`;
  const invalid = files.find((file) => !IMAGE_TYPES.has(file.type) && !/\.(jpe?g|png|webp)$/i.test(file.name));
  if (invalid) return `${invalid.name} không phải ảnh JPG, PNG hoặc WebP.`;
  const oversized = files.find((file) => file.size > MAX_IMAGE_BYTES);
  if (oversized) return `${oversized.name} lớn hơn 2 MB.`;
  return null;
}

/* ── Error wording ───────────────────────────────── */

/** What a product needs before it can be activated, keyed by the backend field it is reported on. */
export const ACTIVATION_REQUIREMENTS: Record<string, string> = {
  name: "Tên sản phẩm (tối đa 255 ký tự)",
  description: "Mô tả (tối đa 5.000 ký tự)",
  basePrice: "Giá bán gốc là số VND nguyên dương",
  categoryIds: "Ít nhất một danh mục",
  recipe: "Ít nhất một dòng công thức hợp lệ",
  images: "Ít nhất một ảnh đã tải lên",
};

const PERMISSION_DENIED = "Tài khoản của bạn không có quyền quản lý sản phẩm.";

const IMAGE_CODES = {
  PRODUCT_IMAGE_INVALID: "Vui lòng chọn ảnh JPG, PNG hoặc WebP hợp lệ.",
  PRODUCT_IMAGE_TOO_LARGE: "Mỗi ảnh phải nhỏ hơn hoặc bằng 2 MB.",
  PRODUCT_IMAGE_LIMIT_REACHED: "Mỗi sản phẩm có tối đa năm ảnh.",
};

/** "recipe[0].quantityRequired" → "recipe" */
const rootField = (field: string) => field.split(/[.[\]]/)[0];

function activationIssue({ field, rule }: ValidationFieldError) {
  return ACTIVATION_REQUIREMENTS[rootField(field)]
    ?? (rule === "ActivationRequirement" ? "Một yêu cầu hợp lệ của sản phẩm" : "Kiểm tra lại thông tin sản phẩm");
}

/** Wording for actions on an existing product; `action` names it in the fallback ("Mở bán không thành công…"). */
const actionErrors = (action: string): ErrorMessages => ({
  network: "Không thể kết nối FlowerPlus. Vui lòng thử lại.",
  status: {
    403: PERMISSION_DENIED,
    404: "Thao tác sản phẩm này chưa được hỗ trợ ở máy chủ.",
  },
  codes: {
    CONCURRENT_MODIFICATION: "Sản phẩm đã được thay đổi ở nơi khác. Cần tải lại dữ liệu mới nhất trước khi thử lại.",
    PRODUCT_INVALID_STATE: "Trạng thái sản phẩm đã thay đổi. Vui lòng tải lại và xem trạng thái hiện tại.",
    ...IMAGE_CODES,
    PRODUCT_IMAGE_REQUIRED: "Sản phẩm đang bán phải giữ ít nhất một ảnh.",
    VALIDATION_FAILED: (error) => error.fieldMessages.length
      ? `Vui lòng kiểm tra: ${error.fieldMessages.join("; ")}.`
      : "Vui lòng kiểm tra các yêu cầu của sản phẩm và thử lại.",
  },
  fallback: `${action} không thành công. Vui lòng thử lại.`,
  fields: (fields) => groupFieldErrors(fields, activationIssue),
});

const FORM_FIELD_MESSAGES: Record<string, string> = {
  name: "Nhập tên sản phẩm không để trống, tối đa 255 ký tự.",
  description: "Nhập mô tả không để trống, tối đa 5.000 ký tự.",
  basePrice: "Nhập giá bán gốc là số VND nguyên dương, tối đa 12 chữ số.",
  categoryIds: "Chọn ít nhất một danh mục hợp lệ.",
  recipe: "Thêm ít nhất một dòng công thức hợp lệ với số lượng lớn hơn 0.",
  images: "Giữ ít nhất một ảnh sản phẩm hợp lệ.",
  type: "Chọn loại sản phẩm.",
};

const formErrors = (editing: boolean): ErrorMessages => ({
  network: "Không thể kết nối FlowerPlus. Vui lòng kiểm tra kết nối máy chủ và thử lại.",
  status: {
    401: `Vui lòng đăng nhập bằng tài khoản Nhân viên hoặc Quản trị để ${editing ? "sửa" : "tạo"} sản phẩm.`,
    403: PERMISSION_DENIED,
  },
  codes: {
    PRODUCT_RECIPE_MATERIAL_INACTIVE: "Một nguyên liệu đã chọn không còn hoạt động. Vui lòng tải lại và kiểm tra công thức.",
    CONCURRENT_MODIFICATION: "Sản phẩm đã được thay đổi ở nơi khác. Hãy đóng biểu mẫu, xem phiên bản hiện tại và thử lại.",
    PRODUCT_INVALID_STATE: "Trạng thái sản phẩm đã thay đổi. Hãy đóng biểu mẫu và xem trạng thái hiện tại.",
    PRODUCT_RECIPE_STOCK_CONFLICT: "Không thể đổi công thức khi vẫn còn sản phẩm làm sẵn đang có sẵn hoặc đã được giữ chỗ.",
    SALE_PRICE_CONFLICT: "Giá bán gốc này sẽ làm chương trình giảm giá đang chạy hoặc đã lên lịch không còn hợp lệ.",
    VALIDATION_FAILED: "Một số thông tin chưa hợp lệ. Vui lòng kiểm tra các trường bên dưới và thử lại.",
  },
  fallback: `Không thể ${editing ? "lưu" : "tạo"} sản phẩm. Vui lòng kiểm tra thông tin và thử lại.`,
  fields: (fields) => groupFieldErrors(fields, ({ field }) => FORM_FIELD_MESSAGES[rootField(field)] ?? "Vui lòng kiểm tra trường này."),
});

const draftImageErrors: ErrorMessages = {
  network: "Bản nháp đã được tạo nhưng chưa tải được ảnh lên. Vui lòng thử lại.",
  codes: {
    ...IMAGE_CODES,
    CONCURRENT_MODIFICATION: "Sản phẩm đã thay đổi trong khi đang tải ảnh. Hãy mở sản phẩm đã tạo và tải lại.",
  },
  fallback: "Bản nháp đã được tạo nhưng một ảnh chưa tải lên được. Vui lòng thử lại.",
};

/* ── Reads ───────────────────────────────────────── */

const withSortedImages = (product: ManagedProduct): ManagedProduct => ({
  ...product,
  images: [...product.images].sort((left, right) => left.displayOrder - right.displayOrder),
});

/** Every product matching `search` (all pages), newest first as the backend orders them. */
export async function listAllManagedProducts(search: string): Promise<ManagedProduct[]> {
  const errors: ErrorMessages = {
    ...onAnyError("Không thể tải danh sách sản phẩm. Vui lòng kiểm tra kết nối máy chủ và thử lại."),
    status: { 403: PERMISSION_DENIED },
  };
  const fetchPage = (page: number) => api<Page<ManagedProduct>>(
    withQuery("/api/manage/products", { page, size: 100, search: search.trim() }),
    { errors },
  );
  const first = await fetchPage(0);
  const rest = await Promise.all(
    Array.from({ length: Math.max(0, first.totalPages - 1) }, (_, index) => fetchPage(index + 1)),
  );
  return [first, ...rest].flatMap((page) => page.content).map(withSortedImages);
}

const fetchProduct = (id: string, errors: ErrorMessages) =>
  api<ManagedProduct>(path`/api/manage/products/${id}`, { errors }).then(withSortedImages);

export const getManagedProduct = (id: string) =>
  fetchProduct(id, onAnyError("Không thể tải chi tiết sản phẩm."));

/** Re-reads a product after a conflict, so the next action uses its current version. */
export const refreshManagedProduct = (id: string) =>
  fetchProduct(id, onAnyError("Không thể tải lại sản phẩm. Vui lòng tải lại trước khi thử đổi trạng thái lần nữa."));

export const getProductCategories = () =>
  getCategories(onAnyError("Không thể tải danh mục; bạn vẫn có thể lưu khi chưa chọn danh mục."));

/** Up to eight Active materials whose name matches, for adding to a recipe. */
export async function searchRecipeMaterials(search: string): Promise<Material[]> {
  const page = await listMaterials(
    { page: 0, size: 8, search, status: "ACTIVE", sort: "NAME_ASC" },
    onAnyError("Không thể tải nguyên liệu đang hoạt động. Hãy thử lại hoặc lưu bản nháp khi chưa có công thức."),
  );
  return page.content;
}

/* ── Writes ──────────────────────────────────────── */

/** Creates a Draft, or saves changes to `existing`. */
export function saveManagedProduct(existing: ManagedProduct | undefined, input: ManagedProductInput) {
  const errors = formErrors(existing !== undefined);
  const request = existing
    ? api<ManagedProduct>(path`/api/manage/products/${existing.id}`, {
      method: "PUT",
      body: { ...input, version: existing.version },
      errors,
    })
    : api<ManagedProduct>("/api/manage/products", { method: "POST", body: input, errors });
  return request.then(withSortedImages);
}

function postImage(product: ManagedProduct, file: File, errors: ErrorMessages) {
  const body = new FormData();
  body.append("file", file);
  return api<ManagedProduct>(
    withQuery(path`/api/manage/products/${product.id}/images`, { version: product.version }),
    { method: "POST", body, errors },
  ).then(withSortedImages);
}

export const uploadProductImage = (product: ManagedProduct, file: File) =>
  postImage(product, file, actionErrors("Tải ảnh lên"));

/** Uploads an image chosen while creating the Draft (worded for that flow). */
export const uploadDraftImage = (product: ManagedProduct, file: File) =>
  postImage(product, file, draftImageErrors);

export const reorderProductImages = (product: ManagedProduct, imageIds: string[]) =>
  api<ManagedProduct>(path`/api/manage/products/${product.id}/images/order`, {
    method: "PUT",
    body: { version: product.version, imageIds },
    errors: actionErrors("Sắp xếp ảnh"),
  }).then(withSortedImages);

export const removeProductImage = (product: ManagedProduct, imageId: string) =>
  api<ManagedProduct>(
    withQuery(path`/api/manage/products/${product.id}/images/${imageId}`, { version: product.version }),
    { method: "DELETE", errors: actionErrors("Xóa ảnh") },
  ).then(withSortedImages);

const changeStatus = (product: ManagedProduct, action: "activate" | "deactivate" | "draft", label: string) =>
  api<ManagedProduct>(path`/api/manage/products/${product.id}/${action}`, {
    method: "POST",
    body: { version: product.version },
    errors: actionErrors(label),
  }).then(withSortedImages);

export const activateProduct = (product: ManagedProduct) => changeStatus(product, "activate", "Mở bán");
export const deactivateProduct = (product: ManagedProduct) => changeStatus(product, "deactivate", "Ngừng bán");
export const returnProductToDraft = (product: ManagedProduct) => changeStatus(product, "draft", "Chuyển về bản nháp");
