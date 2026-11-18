import { api, withQuery, type Page } from "@/lib/api";
import { groupFieldErrors, type ErrorMessages, type ValidationFieldError } from "@/lib/api/errors";

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

/** Vietnamese wording for each sale field the backend can reject. */
function saleFieldMessage({ field, rule }: ValidationFieldError): string {
  switch (field) {
    case "productId": return "Hãy chọn sản phẩm.";
    case "discountType": return "Hãy chọn loại giảm giá.";
    case "discountValue":
      return rule === "SalePrice"
        ? "Giảm theo phần trăm phải từ 1 đến 99; giảm cố định phải nhỏ hơn giá gốc của sản phẩm."
        : "Giá trị giảm phải là số nguyên lớn hơn 0.";
    case "startsAt": return "Hãy chọn thời điểm bắt đầu.";
    case "endsAt":
      return rule === "After" ? "Thời điểm kết thúc phải sau thời điểm bắt đầu." : "Hãy chọn thời điểm kết thúc.";
    default: return "Một trường thông tin chưa hợp lệ.";
  }
}

const saleErrors: ErrorMessages = {
  codes: {
    SALE_WINDOW_CONFLICT: "Sản phẩm này đã có chương trình giảm giá trùng khoảng thời gian. Hãy chọn thời gian khác.",
    SALE_INVALID_STATE: "Chương trình đang chạy chỉ được đổi thời điểm kết thúc (sau hiện tại) hoặc kết thúc ngay; chương trình đã kết thúc không thể sửa.",
    CONCURRENT_MODIFICATION: "Chương trình giảm giá vừa được người khác cập nhật. Hãy tải lại rồi thử lại.",
    VALIDATION_FAILED: (error) => error.fieldMessages.join(" ") || "Một số thông tin chưa hợp lệ.",
  },
  fields: (fields) => groupFieldErrors(fields, saleFieldMessage),
};

export async function listSales(): Promise<Sale[]> {
  const page = await api<Page<Sale>>(withQuery("/api/manage/sales", { page: 0, size: 100 }));
  return page.content;
}

export const createSale = (input: Omit<Sale, "id" | "productName" | "productStatus" | "basePrice" | "endedAt" | "state" | "currentSalePrice" | "version">) =>
  api<Sale>("/api/manage/sales", { method: "POST", body: input, errors: saleErrors });

export const updateSale = (sale: Sale, input: Pick<Sale, "discountType" | "discountValue" | "startsAt" | "endsAt">) =>
  api<Sale>(`/api/manage/sales/${sale.id}`, { method: "PUT", body: { ...input, version: sale.version }, errors: saleErrors });

export const endSale = (sale: Sale) =>
  api<Sale>(`/api/manage/sales/${sale.id}/end`, { method: "POST", body: { version: sale.version }, errors: saleErrors });
