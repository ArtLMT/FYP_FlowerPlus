import type { ShipmentStage } from "@/lib/services/orders";

/** What each stage means to a person reading the order page. */
export const SHIPMENT_STAGE_LABELS: Record<ShipmentStage, string> = {
  PICKING: "Chờ lấy hàng",
  IN_TRANSIT: "Đang vận chuyển",
  DELIVERED: "Đã giao",
  RETURNING: "Đang hoàn hàng",
  RETURNED: "Đã hoàn về cửa hàng",
  CANCELLED: "Đã hủy vận đơn",
  PROBLEM: "Sự cố vận đơn",
  UNKNOWN: "Không xác định",
};

const WAITING = "bg-amber-50 text-amber-800";
const MOVING = "bg-blue-50 text-blue-800";
const DONE = "bg-accent-sage-light text-[#386A20]";
const STOPPED = "bg-red-50 text-red-800";
const NEUTRAL = "bg-neutral-raised text-text-secondary";

export const SHIPMENT_STAGE_STYLES: Record<ShipmentStage, string> = {
  PICKING: WAITING,
  IN_TRANSIT: MOVING,
  DELIVERED: DONE,
  RETURNING: STOPPED,
  RETURNED: STOPPED,
  CANCELLED: STOPPED,
  PROBLEM: STOPPED,
  UNKNOWN: NEUTRAL,
};

/**
 * GHN's own status strings, for the staff timeline. Staff work with GHN's portal and its wording,
 * so the raw status is worth showing; the customer only ever sees the stage.
 */
export const GHN_STATUS_LABELS: Record<string, string> = {
  ready_to_pick: "Chờ lấy hàng",
  picking: "Shipper đang đến lấy",
  money_collect_picking: "Thu tiền khi lấy hàng",
  picked: "Đã lấy hàng",
  storing: "Đang ở kho GHN",
  sorting: "Đang phân loại",
  transporting: "Đang luân chuyển",
  delivering: "Đang giao cho người nhận",
  money_collect_delivering: "Đang thu tiền khi giao",
  delivered: "Giao thành công",
  delivery_fail: "Giao không thành công",
  waiting_to_return: "Chờ hoàn hàng",
  return: "Yêu cầu hoàn hàng",
  return_transporting: "Hàng hoàn đang luân chuyển",
  return_sorting: "Hàng hoàn đang phân loại",
  returning: "Đang hoàn về cửa hàng",
  return_fail: "Hoàn hàng không thành công",
  returned: "Đã hoàn về cửa hàng",
  cancel: "Đã hủy",
  exception: "Sự cố cần xử lý",
  lost: "Thất lạc",
  damage: "Hư hỏng",
  scrap: "Đã hủy hàng",
};

/** GHN's wording when known, the raw value when GHN adds a status this build has not seen. */
export function ghnStatusLabel(status: string | null): string {
  if (!status) return "Chưa có cập nhật";
  return GHN_STATUS_LABELS[status] ?? status;
}
