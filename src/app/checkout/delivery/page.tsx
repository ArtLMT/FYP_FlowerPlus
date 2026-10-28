"use client";

import Link from "next/link";
import Button from "@/components/ui/Button";
import CheckoutGate from "@/features/checkout/components/CheckoutGate";
import CheckoutHeader from "@/features/checkout/components/CheckoutHeader";
import Stepper from "@/features/checkout/components/Stepper";
import { NOTE_MAX_LENGTH, useDeliveryForm } from "@/features/checkout/hooks/use-delivery-form";

const DATE_CHOICES = [
  { key: "today", label: "Hôm nay" },
  { key: "tomorrow", label: "Ngày mai" },
  { key: "other", label: "Chọn ngày" },
] as const;

/**
 * Checkout · Delivery — /checkout/delivery  (step 1 of 3)
 *
 * The customer picks one saved address, the delivery date and slot, and may leave a note. New
 * addresses are added in the account address book. Payment is COD only and shipping is free in
 * this slice.
 */
export default function DeliveryPage() {
  return (
    <div className="min-h-dvh flex flex-col bg-neutral-canvas">
      {/* Desktop storefront Header / mobile back-bar. */}
      <CheckoutHeader title="Giao hàng" backHref="/cart" />
      {/* Shows a notice instead of the form when checkout is not available (empty cart, guest, …). */}
      <CheckoutGate>
        <DeliveryForm />
      </CheckoutGate>
    </div>
  );
}

/**
 * The delivery form, top to bottom: stepper → saved-address cards → "add address" link → date chips
 * (and date picker) → time-slot buttons → note → COD info → "TIẾP TỤC XÁC NHẬN" button.
 * Form state lives in `features/checkout/hooks/use-delivery-form.ts`.
 */
function DeliveryForm() {
  const form = useDeliveryForm();

  // Address-book load error / loading text, shown instead of the form.
  if (form.loadError) {
    return <p role="alert" className="px-[22px] py-10 font-sans text-body text-primary">{form.loadError}</p>;
  }
  if (!form.addresses) {
    return <p className="px-[22px] py-10 font-sans text-body text-text-muted">Đang tải sổ địa chỉ...</p>;
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto no-scrollbar md:flex-none md:overflow-visible md:max-w-3xl md:mx-auto md:w-full">
        {/* Step indicator with "GIAO HÀNG" active. */}
        <Stepper current={1} />

        {/* Address section: selectable saved-address cards, or an empty message. */}
        <h2 className="font-serif font-medium text-[27px] mt-8 mb-4 px-[22px]">Địa chỉ giao hàng</h2>
        {form.addresses.length === 0 ? (
          <p className="px-[22px] font-sans text-body text-text-secondary m-0">
            Bạn chưa có địa chỉ nào được lưu.
          </p>
        ) : (
          <div className="px-[22px] flex flex-col gap-[14px] md:grid md:grid-cols-2">
            {form.addresses.map((a) => {
              const sel = form.addressId === a.id;
              return (
                <Button
                  key={a.id}
                  onClick={() => form.setAddressId(a.id)}
                  aria-pressed={sel}
                  className={`block w-full text-left rounded-[14px] p-[18px] transition-colors ${
                    sel
                      ? "bg-neutral-surface border-[1.5px] border-primary"
                      : "bg-neutral-raised border-[1.5px] border-transparent"
                  }`}
                >
                  {/* Radio dot, receiver name, and default badge; address and phone below. */}
                  <div className="flex items-center gap-3 mb-[10px]">
                    <span
                      className={`flex-shrink-0 w-[22px] h-[22px] rounded-full inline-flex items-center justify-center border-2 ${
                        sel ? "border-primary" : "border-secondary"
                      }`}
                    >
                      {sel && <span className="w-[11px] h-[11px] rounded-full bg-primary" />}
                    </span>
                    <span className="font-sans font-bold text-[18px] text-text-primary">{a.receiverName}</span>
                    {a.isDefault && (
                      <span className="px-[10px] py-[3px] rounded-md font-sans font-bold text-label tracking-badge bg-tertiary text-primary">
                        MẶC ĐỊNH
                      </span>
                    )}
                  </div>
                  <div className={`pl-9 font-sans text-[16px] leading-[1.5] ${sel ? "text-primary" : "text-text-secondary"}`}>
                    {a.address}
                  </div>
                  <div className={`pl-9 mt-[10px] font-sans text-[16px] ${sel ? "text-primary" : "text-text-secondary"}`}>
                    {a.phone}
                  </div>
                </Button>
              );
            })}
          </div>
        )}
        {/* Link to the account address book to add a new address. */}
        <Link
          href="/account/info"
          className="inline-flex items-center gap-1 mx-[22px] mt-[18px] font-sans font-bold text-[16px] text-primary"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 21 }}>add</span>
          Thêm địa chỉ trong sổ địa chỉ
        </Link>

        {/* Delivery-date chips: Today / Tomorrow / Pick a date. */}
        <h2 className="font-serif font-medium text-[27px] mt-[34px] mb-4 px-[22px]">Ngày giao</h2>
        <div className="flex gap-3 px-[22px] overflow-x-auto no-scrollbar md:flex-wrap md:overflow-visible">
          {DATE_CHOICES.map((choice) => {
            const on = form.dateChoice === choice.key;
            const closed = choice.key === "today" && form.todayClosed;
            return (
              <Button
                key={choice.key}
                onClick={() => form.chooseDate(choice.key)}
                disabled={closed}
                aria-pressed={on}
                className={`whitespace-nowrap rounded-full px-[22px] py-[14px] font-sans font-bold text-[16px] inline-flex items-center gap-[6px] transition-colors disabled:opacity-50 ${
                  on ? "bg-primary text-white" : "bg-neutral-raised text-text-primary"
                }`}
              >
                {choice.key === "other" && (
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>calendar_today</span>
                )}
                {closed ? "Hôm nay (hết giờ giao)" : choice.label}
              </Button>
            );
          })}
        </div>
        {/* Date picker, shown only for "Chọn ngày". */}
        {form.dateChoice === "other" && (
          <div className="px-[22px] mt-4 flex flex-col gap-2">
            <input
              type="date"
              value={form.date}
              min={form.today}
              onChange={(event) => form.setDate(event.target.value)}
              aria-label="Chọn ngày giao"
              aria-invalid={!form.dateValid}
              className="w-full max-w-xs rounded-[14px] border-[1.5px] border-neutral-border bg-neutral-surface px-4 py-3 font-sans text-[16px] text-text-primary outline-none focus:border-primary"
            />
            {!form.dateValid && (
              <span className="font-sans text-body-sm text-primary">Ngày giao phải từ hôm nay trở đi.</span>
            )}
          </div>
        )}

        {/* Time-slot buttons, or a message when no slot is left today. */}
        <h2 className="font-serif font-medium text-[27px] mt-[34px] mb-4 px-[22px]">Giờ giao</h2>
        {form.dateValid && form.slots.length === 0 ? (
          <p className="px-[22px] font-sans text-body text-text-secondary m-0">
            Hôm nay đã hết khung giờ giao. Vui lòng chọn ngày khác.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-[14px] px-[22px] md:grid-cols-4">
            {form.slots.map((option) => {
              const on = form.slot === option.slot;
              return (
                <Button
                  key={option.slot}
                  onClick={() => form.setSlot(option.slot)}
                  aria-pressed={on}
                  className={`rounded-full py-[18px] px-[10px] font-sans font-bold text-[16px] transition-colors ${
                    on ? "bg-primary text-white" : "bg-neutral-raised text-text-primary"
                  }`}
                >
                  {option.label}
                </Button>
              );
            })}
          </div>
        )}

        {/* Optional note with character counter. */}
        <h2 className="font-serif font-medium text-[27px] mt-[34px] mb-4 px-[22px]">Ghi chú</h2>
        <div className="px-[22px] flex flex-col gap-2">
          <textarea
            value={form.note}
            onChange={(event) => form.setNote(event.target.value)}
            maxLength={NOTE_MAX_LENGTH}
            rows={3}
            placeholder="Lời nhắn trên thiệp, hướng dẫn cho người giao... (không bắt buộc)"
            aria-label="Ghi chú cho đơn hàng"
            className="w-full rounded-[14px] border-[1.5px] border-neutral-border bg-neutral-surface px-4 py-3 font-sans text-[16px] text-text-primary outline-none focus:border-primary resize-y"
          />
          <span className="self-end font-sans text-body-sm text-text-muted">
            {form.note.length}/{NOTE_MAX_LENGTH}
          </span>
        </div>

        {/* COD payment information. */}
        <div className="flex items-start gap-[10px] px-[22px] pt-[18px] pb-6 text-text-muted">
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>info</span>
          <span className="font-serif italic text-[16px] text-text-muted">
            Thanh toán khi nhận hàng (COD). Cửa hàng sẽ xác nhận đơn và giao trong khung giờ bạn chọn.
          </span>
        </div>
      </div>

      {/* Continue button (full-width on mobile, right-aligned on desktop). */}
      <div className="px-[22px] pt-[14px] pb-[26px] border-t border-neutral-border md:max-w-3xl md:mx-auto md:w-full md:flex md:justify-end md:border-t-0 md:pt-2 md:pb-10">
        <Button
          onClick={form.next}
          disabled={!form.canContinue}
          className="block w-full text-center bg-primary text-white rounded-full py-[19px] font-sans font-bold text-body-sm tracking-[0.1em] hover:bg-primary-hover transition-colors md:w-auto md:px-16"
        >
          TIẾP TỤC XÁC NHẬN
        </Button>
      </div>
    </>
  );
}
