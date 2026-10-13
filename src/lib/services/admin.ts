import { api } from "@/lib/api";

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface AdminStaff {
  id: string;
  username: string;
  email: string;
  role: "ADMIN" | "STAFF" | "CUSTOMER";
  status: "PENDING" | "ACTIVE" | "SUSPENDED" | "BANNED";
  provider: string;
  fullName: string | null;
  phone: string | null;
  avatar: string | null;
}

export interface AdminAddress {
  id: string;
  receiverName: string;
  phone: string;
  address: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminMaterial {
  id: string;
  name: string;
  type: "FLOWER" | "DECORATION";
  unitOfMeasure: MaterialUnit;
  sellingPrice: number;
  status: "ACTIVE" | "DEACTIVATED";
  version: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
}

export type MaterialUnit = "STEM" | "PIECE" | "METRE" | "SHEET";
export type MaterialType = AdminMaterial["type"];
export type MaterialStatus = AdminMaterial["status"];
export type MaterialSort =
  | "NAME_ASC"
  | "NAME_DESC"
  | "PRICE_ASC"
  | "PRICE_DESC"
  | "CREATED_NEWEST"
  | "CREATED_OLDEST";

export interface MaterialInput {
  name: string;
  type: MaterialType;
  unitOfMeasure: MaterialUnit;
  sellingPrice: number;
}

export type ManagedProductType = "PRE_ORDER" | "PRE_MADE";
export type ManagedProductStatus = "DRAFT" | "ACTIVE" | "DEACTIVATED";

export interface ManagedProduct {
  id: string;
  name: string;
  description: string | null;
  basePrice: number | null;
  type: ManagedProductType;
  status: ManagedProductStatus;
  version: number;
  recipe: Array<{
    materialId: string;
    materialName: string;
    materialType: MaterialType;
    materialUnit: MaterialUnit;
    materialStatus: MaterialStatus;
    quantityRequired: number;
  }>;
  categories: Array<{ id: string; name: string }>;
  images: Array<{ id: string; contentUrl: string; displayOrder: number }>;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
}

export interface ManagedProductQuery {
  page?: number;
  size?: number;
  search?: string;
}

export interface CreateManagedProductInput {
  name: string;
  type: ManagedProductType;
  description: string | null;
  basePrice: number | null;
  categoryIds: string[];
  recipe: Array<{ materialId: string; quantityRequired: number }>;
}

export interface UpdateManagedProductInput extends CreateManagedProductInput {
  version: number;
}

export interface MaterialQuery {
  page?: number;
  size?: number;
  search?: string;
  type?: MaterialType;
  status?: MaterialStatus;
  sort?: MaterialSort;
}

export const listStaff = (page = 0, size = 20) =>
  api<PageResponse<AdminStaff>>(`/api/admin/staff?page=${page}&size=${size}`);

export const getAdminAddress = (id: string) =>
  api<AdminAddress>(`/api/admin/addresses/${encodeURIComponent(id)}`);

export const listManagedProducts = ({ page = 0, size = 100, search }: ManagedProductQuery = {}) => {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  if (search?.trim()) params.set("search", search.trim());
  return api<PageResponse<ManagedProduct>>(`/api/manage/products?${params.toString()}`);
};

export const createManagedProduct = (input: CreateManagedProductInput) =>
  api<ManagedProduct>("/api/manage/products", {
    method: "POST",
    body: JSON.stringify(input),
  });

export const getManagedProduct = (id: string) =>
  api<ManagedProduct>(`/api/manage/products/${encodeURIComponent(id)}`);

export const updateManagedProduct = (product: ManagedProduct, input: Omit<UpdateManagedProductInput, "version">) =>
  api<ManagedProduct>(`/api/manage/products/${encodeURIComponent(product.id)}`, {
    method: "PUT",
    body: JSON.stringify({ ...input, version: product.version }),
  });

export const uploadManagedProductImage = (product: ManagedProduct, file: File) => {
  const body = new FormData();
  body.append("file", file);
  return api<ManagedProduct>(
    `/api/manage/products/${encodeURIComponent(product.id)}/images?version=${product.version}`,
    { method: "POST", body },
  );
};

export const reorderManagedProductImages = (product: ManagedProduct, imageIds: string[]) =>
  api<ManagedProduct>(`/api/manage/products/${encodeURIComponent(product.id)}/images/order`, {
    method: "PUT",
    body: JSON.stringify({ version: product.version, imageIds }),
  });

export const removeManagedProductImage = (product: ManagedProduct, imageId: string) =>
  api<ManagedProduct>(
    `/api/manage/products/${encodeURIComponent(product.id)}/images/${encodeURIComponent(imageId)}?version=${product.version}`,
    { method: "DELETE" },
  );

export const activateManagedProduct = (product: ManagedProduct) =>
  api<ManagedProduct>(`/api/manage/products/${encodeURIComponent(product.id)}/activate`, {
    method: "POST",
    body: JSON.stringify({ version: product.version }),
  });

export const deactivateManagedProduct = (product: ManagedProduct) =>
  api<ManagedProduct>(`/api/manage/products/${encodeURIComponent(product.id)}/deactivate`, {
    method: "POST",
    body: JSON.stringify({ version: product.version }),
  });

export const returnManagedProductToDraft = (product: ManagedProduct) =>
  api<ManagedProduct>(`/api/manage/products/${encodeURIComponent(product.id)}/draft`, {
    method: "POST",
    body: JSON.stringify({ version: product.version }),
  });

export const listMaterials = ({
  page = 0,
  size = 20,
  search,
  type,
  status,
  sort = "NAME_ASC",
}: MaterialQuery = {}) => {
  const params = new URLSearchParams({ page: String(page), size: String(size), sort });
  if (search?.trim()) params.set("search", search.trim());
  if (type) params.set("type", type);
  if (status) params.set("status", status);
  return api<PageResponse<AdminMaterial>>(`/api/manage/materials?${params.toString()}`);
};

export const getMaterial = (id: string) =>
  api<AdminMaterial>(`/api/manage/materials/${encodeURIComponent(id)}`);

export const createMaterial = (input: MaterialInput) =>
  api<AdminMaterial>("/api/manage/materials", { method: "POST", body: JSON.stringify(input) });

export const updateMaterial = (id: string, input: MaterialInput, version: number) =>
  api<AdminMaterial>(`/api/manage/materials/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify({ ...input, version }),
  });

export const deactivateMaterial = (id: string, version: number) =>
  api<AdminMaterial>(`/api/manage/materials/${encodeURIComponent(id)}/deactivate`, {
    method: "PUT",
    body: JSON.stringify({ version }),
  });

export const reactivateMaterial = (id: string, version: number) =>
  api<AdminMaterial>(`/api/manage/materials/${encodeURIComponent(id)}/reactivate`, {
    method: "PUT",
    body: JSON.stringify({ version }),
  });
