import type { User, Address, Order, LiveOrder, Voucher, Notification } from "@/lib/types";
import {
  user,
  addresses,
  orders,
  liveOrder,
  vouchers,
  notifications,
} from "@/lib/mock-data";

/**
 * Account service. Returns mock data from lib/mock-data.
 * TODO(api): replace each body with a fetch() scoped to the signed-in user.
 */

export async function getUser(): Promise<User> {
  return user;
}

export async function getAddresses(): Promise<Address[]> {
  return addresses;
}

export async function getOrders(): Promise<Order[]> {
  return orders;
}

export async function getLiveOrder(): Promise<LiveOrder> {
  return liveOrder;
}

export async function getVouchers(): Promise<Voucher[]> {
  return vouchers;
}

export async function getNotifications(): Promise<Notification[]> {
  return notifications;
}
