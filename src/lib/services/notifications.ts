import { api, path, withQuery, type Page } from "@/lib/api";
import { formatShopDateTime } from "@/lib/utils";

/** What a notice is about. Only ORDER_UPDATE is written today (T-ENG-05: order milestones). */
export type NotificationType = "ORDER_UPDATE" | "PROMOTION" | "SYSTEM" | "REVIEW_REQUEST" | "DELIVERY_ALERT";

export type NotificationSubject = "ORDER" | "PRODUCT" | "VOUCHER" | "CUSTOM_ORDER";

/** One in-app notice of the signed-in user. Notices are kept forever; only `read` ever changes. */
export interface UserNotification {
  id: string;
  type: NotificationType;
  title: string;
  content: string;
  relatedEntityType: NotificationSubject | null;
  relatedEntityId: string | null;
  read: boolean;
  createdAt: string;
}

/** The signed-in user's notices, newest first. */
export const listNotifications = (page: number, size: number) =>
  api<Page<UserNotification>>(withQuery("/api/notifications", { page, size }));

export const getUnreadNotificationCount = () =>
  api<{ unread: number }>("/api/notifications/unread-count").then((response) => response.unread);

/** Another user's notice answers NOTIFICATION_NOT_FOUND, like a deleted one. */
export const markNotificationRead = (id: string) =>
  api<UserNotification>(path`/api/notifications/${id}/read`, { method: "POST" });

export const markAllNotificationsRead = () => api<void>("/api/notifications/read-all", { method: "POST" });

export const NOTIFICATION_CATEGORY: Record<NotificationType, string> = {
  ORDER_UPDATE: "ĐƠN HÀNG",
  PROMOTION: "ƯU ĐÃI",
  SYSTEM: "TÀI KHOẢN",
  REVIEW_REQUEST: "ĐÁNH GIÁ",
  DELIVERY_ALERT: "GIAO HÀNG",
};

/** The page a notice opens: its order (standard or custom), or nothing. */
export function notificationHref(notice: UserNotification): string | null {
  const isOrder = notice.relatedEntityType === "ORDER" || notice.relatedEntityType === "CUSTOM_ORDER";
  return isOrder && notice.relatedEntityId ? `/account/orders/${notice.relatedEntityId}` : null;
}

/** "Vừa xong", "5 phút trước", "3 giờ trước", then the shop date and time. */
export function formatNoticeTime(createdAt: string, now: number): string {
  const minutes = Math.floor((now - new Date(createdAt).getTime()) / 60_000);
  if (minutes < 1) return "Vừa xong";
  if (minutes < 60) return `${minutes} phút trước`;
  if (minutes < 24 * 60) return `${Math.floor(minutes / 60)} giờ trước`;
  return formatShopDateTime(createdAt);
}
