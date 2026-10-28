"use client";

import Link from "next/link";
import Button from "@/components/ui/Button";
import ProductImage from "@/components/ui/ProductImage";
import DetailHeader from "@/features/account/components/DetailHeader";
import { useMyOrders } from "@/features/account/hooks/use-my-orders";
import {
  CUSTOMER_STATUS_LABELS,
  CUSTOMER_STATUS_STYLES,
  ORDER_FILTERS,
  shortOrderId,
} from "@/features/account/order-status";
import { deliverySlotLabel, type CustomerOrderSummary } from "@/lib/services/orders";
import { formatCalendarDate, formatShopDateTime, formatVND } from "@/lib/utils";

/**
 * Order history for /account/orders — the signed-in account's own orders, newest first, filtered by
 * status. Each card opens the order's details.
 */
/**
 * UI map: mobile back-bar → status filter pills → order cards (or loading/error/empty state)
 * → Previous/Next pagination. One card's layout is in `OrderCard` below.
 */
export default function OrdersView() {
  const orders = useMyOrders();
  const page = orders.page;

  return (
    <div className="min-h-dvh flex flex-col bg-neutral-canvas md:min-h-0 md:block md:bg-transparent">
      {/* Mobile-only back-bar; desktop uses the account layout title. */}
      <DetailHeader title="Đơn hàng" />

      <div className="flex-1 overflow-y-auto no-scrollbar pt-6 pb-20 md:flex-none md:overflow-visible md:pt-0 md:pb-0">
        {/* Status filter pills. */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar px-5 mb-4 md:px-0">
          {ORDER_FILTERS.map((f) => {
            const on = f.key === orders.filter;
            return (
              <Button
                key={f.key}
                onClick={() => orders.setFilter(f.key)}
                aria-pressed={on}
                className={`whitespace-nowrap flex-shrink-0 rounded-full px-4 py-[5px] font-sans font-bold text-label uppercase tracking-badge transition-colors ${
                  on
                    ? "bg-primary text-white border border-primary"
                    : "bg-transparent border border-secondary text-text-secondary hover:bg-neutral-surface"
                }`}
              >
                {f.label}
              </Button>
            );
          })}
        </div>

        {/* Order list, including its error, loading, and empty states. */}
        <div className="px-5 flex flex-col gap-4 md:px-0">
          {orders.error ? (
            <div role="alert" className="py-10 text-center font-sans text-body text-primary">
              {orders.error}{" "}
              <Button onClick={orders.reload} className="font-bold underline">Thử lại</Button>
            </div>
          ) : !page ? (
            <p className="py-10 text-center font-sans text-body text-text-muted">Đang tải đơn hàng...</p>
          ) : page.content.length === 0 ? (
            <div className="py-10 text-center flex flex-col items-center gap-3">
              <p className="font-serif italic text-heading-sm text-text-muted m-0">Không có đơn hàng nào.</p>
              <Link href="/shop" className="font-sans font-bold text-body-sm tracking-button text-primary underline">
                MUA SẮM NGAY
              </Link>
            </div>
          ) : (
            page.content.map((order) => <OrderCard key={order.id} order={order} />)
          )}
        </div>

        {/* Pagination; only shown when there is more than one page. */}
        {page && page.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 pt-6 md:px-0">
            <Button
              onClick={orders.previous}
              disabled={page.page === 0 || orders.loading}
              className="font-sans font-bold text-body-sm text-primary disabled:text-text-muted"
            >
              ← Trước
            </Button>
            <span className="font-sans text-body-sm text-text-muted">
              Trang {page.page + 1}/{page.totalPages}
            </span>
            <Button
              onClick={orders.next}
              disabled={page.page + 1 >= page.totalPages || orders.loading}
              className="font-sans font-bold text-body-sm text-primary disabled:text-text-muted"
            >
              Sau →
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

/** One order card linking to its detail page: header (code/time/status) → first product → delivery and total. */
function OrderCard({ order }: { order: CustomerOrderSummary }) {
  const line = order.firstLine;
  const otherLines = order.lineCount - 1;

  return (
    <Link
      href={`/account/orders/${order.id}`}
      className="bg-neutral-surface border border-neutral-border rounded-[4px] p-4 flex flex-col gap-4 hover:border-primary transition-colors"
    >
      {/* Order code, placed time, and status badge. */}
      <div className="flex items-center justify-between gap-3 border-b border-neutral-border pb-3">
        <div className="min-w-0">
          <p className="font-sans font-bold text-body-sm text-text-primary m-0">Mã đơn #{shortOrderId(order.id)}</p>
          <p className="font-sans text-body-sm text-text-muted m-0">Đặt lúc {formatShopDateTime(order.createdAt)}</p>
        </div>
        <span
          className={`flex-shrink-0 px-2 py-[3px] rounded-full font-sans font-bold text-label uppercase tracking-badge ${CUSTOMER_STATUS_STYLES[order.status]}`}
        >
          {CUSTOMER_STATUS_LABELS[order.status]}
        </span>
      </div>

      {/* First product line, plus "and N more" when the order has several. */}
      {line && (
        <div className="flex gap-4">
          <div className="relative w-20 h-24 flex-none rounded-[2px] overflow-hidden bg-neutral-raised">
            <ProductImage src={line.imageUrl} alt={line.productName} sizes="80px" />
          </div>
          <div className="flex-1 min-w-0 flex flex-col gap-1">
            <h3 className="font-serif font-medium text-heading-md text-primary-deep leading-[1.2] m-0">
              {line.productName}
            </h3>
            {otherLines > 0 && (
              <p className="font-sans text-body-sm text-text-muted m-0">và {otherLines} sản phẩm khác</p>
            )}
            <div className="flex items-center justify-between pt-1">
              <span className="font-sans text-body text-text-secondary">x{line.quantity}</span>
              <span className="font-sans font-bold text-body-sm text-primary-deep">{formatVND(line.unitPrice)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Delivery date/slot on the left, item count and total on the right. */}
      <div className="flex items-end justify-between gap-3 border-t border-neutral-border pt-3">
        <div className="min-w-0">
          <p className="font-sans font-bold text-label uppercase tracking-badge text-text-muted m-0">Giao hàng</p>
          <p className="font-sans text-body-sm text-text-secondary m-0">
            {formatCalendarDate(order.deliveryDate)} · {deliverySlotLabel(order.deliveryTimeSlot)}
          </p>
        </div>
        <div className="text-right">
          <p className="font-sans font-bold text-label uppercase tracking-badge text-text-muted m-0">
            Tổng · {order.itemCount} món
          </p>
          <p className="font-serif font-medium text-heading-md text-primary-deep leading-none m-0">
            {formatVND(order.total)}
          </p>
        </div>
      </div>
    </Link>
  );
}
