"use client";

import Link from "next/link";
import Button from "@/components/ui/Button";
import Notice, { NoticeLink } from "@/components/ui/Notice";
import ProductImage from "@/components/ui/ProductImage";
import CheckoutGate from "@/features/checkout/components/CheckoutGate";
import CheckoutHeader from "@/features/checkout/components/CheckoutHeader";
import Stepper from "@/features/checkout/components/Stepper";
import { usePlaceOrder } from "@/features/checkout/hooks/use-place-order";
import { deliverySlotLabel } from "@/lib/services/orders";
import { formatCalendarDate, formatVND } from "@/lib/utils";

/**
 * Checkout · Confirm — /checkout/confirm  (step 2 of 3)
 *
 * The current Cart lines and prices, the chosen address, delivery date and slot and note, then a
 * COD order.
 */
export default function ConfirmPage() {
  return (
    <div className="min-h-dvh flex flex-col bg-neutral-canvas">
      {/* Desktop storefront Header / mobile back-bar. */}
      <CheckoutHeader title="Xác nhận đơn hàng" backHref="/checkout/delivery" />
      {/* Shows a notice instead of the review when checkout is not available. */}
      <CheckoutGate>
        <ConfirmView />
      </CheckoutGate>
    </div>
  );
}

/**
 * The order review: stepper → (left) products, delivery details, payment method → (right) price
 * summary and "ĐẶT HÀNG" button. On mobile the summary follows the details and the button sits at
 * the bottom. Submit logic lives in `features/checkout/hooks/use-place-order.ts`.
 */
function ConfirmView() {
  const { cart, selection, address, needsNewSelection, placing, error, submit } = usePlaceOrder();

  // Delivery choices are missing or stale: ask the customer to pick them again.
  if (needsNewSelection || !selection) {
    return (
      <Notice title="Vui lòng chọn lại địa chỉ, ngày và giờ giao.">
        <NoticeLink href="/checkout/delivery">CHỌN GIAO HÀNG</NoticeLink>
      </Notice>
    );
  }
  if (!cart) return null;

  return (
    <>
      <div className="flex-1 overflow-y-auto no-scrollbar md:flex-none md:overflow-visible">
        {/* Step indicator with "XÁC NHẬN" active. */}
        <Stepper current={2} />

        <div className="md:max-w-[1080px] md:mx-auto md:w-full md:mt-6 md:grid md:grid-cols-[1fr_360px] md:gap-6 md:items-start">
          <div>
            {/* Order-placement error with a link back to the cart. */}
            {error && (
              <p role="alert" className="mx-[22px] mt-6 rounded-xl border border-primary bg-neutral-surface p-4 font-sans text-body-sm text-primary md:mt-0">
                {error}{" "}
                <Link href="/cart" className="font-bold underline">Xem giỏ hàng</Link>
              </p>
            )}

            <div className="flex items-baseline justify-between mt-[30px] mb-[14px] px-[22px] md:mt-0">
              {/* Products heading with "SỬA" link to the cart, then one row per line. */}
              <h2 className="font-serif font-medium text-[27px] m-0">Sản phẩm</h2>
              <Link href="/cart" className="font-sans font-bold text-body-sm tracking-button text-primary">SỬA</Link>
            </div>
            <div className="px-[22px]">
              {cart.lines.map((line) => (
                <div key={line.productId} className="flex items-center gap-4 py-4 border-b border-neutral-border">
                  <div className="relative w-[58px] h-[58px] rounded-[10px] flex-shrink-0 overflow-hidden bg-neutral-raised">
                    <ProductImage src={line.mainImageUrl} alt={line.name} sizes="58px" />
                  </div>
                  <div className="flex-1">
                    <div className="font-serif font-medium text-[20px] text-text-primary">{line.name}</div>
                    <div className="font-sans text-body-sm text-text-muted mt-[2px]">SL: {line.quantity}</div>
                  </div>
                  <div className="font-sans font-bold text-[18px] text-primary">{formatVND(line.basePrice)}</div>
                </div>
              ))}
            </div>

            <div className="flex items-baseline justify-between mt-[26px] mb-[14px] px-[22px]">
              {/* Delivery heading with "SỬA" link, then the address / date-slot / note card. */}
              <h2 className="font-serif font-medium text-[27px] m-0">Giao hàng</h2>
              <Link href="/checkout/delivery" className="font-sans font-bold text-body-sm tracking-button text-primary">
                SỬA
              </Link>
            </div>
            <div className="mx-[22px] bg-neutral-surface border border-neutral-border rounded-[14px] p-[18px]">
              <div className="flex gap-3">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: 20 }}>location_on</span>
                <div className="font-sans text-[16px] leading-[1.5] text-text-secondary">
                  {address ? (
                    <>
                      <span className="font-bold text-text-primary">{address.receiverName}</span> · {address.phone}
                      <br />
                      {address.address}
                    </>
                  ) : (
                    "Đang tải địa chỉ..."
                  )}
                </div>
              </div>
              <div className="h-px bg-neutral-border my-4" />
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: 20 }}>calendar_today</span>
                <span className="font-sans text-[16px] text-text-secondary">
                  {formatCalendarDate(selection.deliveryDate)} · {deliverySlotLabel(selection.deliveryTimeSlot)}
                </span>
              </div>
              {selection.customerNote && (
                <div className="flex gap-3 mt-3">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: 20 }}>edit_note</span>
                  <span className="font-sans text-[16px] text-text-secondary whitespace-pre-line break-words min-w-0">
                    {selection.customerNote}
                  </span>
                </div>
              )}
            </div>

            {/* Payment method (COD only). */}
            <h2 className="font-serif font-medium text-[27px] mt-7 mb-[14px] px-[22px]">Thanh toán</h2>
            <div className="px-[22px] flex items-center gap-[14px] py-3">
              <span className="material-symbols-outlined text-text-secondary">payments</span>
              <span className="font-sans text-[17px] text-text-primary">Thanh toán khi nhận hàng (COD)</span>
            </div>
          </div>

          {/* Price summary: subtotal, shipping, total, and the desktop "ĐẶT HÀNG" button. */}
          <aside className="px-[22px] pt-[18px] pb-6 md:px-5 md:pt-5 md:mt-0 md:border md:border-neutral-border md:rounded-2xl md:bg-neutral-surface md:sticky md:top-24">
            <div className="flex items-center justify-between mb-3">
              <span className="font-sans text-[16px] text-text-secondary">Tạm tính (giá hiện tại)</span>
              <span className="font-sans text-[16px] text-text-secondary">{formatVND(cart.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-sans text-[16px] text-text-secondary">Phí giao hàng</span>
              <span className="font-sans text-[16px] text-text-secondary">Miễn phí</span>
            </div>
            <div className="h-px bg-neutral-border mt-2 mb-4" />
            <div className="flex items-baseline justify-between">
              <span className="font-serif font-semibold text-[26px]">Tổng cộng</span>
              <span className="font-serif font-semibold text-[26px]">{formatVND(cart.subtotal)}</span>
            </div>
            <p className="font-sans text-body-sm text-text-muted mt-3 mb-0">
              Giá được chốt khi đơn hàng được tạo.
            </p>

            <PlaceOrderButton
              className="hidden md:block w-full text-center bg-primary text-white rounded-full py-4 mt-5 font-sans font-bold text-body-sm tracking-[0.1em] hover:bg-primary-hover transition-colors"
              placing={placing}
              disabled={placing || !address}
              onClick={() => void submit()}
            />
          </aside>
        </div>
      </div>

      {/* Mobile-only "ĐẶT HÀNG" button at the bottom. */}
      <div className="px-[22px] pt-[14px] pb-[26px] border-t border-neutral-border md:hidden">
        <PlaceOrderButton
          className="block w-full text-center bg-primary text-white rounded-full py-[19px] font-sans font-bold text-body-sm tracking-[0.1em] hover:bg-primary-hover transition-colors"
          placing={placing}
          disabled={placing || !address}
          onClick={() => void submit()}
        />
      </div>
    </>
  );
}

/** The "ĐẶT HÀNG" button; shows a progress label while the order is being placed. */
function PlaceOrderButton({
  className,
  placing,
  disabled,
  onClick,
}: {
  className: string;
  placing: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <Button onClick={onClick} disabled={disabled} className={className}>
      {placing ? "ĐANG ĐẶT HÀNG..." : "ĐẶT HÀNG"}
    </Button>
  );
}
