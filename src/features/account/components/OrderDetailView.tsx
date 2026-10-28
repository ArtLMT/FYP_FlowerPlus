"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import ModalDialog from "@/components/ui/ModalDialog";
import ProductImage from "@/components/ui/ProductImage";
import { useToast } from "@/components/ui/ToastProvider";
import DetailHeader from "@/features/account/components/DetailHeader";
import {
  CUSTOMER_STATUS_LABELS,
  CUSTOMER_STATUS_STYLES,
  PAYMENT_STATUS_LABELS,
  TRACK_STEPS,
  shortOrderId,
} from "@/features/account/order-status";
import { useAsyncAction } from "@/lib/hooks/use-async-action";
import { useResource } from "@/lib/hooks/use-resource";
import { cancelMyOrder, deliverySlotLabel, getMyOrder, type CustomerOrder, type CustomerOrderStatus } from "@/lib/services/orders";
import { formatCalendarDate, formatShopDateTime, formatVND } from "@/lib/utils";

/**
 * One of the signed-in account's orders — /account/orders/[id]. Everything comes from the order's
 * snapshots: later product or address edits never change it. Images are the products' current ones.
 *
 * UI map:
 * - `OrderDetailView`: mobile back-bar, desktop back link, and the loading/error/content switch.
 * - `OrderDetail`: the stacked cards (status → delivery → products → payment → history).
 * - `CancelOrderDialog`: the reason prompt opened by the status card's "Hủy đơn hàng" button.
 * - `Tracker`: the four-step progress bar inside the status card.
 * - `Card` / `Row` / `Amount`: shared card shell, icon row, and label/value row.
 * - Status text and badge colours live in `order-status.ts`.
 */
export default function OrderDetailView({ orderId }: { orderId: string }) {
  const order = useResource(() => getMyOrder(orderId), orderId);

  return (
    <div className="min-h-dvh flex flex-col bg-neutral-canvas md:min-h-0 md:block md:bg-transparent">
      {/* Mobile-only back-bar to the order list. */}
      <DetailHeader title="Chi tiết đơn hàng" backHref="/account/orders" />

      <div className="flex-1 overflow-y-auto no-scrollbar pt-6 pb-20 px-5 md:flex-none md:overflow-visible md:p-0">
        <Link
          href="/account/orders"
          className="hidden md:inline-flex items-center gap-1 mb-4 font-sans font-bold text-body-sm text-primary"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
          Tất cả đơn hàng
        </Link>

        {/* Error message with retry, loading text, or the order detail cards. */}
        {order.error ? (
          <div role="alert" className="py-10 text-center font-sans text-body text-primary">
            {order.error.message}{" "}
            {order.error.code === "ORDER_NOT_FOUND" ? (
              <Link href="/account/orders" className="font-bold underline">Về danh sách đơn</Link>
            ) : (
              <Button onClick={order.reload} className="font-bold underline">Thử lại</Button>
            )}
          </div>
        ) : !order.data ? (
          <p className="py-10 text-center font-sans text-body text-text-muted">Đang tải đơn hàng...</p>
        ) : (
          <OrderDetail
            order={order.data}
            onCancelled={(cancelled) => order.setData(() => cancelled)}
            onStale={order.reload}
          />
        )}
      </div>
    </div>
  );
}

/** The full order: one card per section, stacked vertically. */
function OrderDetail({
  order,
  onCancelled,
  onStale,
}: {
  order: CustomerOrder;
  onCancelled: (order: CustomerOrder) => void;
  onStale: () => void;
}) {
  const [cancelling, setCancelling] = useState(false);
  const subtotal = order.lines.reduce((sum, line) => sum + line.lineTotal, 0);
  const cancelled = order.history.findLast((entry) => entry.status === "CANCELLED");

  return (
    <div className="flex flex-col gap-5">
      {/* Reason prompt shown after tapping "Hủy đơn hàng". */}
      {cancelling && (
        <CancelOrderDialog
          orderId={order.id}
          expectedStatus={order.status}
          onClose={() => setCancelling(false)}
          onCancelled={(next) => {
            setCancelling(false);
            onCancelled(next);
          }}
          onStale={() => {
            setCancelling(false);
            onStale();
          }}
        />
      )}

      {/* Status card: order code, placed time, status badge, then cancellation note or progress tracker. */}
      <Card>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-sans font-bold text-[18px] text-text-primary m-0">Mã đơn #{shortOrderId(order.id)}</p>
            <p className="font-sans text-body-sm text-text-muted m-0 mt-1">Đặt lúc {formatShopDateTime(order.createdAt)}</p>
          </div>
          <span
            className={`flex-shrink-0 px-2 py-[3px] rounded-full font-sans font-bold text-label uppercase tracking-badge ${CUSTOMER_STATUS_STYLES[order.status]}`}
          >
            {CUSTOMER_STATUS_LABELS[order.status]}
          </span>
        </div>

        {order.status === "CANCELLED" ? (
          <div className="mt-4 rounded-[4px] bg-red-50 p-3 font-sans text-body-sm text-red-800">
            Đơn hàng đã bị hủy{cancelled?.note ? `: ${cancelled.note}` : "."}
          </div>
        ) : (
          <Tracker status={order.status} />
        )}

        {/* Cancel action; only offered while the shop has not started preparing the order. */}
        {order.canCancel && (
          <div className="mt-5 flex flex-col gap-2 border-t border-neutral-border pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="m-0 font-sans text-body-sm text-text-muted">
              Bạn có thể hủy đơn khi cửa hàng chưa bắt đầu chuẩn bị.
            </p>
            <Button
              type="button"
              onClick={() => setCancelling(true)}
              className="flex-shrink-0 rounded-full border-[1.5px] border-red-200 bg-white px-5 py-2.5 font-sans text-body-sm font-bold text-red-700 transition-colors hover:bg-red-50"
            >
              Hủy đơn hàng
            </Button>
          </div>
        )}
      </Card>

      {/* Delivery card: recipient, address, delivery date/slot, customer note. */}
      <Card title="Giao hàng">
        <Row icon="person">
          <span className="font-bold text-text-primary">{order.address.recipientName}</span> · {order.address.recipientPhone}
        </Row>
        <Row icon="location_on">{order.address.deliveryAddress}</Row>
        <Row icon="calendar_today">
          {formatCalendarDate(order.deliveryDate)} · {deliverySlotLabel(order.deliveryTimeSlot)}
        </Row>
        {order.customerNote && (
          <Row icon="edit_note">
            <span className="whitespace-pre-line break-words">{order.customerNote}</span>
          </Row>
        )}
      </Card>

      {/* Product lines: thumbnail, name, quantity × unit price, line total. */}
      <Card title={`Sản phẩm (${order.lines.length})`}>
        <div className="flex flex-col">
          {order.lines.map((line) => (
            <div key={line.productId} className="flex items-center gap-4 py-3 border-b border-neutral-border last:border-b-0">
              <div className="relative w-[58px] h-[58px] rounded-[10px] flex-shrink-0 overflow-hidden bg-neutral-raised">
                <ProductImage src={line.imageUrl} alt={line.productName} sizes="58px" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-serif font-medium text-[19px] text-text-primary leading-tight">{line.productName}</div>
                <div className="font-sans text-body-sm text-text-muted mt-[2px]">
                  {line.quantity} × {formatVND(line.unitPrice)}
                  {line.discountAmount > 0 && ` · giảm ${formatVND(line.discountAmount)}`}
                </div>
              </div>
              <div className="font-sans font-bold text-[16px] text-primary">{formatVND(line.lineTotal)}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Payment card: method, payment status, subtotal, shipping fee, total. */}
      <Card title="Thanh toán">
        <Amount label="Phương thức" value={order.paymentMethod === "COD" ? "Khi nhận hàng (COD)" : order.paymentMethod} />
        <Amount
          label="Trạng thái"
          value={`${PAYMENT_STATUS_LABELS[order.paymentStatus] ?? order.paymentStatus}${
            order.paidAt ? ` · ${formatShopDateTime(order.paidAt)}` : ""
          }`}
        />
        <div className="h-px bg-neutral-border my-3" />
        <Amount label="Tạm tính" value={formatVND(subtotal)} />
        <Amount label="Phí giao hàng" value={order.shippingFee === 0 ? "Miễn phí" : formatVND(order.shippingFee)} />
        <div className="flex items-baseline justify-between mt-2">
          <span className="font-serif font-semibold text-[22px]">Tổng cộng</span>
          <span className="font-serif font-semibold text-[22px] text-primary-deep">{formatVND(order.total)}</span>
        </div>
      </Card>

      {/* Status history timeline, newest first. */}
      <Card title="Lịch sử đơn hàng">
        <ol className="m-0 p-0 list-none ml-1.5 border-l border-neutral-border pl-[22px]">
          {[...order.history].reverse().map((entry, index) => (
            <li key={`${entry.status}-${entry.createdAt}`} className="relative pb-5 last:pb-0">
              <span
                className={`absolute -left-[28px] top-[5px] w-3 h-3 rounded-full border ${
                  index === 0 ? "bg-primary border-primary" : "bg-neutral-canvas border-neutral-border"
                }`}
              />
              <p className="font-sans text-body-sm text-text-muted m-0 mb-1">{formatShopDateTime(entry.createdAt)}</p>
              <p className={`font-sans text-body m-0 ${index === 0 ? "text-text-primary font-bold" : "text-text-secondary"}`}>
                {CUSTOMER_STATUS_LABELS[entry.status]}
              </p>
              {entry.note && <p className="font-sans text-body-sm text-text-secondary m-0 mt-1">{entry.note}</p>}
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}

/**
 * Cancel-order modal: explanation, required reason textarea, error message, then Back / Confirm buttons.
 * ORDER_INVALID_STATE means the shop moved the order on meanwhile, so the page reloads it.
 */
function CancelOrderDialog({
  orderId,
  expectedStatus,
  onClose,
  onCancelled,
  onStale,
}: {
  orderId: string;
  /** The status on screen; the server refuses if the order has moved since (BR-STATUS-12). */
  expectedStatus: CustomerOrderStatus;
  onClose: () => void;
  onCancelled: (order: CustomerOrder) => void;
  onStale: () => void;
}) {
  const [note, setNote] = useState("");
  const { busy, error, run } = useAsyncAction();
  const { showToast } = useToast();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const reason = note.trim();
    if (!reason) return;
    void run(
      async () => {
        onCancelled(await cancelMyOrder(orderId, reason, expectedStatus));
        showToast("success", "Đã hủy đơn hàng.");
      },
      (failure) => {
        if (failure.code === "ORDER_INVALID_STATE") {
          showToast("error", failure.message);
          onStale();
        }
      },
    );
  }

  return (
    <ModalDialog
      title="Hủy đơn hàng"
      onClose={() => { if (!busy) onClose(); }}
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" disabled={busy} onClick={onClose} className="min-h-11 rounded-lg border border-neutral-border bg-white px-4 text-sm font-semibold text-text-secondary">
            Quay lại
          </Button>
          <Button type="submit" form="customer-cancel-order-form" disabled={busy || !note.trim()} className="min-h-11 rounded-lg bg-red-700 px-5 text-sm font-bold text-white disabled:opacity-50">
            {busy ? "Đang hủy…" : "Xác nhận hủy đơn"}
          </Button>
        </div>
      }
    >
      <form id="customer-cancel-order-form" onSubmit={submit} className="space-y-3">
        <p className="m-0 text-sm text-text-muted">
          Đơn hàng sẽ bị hủy và không thể khôi phục. Lý do hủy là bắt buộc và sẽ được lưu trong lịch sử đơn hàng.
        </p>
        <label className="flex flex-col gap-1 text-xs font-semibold text-text-secondary">
          Lý do hủy đơn
          <textarea
            autoFocus
            required
            rows={4}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Ví dụ: Tôi đặt nhầm ngày giao…"
            className="resize-y rounded-lg border border-neutral-border bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-primary"
          />
        </label>
        {error && <p role="alert" className="m-0 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
      </form>
    </ModalDialog>
  );
}

/** The four COD steps; every step up to the current status is filled. */
function Tracker({ status }: { status: CustomerOrder["status"] }) {
  const current = TRACK_STEPS.findIndex((step) => step.status === status);
  if (current < 0) return null;
  const progress = (current / (TRACK_STEPS.length - 1)) * 100;

  return (
    <div className="relative mt-6 px-2">
      <div className="absolute top-[11px] left-[38px] right-[38px] h-0.5 bg-neutral-border">
        <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
      </div>
      <ol className="relative flex justify-between m-0 p-0 list-none">
        {TRACK_STEPS.map((step, index) => {
          const done = index < current;
          const here = index === current;
          return (
            <li key={step.status} className="flex flex-col items-center gap-2 w-[60px]">
              {done || (here && status === "COMPLETED") ? (
                <span className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white">
                  <span className="material-symbols-outlined" style={{ fontSize: 15 }}>check</span>
                </span>
              ) : here ? (
                <span className="w-6 h-6 rounded-full bg-neutral-raised border border-primary flex items-center justify-center ring-4 ring-neutral-surface">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                </span>
              ) : (
                <span className="w-6 h-6 rounded-full bg-neutral-canvas border border-neutral-border flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-neutral-border" />
                </span>
              )}
              <span
                className={`whitespace-nowrap font-sans font-bold text-label uppercase tracking-badge text-center ${
                  index <= current ? "text-primary-deep" : "text-text-muted"
                }`}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/** White bordered card with an optional serif title. */
function Card({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section className="bg-neutral-surface border border-neutral-border rounded-[4px] p-4">
      {title && <h2 className="font-serif font-medium text-heading-md text-primary m-0 mb-3">{title}</h2>}
      {children}
    </section>
  );
}

/** Icon + text line used in the delivery card. */
function Row({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 py-1.5 font-sans text-[16px] leading-[1.5] text-text-secondary">
      <span className="material-symbols-outlined text-primary flex-shrink-0" style={{ fontSize: 20 }}>{icon}</span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

/** Label on the left, value on the right; used in the payment card. */
function Amount({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1 font-sans text-[16px] text-text-secondary">
      <span>{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}
