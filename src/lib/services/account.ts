import type { Notification, Voucher } from "@/lib/types";
import { notifications, vouchers } from "@/lib/mock-data";

/**
 * Account screens that have no backend yet. Returns mock data from lib/mock-data.
 * TODO(api): replace each body with a request scoped to the signed-in user.
 */

export async function getVouchers(): Promise<Voucher[]> {
  return vouchers;
}

export async function getNotifications(): Promise<Notification[]> {
  return notifications;
}
