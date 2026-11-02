"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import Button from "@/components/ui/Button";
import ModalDialog from "@/components/ui/ModalDialog";
import OrderStatusBadge from "@/features/admin/OrderStatusBadge";
import { formatAmount, shortOrderId } from "@/features/admin/StockAlert";
import { ADVANCE_LABELS, ORDER_STATUS_LABELS } from "@/features/admin/order-labels";
import type { OrderStock } from "@/lib/services/inventory";
import { deliverySlotLabel, type ManagementOrder } from "@/lib/services/orders";
import { formatCalendarDate, formatShopDateTime } from "@/lib/utils";

export const formatMoney = (value: number) => `${Number(value).toLocaleString("vi-VN")} ₫`;

type HistoryEntry = ManagementOrder["history"][number];

/**
 * One Order as a full page inside the Orders workspace (screen decision Q3): the list is replaced
 * while it is open, and "Quay lại" returns to it with its filter and page kept. Modals are only for
 * confirmations (the cancel reason).
 *
 * UI map:
 * - Back link, title and the two actions: top of `OrderDetail`.
 * - Who cancelled and why: `CancellationBlock`.
 * - Products and status history: the wide left column; delivery, payment and stock: the right column.
 * - The cancel reason prompt: `CancelOrderDialog`.
 */
export default function OrderDetail({
  order,
  loading,
  error,
  saving,
  feedback,
  stock,
  viewerId,
  onBack,
  onReload,
  onAdvance,
  onCancel,
}: {
  /** Undefined until this Order has loaded; a reload keeps the previous copy on screen. */
  order: ManagementOrder | undefined;
  loading: boolean;
  error: string;
  saving: boolean;
  feedback: { kind: "success" | "error"; text: string } | null;
  /** Stock coverage when the Order is waiting for preparation; undefined otherwise. */
  stock: OrderStock | undefined;
  /** The signed-in account, so its own actions read "Bạn". */
  viewerId: string | undefined;
  onBack: () => void;
  onReload: () => void;
  onAdvance: () => Promise<boolean>;
  onCancel: (note: string) => Promise<boolean>;
}) {
  const [cancelling, setCancelling] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);

  // Opened from far down the list: bring the page's top into view.
  useEffect(() => {
    const page = pageRef.current;
    if (page && page.getBoundingClientRect().top < 0) page.scrollIntoView({ block: "start", behavior: "instant" });
  }, []);

  const back = <Button type="button" onClick={onBack} className="text-sm font-semibold text-text-secondary hover:text-primary-deep">← Quay lại danh sách đơn hàng</Button>;

  if (!order) return <div ref={pageRef} className="space-y-4">
    {back}
    <section className="rounded-xl border border-neutral-border bg-white px-5 py-10 text-center shadow-sm">
      {loading ? <p className="text-sm text-text-muted">Đang tải chi tiết…</p> : <>
        <p role="alert" className="text-sm text-red-800">{error || "Không tìm thấy đơn hàng này."}</p>
        <Button type="button" onClick={onReload} className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">Thử lại</Button>
      </>}
    </section>
  </div>;

  // The prompt closes by itself once the Order can no longer be cancelled (changed meanwhile).
  const showCancelDialog = cancelling && order.canCancel;
  const cancellation = order.status === "CANCELLED"
    ? order.history.findLast((entry) => entry.newStatus === "CANCELLED")
    : undefined;

  return <div ref={pageRef} className="space-y-5">
    {/* Back link, title, and the only lifecycle and cancellation actions. */}
    <div className="flex flex-col gap-4 border-b border-neutral-border pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {back}
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h2 className="font-serif text-3xl font-semibold text-text-primary">Đơn {shortOrderId(order.id)}</h2>
          <OrderStatusBadge status={order.status} />
        </div>
        <p className="mt-1.5 text-sm text-text-muted">
          Tạo lúc {formatShopDateTime(order.createdAt)}
          {order.nextStatus && <> · Bước tiếp theo: <strong className="text-text-secondary">{ORDER_STATUS_LABELS[order.nextStatus]}</strong></>}
        </p>
        <p className="mt-1 break-all font-mono text-xs text-text-muted">{order.id}</p>
      </div>
      {(order.canCancel || order.nextStatus) && <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {order.canCancel && <Button type="button" disabled={saving} onClick={() => setCancelling(true)} className="min-h-11 rounded-lg border border-red-200 bg-white px-4 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50">Hủy đơn</Button>}
        {order.nextStatus && <Button type="button" disabled={saving} onClick={() => void onAdvance()} className="min-h-11 rounded-lg bg-primary px-5 text-sm font-bold text-white hover:bg-primary-hover disabled:opacity-50">{saving && !showCancelDialog ? "Đang cập nhật…" : ADVANCE_LABELS[order.status] ?? "Chuyển bước tiếp theo"}</Button>}
      </div>}
    </div>

    {error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
    {feedback && !showCancelDialog && <p role={feedback.kind === "error" ? "alert" : "status"} className={`rounded-lg px-4 py-3 text-sm ${feedback.kind === "error" ? "bg-red-50 text-red-800" : "bg-accent-sage-light text-text-primary"}`}>{feedback.text}</p>}

    {cancellation && <CancellationBlock entry={cancellation} order={order} viewerId={viewerId} />}

    <div className="grid min-w-0 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="min-w-0 space-y-5">
        {/* Product lines and the Order total are intentionally one visual table. */}
        <Card title="Sản phẩm">
          <div className="-mx-4 -mb-4 sm:-mx-5 sm:-mb-5">
            {order.lines.map((line) => <div key={line.productId} className="flex items-start justify-between gap-4 border-t border-neutral-border px-4 py-3 sm:px-5"><div className="min-w-0"><p className="font-semibold text-text-primary">{line.productName}</p><p className="mt-1 text-xs text-text-muted">{line.productType} · {line.quantity} sản phẩm × {formatMoney(line.unitPrice)}</p></div><p className="whitespace-nowrap font-semibold tabular-nums text-text-primary">{formatMoney(line.lineTotal)}</p></div>)}
            <div className="flex items-center justify-between border-t border-neutral-border bg-neutral-canvas/60 px-4 py-3 sm:px-5"><span className="text-sm font-semibold text-text-secondary">Tổng cộng</span><strong className="text-lg tabular-nums text-primary-deep">{formatMoney(order.total)}</strong></div>
          </div>
        </Card>

        <Card title="Lịch sử trạng thái">
          <ol className="space-y-4 border-l-2 border-neutral-border pl-4">
            {order.history.map((entry, index) => <li key={`${entry.createdAt}-${index}`} className="relative">
              <span className={`absolute -left-[21px] top-1 size-2.5 rounded-full ${entry.newStatus === "CANCELLED" ? "bg-red-700" : "bg-primary"}`} />
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="font-semibold text-text-primary">{ORDER_STATUS_LABELS[entry.newStatus]}</span>
                <span className="text-xs text-text-muted">{formatShopDateTime(entry.createdAt)} · {actorOf(entry, order, viewerId).short}</span>
              </div>
              {entry.note && <p className="mt-1 whitespace-pre-wrap break-words text-sm text-text-secondary">{entry.note}</p>}
            </li>)}
          </ol>
        </Card>
      </div>

      <div className="min-w-0 space-y-5">
        <Card title="Giao hàng">
          <dl className="space-y-3">
            <Field label="Người nhận">{order.address.recipientName}</Field>
            <Field label="Điện thoại">{order.address.recipientPhone}</Field>
            <Field label="Địa chỉ">{order.address.deliveryAddress}</Field>
            <Field label="Ngày giao">{formatCalendarDate(order.deliveryDate)} · {deliverySlotLabel(order.deliveryTimeSlot)}</Field>
            {order.customerNote && <Field label="Ghi chú khách hàng"><span className="whitespace-pre-wrap">{order.customerNote}</span></Field>}
          </dl>
        </Card>

        <Card title="Thanh toán">
          <dl className="space-y-3">
            <Field label="Phương thức">{order.paymentMethod}</Field>
            <Field label="Trạng thái">{order.paymentStatus}</Field>
          </dl>
        </Card>

        {stock && <StockCard stock={stock} />}
      </div>
    </div>

    {showCancelDialog && <CancelOrderDialog saving={saving} error={feedback?.kind === "error" ? feedback.text : ""} onClose={() => setCancelling(false)} onCancel={onCancel} />}
  </div>;
}

/**
 * Who changed the status. The server gives the account id only: the Order's own customer, or
 * someone from the shop (Staff or Admin), who may be the person looking at the page.
 */
function actorOf(entry: HistoryEntry, order: ManagementOrder, viewerId: string | undefined) {
  if (!entry.changedBy) return { short: "Không rõ người thực hiện", long: "Không rõ người thực hiện" };
  if (entry.changedBy === order.customerId) return { short: "Khách hàng", long: "Khách hàng" };
  if (entry.changedBy === viewerId) return { short: "Bạn", long: "Cửa hàng · bạn" };
  return { short: "Cửa hàng", long: `Cửa hàng · tài khoản #${entry.changedBy.slice(0, 8)}` };
}

/** U4: who cancelled, when, from which status, and the reason in full. */
function CancellationBlock({ entry, order, viewerId }: { entry: HistoryEntry; order: ManagementOrder; viewerId: string | undefined }) {
  return <section aria-labelledby="order-cancellation-heading" className="rounded-xl border border-red-200 bg-red-50/60 p-4 sm:p-5">
    <h3 id="order-cancellation-heading" className="font-serif text-lg font-semibold text-red-800">Đơn hàng đã bị hủy</h3>
    <dl className="mt-3 grid gap-3 sm:grid-cols-3">
      <Field label="Người hủy"><strong>{actorOf(entry, order, viewerId).long}</strong></Field>
      <Field label="Thời điểm">{formatShopDateTime(entry.createdAt)}</Field>
      <Field label="Trạng thái khi hủy">{entry.oldStatus ? ORDER_STATUS_LABELS[entry.oldStatus] : "—"}</Field>
    </dl>
    <p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-text-muted">Lý do</p>
    <p className="mt-1 whitespace-pre-wrap break-words rounded-lg border border-red-100 bg-white px-3 py-2.5 text-sm text-text-primary">{entry.note || "Không có ghi chú."}</p>
  </section>;
}

/** The materials this waiting Order still lacks; the stock alert at the top lists them for every Order. */
function StockCard({ stock }: { stock: OrderStock }) {
  return <Card title="Nguyên liệu">
    {stock.canPrepare
      ? <p className="text-sm text-text-secondary">Đủ nguyên liệu để bắt đầu chuẩn bị.</p>
      : <>
        <p className="text-sm font-semibold text-red-700">Chưa đủ nguyên liệu để bắt đầu chuẩn bị.</p>
        <ul className="mt-2 space-y-1.5">
          {stock.shortages.map((shortage) => <li key={shortage.materialId} className="flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 break-words text-text-primary">{shortage.materialName}</span>
            <span className="whitespace-nowrap font-semibold tabular-nums text-red-700">thiếu {formatAmount(shortage.shortBy, shortage.unitOfMeasure)}</span>
          </li>)}
        </ul>
      </>}
  </Card>;
}

/** The required cancel reason; it is saved in the status history and shown in the cancellation block. */
function CancelOrderDialog({ saving, error, onClose, onCancel }: {
  saving: boolean;
  error: string;
  onClose: () => void;
  onCancel: (note: string) => Promise<boolean>;
}) {
  const [note, setNote] = useState("");
  // The page's last message may be about something else (e.g. a refused confirm); show only this prompt's own.
  const [submitted, setSubmitted] = useState(false);
  const noteRef = useRef<HTMLTextAreaElement>(null);

  // autoFocus does not survive showModal(), which runs after it and focuses the Close button.
  useEffect(() => noteRef.current?.focus(), []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!note.trim()) return;
    setSubmitted(true);
    if (await onCancel(note.trim())) onClose();
  }

  return <ModalDialog
    title="Hủy đơn hàng"
    onClose={() => { if (!saving) onClose(); }}
    footer={<div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <Button type="button" disabled={saving} onClick={onClose} className="min-h-11 rounded-lg border border-neutral-border px-4 text-sm font-semibold text-text-secondary">Quay lại</Button>
      <Button type="submit" form="cancel-order-form" disabled={saving || !note.trim()} className="min-h-11 rounded-lg bg-red-700 px-5 text-sm font-bold text-white disabled:opacity-50">{saving ? "Đang hủy…" : "Xác nhận hủy đơn"}</Button>
    </div>}
  >
    <form id="cancel-order-form" onSubmit={(event) => void submit(event)} className="space-y-3">
      <p className="text-sm text-text-muted">Lý do là bắt buộc. Nó được lưu trong lịch sử đơn hàng và khách hàng cũng thấy được.</p>
      {submitted && error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
      <label className="flex flex-col gap-1 text-xs font-semibold text-text-secondary">Lý do hủy đơn
        <textarea ref={noteRef} required rows={5} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Nhập lý do hủy đơn…" className="resize-y rounded-lg border border-neutral-border bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-primary" />
      </label>
    </form>
  </ModalDialog>;
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return <section className="min-w-0 overflow-hidden rounded-xl border border-neutral-border bg-white p-4 shadow-sm sm:p-5">
    <h3 className="mb-3 font-serif text-lg font-semibold text-text-primary">{title}</h3>
    {children}
  </section>;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <div className="min-w-0"><dt className="text-[10px] font-bold uppercase tracking-wider text-text-muted">{label}</dt><dd className="mt-1 break-words text-sm text-text-primary">{children}</dd></div>;
}
