import { api, SIGN_IN_MESSAGE, VIEW_DENIED_MESSAGE, withQuery, type ErrorMessages } from "@/lib/api";

/**
 * Admin sales, material cost and profit report (T-FIN-08, BR-PAY-15…19). Money is whole VND.
 * Days are shop days (UTC+7); `from` and `to` are both included.
 */

export interface SalesTotals {
  revenue: number;
  materialCost: number;
  /** Shipping fees charged on GHN-booked orders, and what GHN billed for them. */
  shippingCollected: number;
  ghnFeesPaid: number;
  shippingResult: number;
  profit: number;
  /** Percent with one decimal; null when there is no revenue. */
  margin: number | null;
  expiryWaste: number;
  profitAfterWaste: number;
  completedOrders: number;
  cancelledOrders: number;
  averageOrderValue: number;
}

export interface SalesDay {
  date: string;
  revenue: number;
  materialCost: number;
  profit: number;
  orders: number;
  expiryWaste: number;
}

export interface TopProduct {
  /** Null for the one row of all custom orders. */
  productId: string | null;
  name: string;
  custom: boolean;
  units: number;
  value: number;
  materialCost: number;
  profit: number;
}

export interface SalesReport {
  from: string;
  to: string;
  totals: SalesTotals;
  byDay: SalesDay[];
  topProducts: TopProduct[];
}

const reportErrors: ErrorMessages = {
  status: { 401: SIGN_IN_MESSAGE, 403: VIEW_DENIED_MESSAGE },
  codes: { VALIDATION_FAILED: "Ngày bắt đầu phải trước hoặc bằng ngày kết thúc." },
};

export const getSalesReport = (from: string, to: string) =>
  api<SalesReport>(withQuery("/api/admin/finance/sales", { from, to }), { errors: reportErrors });
