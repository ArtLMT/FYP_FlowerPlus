"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import CheckoutHeader from "@/features/checkout/components/CheckoutHeader";
import Stepper from "@/features/checkout/components/Stepper";
import { formatVND } from "@/lib/utils";
import { useCart } from "@/features/cart/cart-provider";
import VoucherField from "@/features/cart/VoucherField";
import { paymentMethods, addresses } from "@/lib/mock-data";

/**
 * Checkout · Confirm — /checkout/confirm  (step 2 of 3)
 *
 * Reads the selected cart items + totals (incl. the applied voucher) from the
 * cart store. Placing the order clears the cart and advances to the success
 * screen.
 *
 * TODO(api): submit the order and process payment for real.
 */

const DELIVERY = 150000;

export default function ConfirmPage() {
  const router = useRouter();
  const { items, subtotal, discount, freeShipping, clear } = useCart();
  const [pay, setPay] = useState(paymentMethods[0].kind);

  const selected = items.filter((i) => i.selected);
  const delivery = selected.length ? (freeShipping ? 0 : DELIVERY) : 0;
  const total = Math.max(0, subtotal - discount + delivery);

  const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0];

  const placeOrder = () => {
    // TODO(api): POST the order + payment; only clear on success.
    clear();
    router.push("/checkout/done");
  };

  const summary = [
    { k: "Tạm tính", v: formatVND(subtotal), muted: false },
    { k: "Giảm giá", v: "-" + formatVND(discount), muted: true },
    { k: "Phí giao hàng", v: freeShipping && selected.length ? "Miễn phí" : formatVND(delivery), muted: false },
  ];

  return (
    <div className="min-h-dvh flex flex-col bg-neutral-canvas">
      <CheckoutHeader title="Xác nhận đơn hàng" backHref="/checkout/delivery" />

      <div className="flex-1 overflow-y-auto no-scrollbar md:flex-none md:overflow-visible">
        <Stepper current={2} />

        <div className="md:max-w-[1080px] md:mx-auto md:w-full md:mt-6 md:grid md:grid-cols-[1fr_360px] md:gap-6 md:items-start">
          {/* LEFT column — items, delivery, note, payment, voucher */}
          <div>
        {/* Order items — from the cart */}
        <h2 className="font-serif font-medium text-[27px] mt-[30px] mb-[14px] px-[22px] md:mt-0">Sản phẩm</h2>
        <div className="px-[22px]">
          {selected.map(({ product, qty }) => (
            <div key={product.id} className="flex items-center gap-4 py-4 border-b border-neutral-border">
              <div className="relative w-[58px] h-[58px] rounded-[10px] flex-shrink-0 overflow-hidden bg-neutral-raised">
                <Image src={product.imageUrl} alt={product.name} fill sizes="58px" style={{ objectFit: "cover" }} />
              </div>
              <div className="flex-1">
                <div className="font-serif font-medium text-[20px] text-text-primary">{product.name}</div>
                <div className="font-sans text-body-sm text-text-muted mt-[2px]">SL: {qty}</div>
              </div>
              <div className="font-sans font-bold text-[18px] text-primary">{formatVND(product.price)}</div>
            </div>
          ))}
        </div>

        {/* Delivery summary */}
        <div className="flex items-baseline justify-between mt-[26px] mb-[14px] px-[22px]">
          <h2 className="font-serif font-medium text-[27px] m-0">Tóm tắt giao hàng</h2>
          <Link href="/checkout/delivery" className="font-sans font-bold text-body-sm tracking-button text-primary">
            SỬA
          </Link>
        </div>
        <div className="mx-[22px] bg-neutral-surface border border-neutral-border rounded-[14px] p-[18px]">
          <div className="flex gap-3 text-text-secondary">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: 20 }}>location_on</span>
            <div className="font-sans text-[16px] leading-[1.5] text-text-secondary">
              {defaultAddress.line1}<br />
              {defaultAddress.line2}
            </div>
          </div>
          <div className="h-px bg-neutral-border my-4" />
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: 20 }}>calendar_today</span>
            <span className="font-sans text-[16px] text-text-secondary">Hôm nay, 21/06 · 15:00 – 18:00</span>
          </div>
        </div>

        {/* Note */}
        <div className="px-[22px] pt-[22px]">
          <div className="font-sans text-body-sm text-text-muted mb-[6px]">Ghi chú giao hàng (không bắt buộc)</div>
          <input
            type="text"
            placeholder="VD: Bấm chuông hai lần"
            className="w-full bg-transparent border-b-[1.5px] border-neutral-border py-2 px-[2px] font-sans text-[16px] text-text-primary placeholder:text-text-muted outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Payment */}
        <h2 className="font-serif font-medium text-[27px] mt-7 mb-[14px] px-[22px]">Phương thức thanh toán</h2>
        <div className="px-[22px] flex flex-col gap-1">
          {paymentMethods.map((p) => {
            const sel = pay === p.kind;
            return (
              <button key={p.id} onClick={() => setPay(p.kind)} aria-pressed={sel} className="flex items-center gap-[14px] py-3">
                <span
                  className={`flex-shrink-0 w-[22px] h-[22px] rounded-full inline-flex items-center justify-center border-2 ${
                    sel ? "border-primary" : "border-secondary"
                  }`}
                >
                  {sel && <span className="w-[11px] h-[11px] rounded-full bg-primary" />}
                </span>
                <span className="material-symbols-outlined text-text-secondary">{p.icon}</span>
                <span className="font-sans text-[17px] text-text-primary">{p.label}</span>
              </button>
            );
          })}
        </div>

        {/* Voucher */}
        <h2 className="font-serif font-medium text-[27px] mt-7 mb-[14px] px-[22px]">Mã giảm giá</h2>
        <div className="px-[22px]">
          <VoucherField />
        </div>

          </div>
          {/* end LEFT column */}

          {/* Summary — right sidebar (sticky card) on desktop */}
          <aside className="px-[22px] pt-[18px] pb-6 md:px-5 md:pt-5 md:mt-0 md:border md:border-neutral-border md:rounded-2xl md:bg-neutral-surface md:sticky md:top-24">
            {summary.map((s) => (
              <div key={s.k} className="flex items-center justify-between mb-3">
                <span className={`font-sans text-[16px] ${s.muted ? "text-primary" : "text-text-secondary"}`}>{s.k}</span>
                <span className={`font-sans text-[16px] ${s.muted ? "text-primary" : "text-text-secondary"}`}>{s.v}</span>
              </div>
            ))}
            <div className="h-px bg-neutral-border mt-2 mb-4" />
            <div className="flex items-baseline justify-between">
              <span className="font-serif font-semibold text-[26px]">Tổng cộng</span>
              <span className="font-serif font-semibold text-[26px]">{formatVND(total)}</span>
            </div>

            {/* Desktop place order (mobile uses the footer below) */}
            <button
              onClick={placeOrder}
              className="hidden md:block w-full text-center bg-primary text-white rounded-full py-4 mt-5 font-sans font-bold text-body-sm tracking-[0.1em] hover:bg-primary-hover transition-colors"
            >
              ĐẶT HÀNG
            </button>
          </aside>
        </div>
        {/* end grid */}
      </div>

      {/* Place order — mobile footer only */}
      <div className="px-[22px] pt-[14px] pb-[26px] border-t border-neutral-border md:hidden">
        <button
          onClick={placeOrder}
          className="block w-full text-center bg-primary text-white rounded-full py-[19px] font-sans font-bold text-body-sm tracking-[0.1em] hover:bg-primary-hover transition-colors"
        >
          ĐẶT HÀNG
        </button>
      </div>
    </div>
  );
}
