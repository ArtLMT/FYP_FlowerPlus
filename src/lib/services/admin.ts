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
