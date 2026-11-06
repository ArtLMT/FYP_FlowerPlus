"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import Button from "@/components/ui/Button";
import ModalDialog from "@/components/ui/ModalDialog";
import BouquetSummary, { BouquetBar } from "@/features/custom-order/BouquetSummary";
import ConfirmRequestDialog from "@/features/custom-order/ConfirmRequestDialog";
import MaterialPicker from "@/features/custom-order/MaterialPicker";
import { useCustomBuilder } from "@/features/custom-order/hooks/use-custom-builder";
import { keepFormOpen } from "@/features/custom-order/hooks/use-material-quantities";
import { SIGN_IN_MESSAGE } from "@/lib/api";
import { formatVND } from "@/lib/utils";

const FIELD = "w-full rounded-lg border-[1.5px] border-text-muted/70 bg-white px-4 py-3 font-sans text-[16px] text-text-primary outline-none placeholder:text-text-secondary focus:border-primary-deep";
const LABEL = "mb-1.5 block font-sans text-body-sm font-bold text-text-primary";
const HELP = "m-0 font-sans text-body-sm text-text-secondary";

function Step({ number, title, hint, children }: { number: number; title: string; hint?: string; children: ReactNode }) {
  return <section className="rounded-2xl border border-neutral-border bg-white p-4 shadow-sm sm:p-6">
    <div className="mb-4 flex items-start gap-3">
      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-deep font-sans text-body-sm font-bold text-white" aria-hidden="true">{number}</span>
      <div className="min-w-0">
        <h2 className="m-0 font-serif text-[24px] font-medium leading-[1.3] text-text-primary">{title}</h2>
        {hint && <p className={HELP}>{hint}</p>}
      </div>
    </div>
    {children}
  </section>;
}

/**
 * "Thiết kế bó hoa" (screen inventory A10): numbered steps on the left, the bouquet and its estimate
 * beside them. State lives in `hooks/use-custom-builder.ts`.
 */
export default function CustomBuilder() {
  const b = useCustomBuilder();

  if (b.loadError) {
    const signedOut = b.loadError.status === 401;
    return <div role="alert" className="py-10 text-center font-sans text-body text-primary-deep">
      {signedOut ? SIGN_IN_MESSAGE : b.loadError.message}{" "}
      {signedOut
        ? <Link href="/login?next=/custom" className="font-bold underline">Đăng nhập</Link>
        : <Button onClick={b.reload} className="font-bold underline">Thử lại</Button>}
    </div>;
  }
  if (!b.options) return <p className="py-10 text-center font-sans text-body text-text-secondary">Đang tải lựa chọn...</p>;

  const pickerActions = { quantities: b.quantities, picks: b.picks, refresh: b.materialsRefresh, onSet: b.onSet, onChange: b.onChange, onSettle: b.onSettle };

  return <form onSubmit={b.askToConfirm} onKeyDown={keepFormOpen} className="mt-6 grid items-start gap-5 pb-24 lg:grid-cols-[minmax(0,1fr)_360px] lg:pb-10">
    {b.suspended && <p role="status" className="m-0 rounded-xl border-[1.5px] border-amber-300 bg-amber-50 p-4 font-sans text-body text-amber-950 lg:col-span-2">
      Tài khoản của bạn đang bị tạm khóa đặt hàng. Bạn vẫn có thể xem các lựa chọn và giá, nhưng chưa thể gửi yêu cầu.
    </p>}
    <div className="flex min-w-0 flex-col gap-5">
      <Step number={1} title="Kiểu cắm">
        {b.options.arrangementTypes.length === 0
          ? <p className={HELP}>Cửa hàng chưa mở kiểu cắm nào. Vui lòng quay lại sau.</p>
          : <div className="grid gap-2.5 sm:grid-cols-2 md:grid-cols-3">
            {b.options.arrangementTypes.map((type) => {
              const on = b.typeId === type.id;
              return <Button key={type.id} type="button" aria-pressed={on} onClick={() => b.setTypeId(type.id)} className={`flex items-start justify-between gap-2 rounded-xl border-[1.5px] p-4 text-left ${on ? "border-primary-deep bg-neutral-surface" : "border-neutral-border bg-white hover:border-primary-deep"}`}>
                <span className="min-w-0">
                  <span className="block font-sans text-[16px] font-bold text-text-primary">{type.name}</span>
                  <span className="mt-1 block font-sans text-body-sm text-text-secondary">Phí công {type.labourFee === 0 ? "miễn phí" : formatVND(type.labourFee)}</span>
                </span>
                {on && <span className="material-symbols-outlined flex-shrink-0 text-[20px] text-primary-deep" aria-hidden="true">check_circle</span>}
              </Button>;
            })}
          </div>}
      </Step>

      <Step number={2} title="Chọn hoa" hint="Chọn ít nhất một loại.">
        <MaterialPicker label="loại hoa" type="FLOWER" emptyMessage="Hiện chưa có loại hoa nào." {...pickerActions} />
      </Step>

      <Step number={3} title="Trang trí và ghi chú" hint="Không bắt buộc.">
        <div className="mb-5"><MaterialPicker label="đồ trang trí" type="DECORATION" emptyMessage="Hiện chưa có đồ trang trí nào." {...pickerActions} /></div>
        <label className={LABEL} htmlFor="custom-note">Ghi chú thiết kế</label>
        <textarea id="custom-note" value={b.note} onChange={(event) => b.setNote(event.target.value)} maxLength={500} rows={3} placeholder="Tông màu, phong cách, dịp tặng..." className={FIELD} />
      </Step>

      <Step number={4} title="Giao hàng">
        <label className={LABEL} htmlFor="custom-address">Địa chỉ giao hàng</label>
        {b.addresses.length === 0
          ? <p className={HELP}>Bạn chưa có địa chỉ nào. <Link href="/account/info" className="font-bold text-primary-deep underline">Thêm trong sổ địa chỉ</Link></p>
          : <select id="custom-address" value={b.addressId ?? ""} onChange={(event) => b.setAddressId(event.target.value)} className={FIELD}>
            {b.addresses.map((address) => <option key={address.id} value={address.id}>{address.receiverName} · {address.address}</option>)}
          </select>}

        <p className="m-0 mt-5 font-sans text-body-sm font-bold text-text-primary">Thời gian mong muốn (không bắt buộc)</p>
        <p className={`${HELP} mb-2`}>Cửa hàng sẽ cố gắng đáp ứng, đây không phải cam kết giao đúng giờ.</p>
        <div className="flex flex-col gap-2.5 sm:flex-row">
          <input type="date" aria-label="Ngày mong muốn" value={b.date} min={b.today} aria-invalid={!b.dateValid} onChange={(event) => { b.setDate(event.target.value); b.setSlot(""); }} className={FIELD} />
          {b.date && b.slots.length > 0 && <select aria-label="Khung giờ mong muốn" value={b.slot} onChange={(event) => b.setSlot(event.target.value as typeof b.slot)} className={FIELD}>
            <option value="">Không chọn khung giờ</option>
            {b.slots.map((option) => <option key={option.slot} value={option.slot}>{option.label}</option>)}
          </select>}
        </div>

        <label className={`${LABEL} mt-5`} htmlFor="custom-message">Lời nhắn giao hàng (không bắt buộc)</label>
        <textarea id="custom-message" value={b.customerNote} onChange={(event) => b.setCustomerNote(event.target.value)} maxLength={500} rows={2} placeholder="Lời nhắn trên thiệp, hướng dẫn cho người giao..." className={FIELD} />
      </Step>
    </div>

    <BouquetSummary
      lines={b.picked}
      quantities={b.quantities}
      subtotal={b.subtotal}
      fee={b.fee}
      estimate={b.estimate}
      missing={b.missing}
      error={b.error}
      submitting={b.submitting}
      canSubmit={b.canSubmit}
      onSet={b.onSet}
      onChange={b.onChange}
      onSettle={b.onSettle}
      onRemove={b.onRemove}
    />
    <BouquetBar count={b.chosen.length} estimate={b.estimate} />

    {b.confirming && b.type && b.address && <ConfirmRequestDialog
      typeName={b.type.name}
      lines={b.chosen}
      subtotal={b.subtotal}
      fee={b.type.labourFee}
      estimate={b.estimate}
      address={`${b.address.receiverName} · ${b.address.address}`}
      date={b.date}
      slot={b.slot}
      submitting={b.submitting}
      onClose={b.closeConfirm}
      onSend={() => void b.send()}
    />}

    {b.unavailable && <ModalDialog
      title="Có lựa chọn vừa ngừng"
      onClose={b.closeUnavailable}
      footer={<div className="flex justify-end"><Button type="button" onClick={b.closeUnavailable} className="min-h-11 rounded-lg bg-primary px-5 text-sm font-bold text-white hover:bg-primary-hover">Đã hiểu</Button></div>}
    >
      <p className="m-0 font-sans text-body text-text-secondary">Cửa hàng vừa ngừng các lựa chọn sau, nên chúng đã được bỏ khỏi bó hoa và giá tạm tính đã được cập nhật:</p>
      <ul className="m-0 mt-2 list-disc pl-5 font-sans text-body font-bold text-text-primary">
        {b.unavailable.map((name) => <li key={name}>{name}</li>)}
      </ul>
    </ModalDialog>}
  </form>;
}
