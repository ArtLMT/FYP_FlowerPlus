"use client";

import Link from "next/link";
import Header from "@/components/layout/Header";
import { orderSummaryRows, usePlacedOrder } from "@/features/checkout/hooks/use-placed-order";
import type { PlacedOrder } from "@/lib/services/orders";
import { formatVND } from "@/lib/utils";

/**
 * Checkout · Done — /checkout/done  (step 3 of 3)
 *
 * Shows the Order exactly as the server created it (POST /api/orders response): its id, initial
 * status, delivery date and slot, note, address snapshot and the prices it fixed.
 *
 * TODO(logic): link to an order-tracking screen once customer order history exists.
 */
export default function DonePage() {
  const order = usePlacedOrder();

  return (
    <div className="min-h-dvh flex flex-col bg-neutral-canvas">
      {/* Desktop: shared storefront Header. */}
      <div className="hidden md:block">
        <Header />
      </div>

      {/* Nothing while reading the stored order, a "not found" message, or the success view. */}
      {order === undefined ? null : order === null ? (
        <div className="flex-1 flex flex-col items-center justify-center px-7 py-24 text-center">
          <p className="font-serif italic text-heading-sm text-text-muted m-0">Không tìm thấy đơn hàng vừa đặt.</p>
          <Link href="/" className="mt-6 font-sans font-bold text-body-sm tracking-button text-primary">VỀ TRANG CHỦ</Link>
        </div>
      ) : (
        <PlacedOrderView order={order} />
      )}
    </div>
  );
}

/** Success screen: check icon → title and order code → receipt card → "continue shopping" / "view order" buttons. */
function PlacedOrderView({ order }: { order: PlacedOrder }) {
  return (
    <>
      <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col items-center px-7 md:justify-center md:py-16">
        {/* Green check icon. */}
        <div className="mt-16 w-24 h-24 rounded-full bg-accent-sage-light flex items-center justify-center text-accent-sage md:mt-0">
          <span className="material-symbols-outlined" style={{ fontSize: 46 }}>check</span>
        </div>

        {/* Success title and short order code. */}
        <h1 className="font-serif font-semibold text-[48px] text-text-primary mt-11 m-0 text-center">
          Đặt hàng thành công!
        </h1>
        <p className="font-sans text-[17px] text-text-muted mt-3 m-0">
          Đơn hàng #{order.id.slice(0, 8).toUpperCase()}
        </p>

        {/* Receipt card: product lines, delivery/payment summary rows, total. */}
        <div className="w-full mt-[30px] bg-neutral-raised border border-neutral-border rounded-2xl px-[22px] md:max-w-md">
          {order.lines.map((line) => (
            <div key={line.productId} className="flex items-start justify-between gap-5 py-[14px] border-b border-neutral-border">
              <span className="font-sans text-[16px] text-text-primary">
                {line.productName} × {line.quantity}
              </span>
              <span className="font-sans font-bold text-[16px] text-text-primary">{formatVND(line.lineTotal)}</span>
            </div>
          ))}
          {orderSummaryRows(order).map((r) => (
            <div key={r.k} className="flex items-start justify-between gap-5 py-[14px] border-b border-neutral-border">
              <span className="font-sans text-[16px] text-text-muted flex-shrink-0">{r.k}</span>
              <span className="font-sans font-bold text-[16px] text-text-primary text-right">{r.v}</span>
            </div>
          ))}
          <div className="flex items-start justify-between gap-5 py-[18px]">
            <span className="font-sans text-[16px] text-text-muted">Tổng cộng</span>
            <span className="font-sans font-bold text-[22px] text-primary">{formatVND(order.total)}</span>
          </div>
        </div>
      </div>

      {/* "TIẾP TỤC MUA SẮM" and "XEM ĐƠN HÀNG" buttons. */}
      <div className="px-[22px] pt-[14px] pb-[26px] flex flex-col gap-3 md:max-w-md md:mx-auto md:w-full md:pb-16">
        <Link
          href="/shop"
          className="w-full text-center bg-primary text-white rounded-full py-[18px] font-sans font-bold text-body-sm tracking-[0.1em] hover:bg-primary-hover transition-colors"
        >
          TIẾP TỤC MUA SẮM
        </Link>
        <Link
          href={`/account/orders/${order.id}`}
          className="w-full text-center bg-transparent text-primary border-[1.5px] border-primary rounded-full py-[18px] font-sans font-bold text-body-sm tracking-[0.1em] hover:bg-neutral-surface transition-colors"
        >
          XEM ĐƠN HÀNG
        </Link>
      </div>
    </>
  );
}
