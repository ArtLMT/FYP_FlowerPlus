import { api, withQuery, type Page } from "@/lib/api";

export type SaleState = "UPCOMING" | "RUNNING" | "FINISHED" | "ENDED";
export type SaleDiscountType = "FIXED" | "PERCENTAGE";

export interface Sale {
  id: string;
  productId: string;
  productName: string;
  productStatus: "ACTIVE" | "DRAFT" | "DEACTIVATED";
  basePrice: number;
  discountType: SaleDiscountType;
  discountValue: number;
  startsAt: string;
  endsAt: string;
  endedAt: string | null;
  state: SaleState;
  currentSalePrice: number | null;
  version: number;
}

export async function listSales(): Promise<Sale[]> {
  const page = await api<Page<Sale>>(withQuery("/api/manage/sales", { page: 0, size: 100 }));
  return page.content;
}

export const createSale = (input: Omit<Sale, "id" | "productName" | "productStatus" | "basePrice" | "endedAt" | "state" | "currentSalePrice" | "version">) =>
  api<Sale>("/api/manage/sales", { method: "POST", body: input });

export const updateSale = (sale: Sale, input: Pick<Sale, "discountType" | "discountValue" | "startsAt" | "endsAt">) =>
  api<Sale>(`/api/manage/sales/${sale.id}`, { method: "PUT", body: { ...input, version: sale.version } });

export const endSale = (sale: Sale) =>
  api<Sale>(`/api/manage/sales/${sale.id}/end`, { method: "POST", body: { version: sale.version } });
