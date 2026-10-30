"use client";

import { useState, type FormEvent } from "react";
import Button from "@/components/ui/Button";
import ModalDialog from "@/components/ui/ModalDialog";
import { useOrderManager } from "@/features/admin/hooks/use-order-manager";
import { formatAmount } from "@/features/admin/StockAlert";
import {
  ADVANCE_LABELS,
  MANAGED_ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_STYLES,
} from "@/features/admin/order-labels";
import {
  deliverySlotLabel,
  type ManagementOrder,
  type ManagementOrderSummary,
  type OrderStatus,
} from "@/lib/services/orders";
import type { OrderStock } from "@/lib/services/inventory";
import { formatCalendarDate } from "@/lib/utils";

const INPUT = "min-h-11 rounded-lg border border-neutral-border bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-primary";

const formatMoney = (value: number) => `${Number(value).toLocaleString("vi-VN")} ₫`;
const formatTime = (instant: string) => new Intl.DateTimeFormat("vi-VN", {
  timeZone: "Asia/Ho_Chi_Minh",
  dateStyle: "short",
  timeStyle: "short",
}).format(new Date(instant));

/**
 * Main Order-management workspace.
 *
 * UI map for future changes:
 * - Change the filter toolbar and table shell in `OrderManager`.
 * - Change one table record in `OrderRow`.
 * - Change the read-only detail view and action buttons in `OrderDialog`.
 * - Change status text, button text, or badge colours in `order-labels.ts`.
 * - Change loading/mutation behaviour in `hooks/use-order-manager.ts`.
 */
export default function OrderManager({ stockByOrder, openRequest, onStockChanged }: {
  /** Stock coverage of each waiting Order, from the shell's stock check. */
  stockByOrder?: Map<string, OrderStock>;
  openRequest?: { orderId: string } | null;
  onStockChanged?: () => void;
} = {}) {
  const m = useOrderManager({ openRequest, onStockChanged });

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
            <Button type="button" onClick={m.reload} className="min-h-11 rounded-lg border border-neutral-border bg-white px-4 text-sm font-semibold text-text-secondary hover:border-primary hover:text-primary-deep">Tải lại</Button>
          </div>
        </div>
      </section>

      {m.listError && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{m.listError}</p>}

      {m.loading ? <p className="py-10 text-center text-sm text-text-muted">Đang tải đơn hàng…</p>
        : m.page?.content.length === 0 ? <p className="rounded-xl border border-dashed border-neutral-border py-12 text-center text-sm text-text-muted">Không có đơn hàng phù hợp.</p>
          : m.page && <>
            <div className="overflow-x-auto rounded-xl border border-neutral-border bg-white shadow-sm">
              <table className="w-full min-w-[1320px] text-left text-sm">
                <thead className="border-b border-neutral-border bg-neutral-canvas text-xs uppercase tracking-wider text-text-muted">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-semibold">Mã đơn hàng</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Thời gian tạo</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Người nhận</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Ngày giao</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Trạng thái</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Nguyên liệu</th>
                    <th scope="col" className="px-4 py-3 text-right font-semibold">Tổng tiền</th>
                    <th scope="col" className="px-4 py-3 text-right font-semibold">Thao tác</th>
                  </tr>
                </thead>
                <tbody>{m.page.content.map((order) => <OrderRow key={order.id} order={order} stock={stockByOrder?.get(order.id)} onOpen={() => m.selectOrder(order.id)} />)}</tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-neutral-border pt-5">
              <Button type="button" disabled={!m.hasPrevious} onClick={m.previous} className="rounded-lg border border-neutral-border bg-white px-4 py-2 text-sm font-semibold text-text-secondary disabled:opacity-50">Trước</Button>
              <span className="text-sm text-text-muted">{m.page.totalElements} đơn · trang {m.page.page + 1}/{Math.max(m.page.totalPages, 1)}</span>
              <Button type="button" disabled={!m.hasNext} onClick={m.next} className="rounded-lg border border-neutral-border bg-white px-4 py-2 text-sm font-semibold text-text-secondary disabled:opacity-50">Tiếp</Button>
            </div>
          </>}

      {m.selectedId && <OrderDialog
        order={m.order}
        loading={m.orderLoading}
        error={m.orderError}
        saving={m.saving}
        feedback={m.feedback}
        onClose={m.closeOrder}
        onAdvance={m.advance}
        onCancel={m.cancel}
      />}
    </div>
  );
}

/** One record in the Order queue. The full UUID is the backend `orders.id` value. */
function OrderRow({ order, stock, onOpen }: { order: ManagementOrderSummary; stock: OrderStock | undefined; onOpen: () => void }) {
  return <tr className="border-b border-neutral-border last:border-b-0 hover:bg-neutral-canvas/70">
    <td className="px-4 py-3"><code className="whitespace-nowrap text-xs font-semibold text-text-primary">{order.id}</code></td>
    <td className="whitespace-nowrap px-4 py-3 text-xs text-text-muted">{formatTime(order.createdAt)}</td>
    <td className="px-4 py-3"><p className="font-semibold text-text-primary">{order.recipientName}</p><p className="mt-1 text-xs text-text-muted">{order.recipientPhone}</p></td>
    <td className="px-4 py-3 text-text-secondary"><p>{formatCalendarDate(order.deliveryDate)}</p><p className="mt-1 text-xs text-text-muted">{deliverySlotLabel(order.deliveryTimeSlot)}</p></td>
    <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
    <td className="px-4 py-3"><StockBadge stock={stock} /></td>
    <td className="whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums text-text-primary">{formatMoney(order.total)}</td>
    <td className="px-4 py-3 text-right"><Button type="button" onClick={onOpen} className="rounded-lg border border-neutral-border bg-white px-3.5 py-2 text-xs font-bold text-primary-deep hover:border-primary">Xem chi tiết</Button></td>
  </tr>;
}

/** Only Orders waiting for preparation have a stock answer; the rest show a dash. */
function StockBadge({ stock }: { stock: OrderStock | undefined }) {
  if (!stock) return <span className="text-text-muted">—</span>;
  if (stock.canPrepare) return <span className="inline-flex whitespace-nowrap rounded-full bg-accent-sage-light/60 px-2.5 py-1 text-xs font-bold text-text-primary">Đủ nguyên liệu</span>;
  const [first] = stock.shortages;
  const text = stock.shortages.length === 1
    ? `Thiếu · ${first.materialName} −${formatAmount(first.shortBy, first.unitOfMeasure)}`
    : `Thiếu · ${stock.shortages.length} nguyên liệu`;
  return <span className="inline-flex whitespace-nowrap rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700">{text}</span>;
}

function StatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${ORDER_STATUS_STYLES[status]}`}>{ORDER_STATUS_LABELS[status]}</span>;
}

/** Read-only Order detail modal. Its footer contains the only lifecycle and cancellation actions. */
function OrderDialog({
  order,
  loading,
  error,
  saving,
  feedback,
  onClose,
  onAdvance,
  onCancel,
}: {
  order: ManagementOrder | undefined;
  loading: boolean;
  error: string;
  saving: boolean;
  feedback: { kind: "success" | "error"; text: string } | null;
  onClose: () => void;
  onAdvance: () => Promise<boolean>;
  onCancel: (note: string) => Promise<boolean>;
}) {
  const [cancelling, setCancelling] = useState(false);
  const [note, setNote] = useState("");

  async function submitCancel(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!note.trim()) return;
    if (await onCancel(note.trim())) {
      setCancelling(false);
      setNote("");
    }
  }

  const footer = order && !loading && !error ? cancelling
    ? <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" disabled={saving} onClick={() => setCancelling(false)} className="min-h-11 rounded-lg border border-neutral-border px-4 text-sm font-semibold text-text-secondary">Quay lại</Button>
        <Button type="submit" form="cancel-order-form" disabled={saving || !note.trim()} className="min-h-11 rounded-lg bg-red-700 px-5 text-sm font-bold text-white disabled:opacity-50">{saving ? "Đang hủy…" : "Xác nhận hủy đơn"}</Button>
      </div>
    : <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {order.canCancel && <Button type="button" disabled={saving} onClick={() => setCancelling(true)} className="min-h-11 rounded-lg border border-red-200 bg-white px-4 text-sm font-semibold text-red-700 hover:bg-red-50">Hủy đơn</Button>}
        {order.nextStatus && <Button type="button" disabled={saving} onClick={() => void onAdvance()} className="min-h-11 rounded-lg bg-primary px-5 text-sm font-bold text-white hover:bg-primary-hover disabled:opacity-50">{saving ? "Đang cập nhật…" : ADVANCE_LABELS[order.status] ?? "Chuyển bước tiếp theo"}</Button>}
      </div>
    : undefined;

  return <ModalDialog title="Chi tiết đơn hàng" onClose={onClose} footer={footer} wide>
    {loading ? <p className="py-8 text-center text-sm text-text-muted">Đang tải chi tiết…</p>
      : error ? <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>
        : order && <div className="space-y-6">
          {feedback && <p role={feedback.kind === "error" ? "alert" : "status"} className={`rounded-lg px-4 py-3 text-sm ${feedback.kind === "error" ? "bg-red-50 text-red-800" : "bg-accent-sage-light text-text-primary"}`}>{feedback.text}</p>}

          {cancelling ? <form id="cancel-order-form" onSubmit={(event) => void submitCancel(event)} className="space-y-3">
            <div><h3 className="font-serif text-xl font-semibold text-text-primary">Hủy đơn hàng</h3><p className="mt-1 text-sm text-text-muted">Ghi chú là bắt buộc và sẽ được lưu trong lịch sử đơn hàng.</p></div>
            <label className="flex flex-col gap-1 text-xs font-semibold text-text-secondary">Ghi chú hủy đơn
              <textarea autoFocus required rows={5} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Nhập lý do hủy đơn…" className="resize-y rounded-lg border border-neutral-border bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-primary" />
            </label>
          </form> : <>
            <div className="flex flex-wrap items-center gap-3"><StatusBadge status={order.status} />{order.nextStatus && <span className="text-sm text-text-muted">Bước tiếp theo: <strong className="text-text-secondary">{ORDER_STATUS_LABELS[order.nextStatus]}</strong></span>}</div>

            <section className="grid gap-3 rounded-xl bg-white p-4 sm:grid-cols-2">
              <div className="sm:col-span-2"><Info label="Mã đơn hàng" value={order.id} monospace /></div>
              <Info label="Người nhận" value={order.address.recipientName} />
              <Info label="Điện thoại" value={order.address.recipientPhone} />
              <Info label="Ngày giao" value={`${formatCalendarDate(order.deliveryDate)} · ${deliverySlotLabel(order.deliveryTimeSlot)}`} />
              <Info label="Thanh toán" value={`${order.paymentMethod} · ${order.paymentStatus}`} />
              <div className="sm:col-span-2"><Info label="Địa chỉ" value={order.address.deliveryAddress} /></div>
              {order.customerNote && <div className="sm:col-span-2"><Info label="Ghi chú khách hàng" value={order.customerNote} /></div>}
            </section>

            {/* Product lines and the Order total are intentionally one visual table. */}
            <section><h3 className="mb-3 font-serif text-lg font-semibold text-text-primary">Sản phẩm</h3><div className="overflow-hidden rounded-xl border border-neutral-border bg-white">
              {order.lines.map((line) => <div key={line.productId} className="flex items-start justify-between gap-4 border-b border-neutral-border px-4 py-3 last:border-b-0"><div><p className="font-semibold text-text-primary">{line.productName}</p><p className="mt-1 text-xs text-text-muted">{line.productType} · {line.quantity} sản phẩm × {formatMoney(line.unitPrice)}</p></div><p className="whitespace-nowrap font-semibold tabular-nums text-text-primary">{formatMoney(line.lineTotal)}</p></div>)}
              <div className="flex items-center justify-between border-t border-neutral-border px-4 py-3"><span className="text-sm font-semibold text-text-secondary">Tổng cộng</span><strong className="text-lg tabular-nums text-primary-deep">{formatMoney(order.total)}</strong></div>
            </div></section>

            <section><h3 className="mb-3 font-serif text-lg font-semibold text-text-primary">Lịch sử trạng thái</h3><ol className="space-y-3 border-l-2 border-neutral-border pl-4">
              {order.history.map((entry, index) => <li key={`${entry.createdAt}-${index}`} className="relative"><span className="absolute -left-[21px] top-1 size-2.5 rounded-full bg-primary" /><div className="flex flex-wrap items-center gap-2"><span className="font-semibold text-text-primary">{ORDER_STATUS_LABELS[entry.newStatus]}</span><span className="text-xs text-text-muted">{formatTime(entry.createdAt)}</span></div>{entry.note && <p className="mt-1 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{entry.note}</p>}</li>)}
            </ol></section>
          </>}
        </div>}
  </ModalDialog>;
}

/** Small label/value field used by the detail summary above the product list. */
function Info({ label, value, monospace = false }: { label: string; value: string; monospace?: boolean }) {
  return <div><p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">{label}</p><p className={`mt-1 break-all text-sm text-text-primary ${monospace ? "font-mono" : ""}`}>{value}</p></div>;
}
