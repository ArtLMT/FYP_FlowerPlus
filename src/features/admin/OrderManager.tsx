"use client";

import { useLayoutEffect, useRef } from "react";
import Button from "@/components/ui/Button";
import OrderDetail, { formatMoney } from "@/features/admin/OrderDetail";
import OrderStatusBadge from "@/features/admin/OrderStatusBadge";
import { useOrderManager } from "@/features/admin/hooks/use-order-manager";
import { formatAmount } from "@/features/admin/StockAlert";
import { MANAGED_ORDER_STATUSES, ORDER_STATUS_LABELS } from "@/features/admin/order-labels";
import type { ManagementOrderSummary, OrderStatus, OrderType } from "@/lib/services/orders";
import type { OrderStock } from "@/lib/services/inventory";

const INPUT = "min-h-11 rounded-lg border border-neutral-border bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-primary";

const formatTime = (instant: string) => new Intl.DateTimeFormat("vi-VN", {
  timeZone: "Asia/Ho_Chi_Minh",
  dateStyle: "short",
  timeStyle: "short",
}).format(new Date(instant));

/**
 * Main Order-management workspace: the list, or one Order's detail page in its place.
 *
 * UI map for future changes:
 * - Change the filter toolbar and table shell in `OrderManager`.
 * - Change one table record in `OrderRow`, its stock chip in `StockBadge`.
 * - Change the detail page and its action buttons in `OrderDetail.tsx`.
 * - Change status text, button text, or badge colours in `order-labels.ts`.
 * - Change loading/mutation behaviour in `hooks/use-order-manager.ts`.
 */
export default function OrderManager({ stockByOrder, openRequest, initialFilter, onStockChanged, viewerId }: {
  /** Stock coverage of each waiting Order, from the shell's stock check. */
  stockByOrder?: Map<string, OrderStock>;
  openRequest?: { orderId: string } | null;
  /** Opens the list already filtered, e.g. from a dashboard count. */
  initialFilter?: { status?: OrderStatus; type?: OrderType };
  onStockChanged?: () => void;
  /** The signed-in account's id, so the detail page can say "Bạn" for its own actions. */
  viewerId?: string;
} = {}) {
  const m = useOrderManager({ openRequest, initialFilter, onStockChanged });
  // Where the list was scrolled when an Order opened, so "Quay lại" lands on the same rows.
  const listScroll = useRef<number | null>(null);

  useLayoutEffect(() => {
    if (m.selectedId || listScroll.current === null) return;
    window.scrollTo({ top: listScroll.current, behavior: "instant" });
    listScroll.current = null;
  }, [m.selectedId]);

  function openOrder(id: string) {
    listScroll.current = window.scrollY;
    m.selectOrder(id);
  }

  if (m.selectedId) return <OrderDetail
    key={m.selectedId}
    order={m.order}
    loading={m.orderLoading}
    error={m.orderError}
    saving={m.saving}
    feedback={m.feedback}
    stock={stockByOrder?.get(m.selectedId)}
    viewerId={viewerId}
    onBack={m.closeOrder}
    onReload={m.reloadOrder}
    onAdvance={m.advance}
    onCancel={m.cancel}
    onPropose={m.propose}
    onApprove={m.approve}
  />;

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-neutral-border bg-white p-4 shadow-sm sm:p-5" aria-labelledby="orders-heading">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="orders-heading" className="font-serif text-xl font-semibold text-text-primary">Quản lý đơn hàng</h2>
            <p className="mt-1 text-sm text-text-muted">Xác nhận, chuyển bước hoặc hủy đơn. Nội dung đơn hàng không thể chỉnh sửa.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <label className="flex min-w-56 flex-col gap-1 text-xs font-semibold text-text-secondary">
              Trạng thái
              <select value={m.status} onChange={(event) => m.setStatus(event.target.value as OrderStatus | "")} className={INPUT}>
                <option value="">Tất cả trạng thái</option>
                {MANAGED_ORDER_STATUSES.map((status) => <option key={status} value={status}>{ORDER_STATUS_LABELS[status]}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs font-semibold text-text-secondary">
              Loại đơn
              <select value={m.type} onChange={(event) => m.setType(event.target.value as OrderType | "")} className={INPUT}>
                <option value="">Tất cả</option>
                <option value="STANDARD">Đơn thường</option>
                <option value="CUSTOM">Thiết kế riêng</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs font-semibold text-text-secondary">
              Sắp xếp
              <select value={m.sort} onChange={(event) => m.setSort(event.target.value as "createdAt" | "deliveryWish")} className={INPUT}>
                <option value="createdAt">Mới nhất</option>
                <option value="deliveryWish">Thời gian mong muốn</option>
              </select>
            </label>
            <Button type="button" onClick={m.reload} className="min-h-11 rounded-lg border border-neutral-border bg-white px-4 text-sm font-semibold text-text-secondary hover:border-primary hover:text-primary-deep">Tải lại</Button>
          </div>
        </div>
      </section>

      {m.listError && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{m.listError}</p>}

      {m.loading ? <p className="py-10 text-center text-sm text-text-muted">Đang tải đơn hàng…</p>
        : m.page?.content.length === 0 ? <p className="rounded-xl border border-dashed border-neutral-border py-12 text-center text-sm text-text-muted">Không có đơn hàng phù hợp.</p>
          : m.page && <>
            <div className="overflow-x-auto rounded-xl border border-neutral-border bg-white shadow-sm">
              <table className="w-full min-w-[1240px] text-left text-sm">
                <thead className="border-b border-neutral-border bg-neutral-canvas text-xs uppercase tracking-wider text-text-muted">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-semibold">Mã đơn hàng</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Thời gian tạo</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Người nhận</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Mong muốn</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Trạng thái</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Nguyên liệu</th>
                    <th scope="col" className="px-4 py-3 text-right font-semibold">Tổng tiền</th>
                    <th scope="col" className="px-4 py-3 text-right font-semibold">Thao tác</th>
                  </tr>
                </thead>
                <tbody>{m.page.content.map((order) => <OrderRow key={order.id} order={order} stock={stockByOrder?.get(order.id)} onOpen={() => openOrder(order.id)} />)}</tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-neutral-border pt-5">
              <Button type="button" disabled={!m.hasPrevious} onClick={m.previous} className="rounded-lg border border-neutral-border bg-white px-4 py-2 text-sm font-semibold text-text-secondary disabled:opacity-50">Trước</Button>
              <span className="text-sm text-text-muted">{m.page.totalElements} đơn · trang {m.page.page + 1}/{Math.max(m.page.totalPages, 1)}</span>
              <Button type="button" disabled={!m.hasNext} onClick={m.next} className="rounded-lg border border-neutral-border bg-white px-4 py-2 text-sm font-semibold text-text-secondary disabled:opacity-50">Tiếp</Button>
            </div>
          </>}
    </div>
  );
}

/** One record in the Order queue. The full UUID is the backend `orders.id` value. */
function OrderRow({ order, stock, onOpen }: { order: ManagementOrderSummary; stock: OrderStock | undefined; onOpen: () => void }) {
  return <tr className="border-b border-neutral-border last:border-b-0 hover:bg-neutral-canvas/70">
    <td className="px-4 py-3">
      <code className="whitespace-nowrap text-xs font-semibold text-text-primary">{order.id}</code>
      {order.type === "CUSTOM" && <p className="mt-1 text-xs font-bold text-primary-deep">Thiết kế riêng{order.status === "REQUESTED" && " · cần xử lý"}</p>}
    </td>
    <td className="whitespace-nowrap px-4 py-3 text-xs text-text-muted">{formatTime(order.createdAt)}</td>
    <td className="px-4 py-3"><p className="font-semibold text-text-primary">{order.recipientName}</p><p className="mt-1 text-xs text-text-muted">{order.recipientPhone}</p></td>
    <td className="px-4 py-3 text-text-secondary">{order.deliveryWishText ?? <span className="text-text-muted">Không chọn</span>}</td>
    <td className="px-4 py-3"><OrderStatusBadge status={order.status} /></td>
    <td className="px-4 py-3"><StockBadge stock={stock} /></td>
    <td className="whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums text-text-primary">{formatMoney(order.total)}</td>
    <td className="px-4 py-3 text-right"><Button type="button" onClick={onOpen} className="rounded-lg border border-neutral-border bg-white px-3.5 py-2 text-xs font-bold text-primary-deep hover:border-primary">Xem chi tiết</Button></td>
  </tr>;
}

/**
 * A short stock state only (U3): the materials themselves are on the Order's detail page and in the
 * stock alert, and in the chip's tooltip. Only Orders waiting for preparation have a stock answer;
 * the rest show a dash.
 */
function StockBadge({ stock }: { stock: OrderStock | undefined }) {
  if (!stock) return <span className="text-text-muted">—</span>;
  if (stock.canPrepare) return <span className="inline-flex whitespace-nowrap rounded-full bg-accent-sage-light/60 px-2.5 py-1 text-xs font-bold text-text-primary">Đủ</span>;
  const details = stock.shortages.map((shortage) => `${shortage.materialName}: thiếu ${formatAmount(shortage.shortBy, shortage.unitOfMeasure)}`).join("\n");
  return <span title={details} className="inline-flex whitespace-nowrap rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700">Thiếu {stock.shortages.length} loại</span>;
}
