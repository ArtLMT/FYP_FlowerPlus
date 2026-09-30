"use client";

import { useState } from "react";
import Link from "next/link";
import CheckoutHeader from "@/features/checkout/components/CheckoutHeader";
import Stepper from "@/features/checkout/components/Stepper";
import { addresses, deliveryDates, deliveryTimeSlots } from "@/lib/mock-data";

/**
 * Checkout · Delivery — /checkout/delivery  (step 1 of 3)
 *
 * Addresses / dates / time slots come from the central mock. The selections
 * are interface state.
 *
 * TODO(logic): "Thêm địa chỉ" and CONTINUE persist nothing yet.
 */

export default function DeliveryPage() {
  const [addr, setAddr] = useState(0);
  const [date, setDate] = useState("today");
  const [slot, setSlot] = useState(1);

  return (
    <div className="min-h-dvh flex flex-col bg-neutral-canvas">
      <CheckoutHeader title="Xác nhận đơn" backHref="/cart" />

      <div className="flex-1 overflow-y-auto no-scrollbar md:flex-none md:overflow-visible md:max-w-3xl md:mx-auto md:w-full">
        <Stepper current={1} />

        {/* Address */}
        <h2 className="font-serif font-medium text-[27px] mt-8 mb-4 px-[22px]">Địa chỉ giao hàng</h2>
        <div className="px-[22px] flex flex-col gap-[14px] md:grid md:grid-cols-2">
          {addresses.map((a, i) => {
            const sel = addr === i;
            return (
              <button
                key={a.id}
                onClick={() => setAddr(i)}
                aria-pressed={sel}
                className={`block w-full text-left rounded-[14px] p-[18px] transition-colors ${
                  sel
                    ? "bg-neutral-surface border-[1.5px] border-primary"
                    : "bg-neutral-raised border-[1.5px] border-transparent"
                }`}
              >
                <div className="flex items-center gap-3 mb-[10px]">
                  <span
                    className={`flex-shrink-0 w-[22px] h-[22px] rounded-full inline-flex items-center justify-center border-2 ${
                      sel ? "border-primary" : "border-secondary"
                    }`}
                  >
                    {sel && <span className="w-[11px] h-[11px] rounded-full bg-primary" />}
                  </span>
                  <span className="font-sans font-bold text-[18px] text-text-primary">{a.name}</span>
                  {a.isDefault && (
                    <span className="px-[10px] py-[3px] rounded-md font-sans font-bold text-label tracking-badge bg-tertiary text-primary">
                      MẶC ĐỊNH
                    </span>
                  )}
                </div>
                <div className={`pl-9 font-sans text-[16px] leading-[1.5] ${sel ? "text-primary" : "text-text-secondary"}`}>
                  {a.line1}
                  <br />
                  {a.line2}
                </div>
                {a.phone && (
                  <div className={`pl-9 mt-[10px] font-sans text-[16px] ${sel ? "text-primary" : "text-text-secondary"}`}>
                    {a.phone}
                  </div>
                )}
              </button>
            );
          })}
        </div>
        {/* TODO(logic): open an add-address form */}
        <button className="flex items-center gap-1 mx-[22px] mt-[18px] font-sans font-bold text-[16px] text-primary">
          <span className="material-symbols-outlined" style={{ fontSize: 21 }}>add</span>
          Thêm địa chỉ mới
        </button>

        {/* Date */}
        <h2 className="font-serif font-medium text-[27px] mt-[34px] mb-4 px-[22px]">Ngày giao</h2>
        <div className="flex gap-3 px-[22px] overflow-x-auto no-scrollbar md:flex-wrap md:overflow-visible">
          {deliveryDates.map((d) => {
            const on = date === d.key;
            return (
              <button
                key={d.key}
                onClick={() => setDate(d.key)}
                aria-pressed={on}
                className={`whitespace-nowrap rounded-full px-[22px] py-[14px] font-sans font-bold text-[16px] inline-flex items-center gap-[6px] transition-colors ${
                  on ? "bg-primary text-white" : "bg-neutral-raised text-text-primary"
                }`}
              >
                {d.calendar && <span className="material-symbols-outlined" style={{ fontSize: 18 }}>calendar_today</span>}
                {d.label}
              </button>
            );
          })}
        </div>

        {/* Time */}
        <h2 className="font-serif font-medium text-[27px] mt-[34px] mb-4 px-[22px]">Giờ giao</h2>
        <div className="grid grid-cols-2 gap-[14px] px-[22px] md:grid-cols-4">
          {deliveryTimeSlots.map((label, i) => {
            const on = slot === i;
            return (
              <button
                key={label}
                onClick={() => setSlot(i)}
                aria-pressed={on}
                className={`rounded-full py-[18px] px-[10px] font-sans font-bold text-[16px] transition-colors ${
                  on ? "bg-primary text-white" : "bg-neutral-raised text-text-primary"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-[10px] px-[22px] pt-[18px] pb-6 text-text-muted">
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>info</span>
          <span className="font-serif italic text-[16px] text-text-muted">
            Khung giờ nhanh hết — đặt sớm để giữ giờ bạn muốn.
          </span>
        </div>
      </div>

      {/* Continue — full-width pinned footer on mobile, right-aligned inline on desktop */}
      <div className="px-[22px] pt-[14px] pb-[26px] border-t border-neutral-border md:max-w-3xl md:mx-auto md:w-full md:flex md:justify-end md:border-t-0 md:pt-2 md:pb-10">
        <Link
          href="/checkout/confirm"
          className="block w-full text-center bg-primary text-white rounded-full py-[19px] font-sans font-bold text-body-sm tracking-[0.1em] hover:bg-primary-hover transition-colors md:w-auto md:px-16"
        >
          TIẾP TỤC XÁC NHẬN
        </Link>
      </div>
    </div>
  );
}
