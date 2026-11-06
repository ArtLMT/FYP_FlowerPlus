import Button from "@/components/ui/Button";
import ModalDialog from "@/components/ui/ModalDialog";
import { UNITS, type Material } from "@/features/custom-order/QuantityStepper";
import { deliverySlotLabel, type DeliveryTimeSlot } from "@/lib/services/orders";
import { formatCalendarDate, formatVND } from "@/lib/utils";

const CANCEL_BUTTON = "min-h-11 rounded-lg border border-neutral-border bg-white px-4 text-sm font-semibold text-text-secondary";
const MAIN_BUTTON = "min-h-11 rounded-lg bg-primary px-5 text-sm font-bold text-white hover:bg-primary-hover";

/** The last look before a custom request goes to the shop (screen inventory K5). */
export default function ConfirmRequestDialog({ typeName, lines, subtotal, fee, estimate, address, date, slot, submitting, onClose, onSend }: {
  typeName: string;
  lines: { material: Material; quantity: number }[];
  subtotal: number;
  fee: number;
  estimate: number;
  address: string;
  date: string;
  slot: DeliveryTimeSlot | "";
  submitting: boolean;
  onClose: () => void;
  onSend: () => void;
}) {
  return <ModalDialog
    title="Gửi yêu cầu thiết kế?"
    onClose={() => { if (!submitting) onClose(); }}
    footer={<div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <Button type="button" disabled={submitting} onClick={onClose} className={CANCEL_BUTTON}>Xem lại</Button>
      <Button type="button" disabled={submitting} onClick={onSend} className={MAIN_BUTTON}>{submitting ? "Đang gửi…" : "Xác nhận gửi"}</Button>
    </div>}
  >
    <p className="m-0 font-sans text-[16px] font-bold text-text-primary">{typeName}</p>
    <ul className="m-0 mt-2 list-none p-0 font-sans text-body-sm text-text-secondary">
      {lines.map(({ material, quantity }) => <li key={material.id} className="flex justify-between gap-3 py-1">
        <span className="min-w-0 break-words">{material.name} × {quantity} {UNITS[material.unitOfMeasure]}</span>
        <span className="flex-shrink-0">{formatVND(Math.round(material.sellingPrice * quantity))}</span>
      </li>)}
    </ul>
    <dl className="m-0 mt-3 border-t border-neutral-border pt-3 font-sans text-body-sm text-text-secondary">
      <div className="flex justify-between"><dt>Nguyên liệu</dt><dd className="m-0">{formatVND(subtotal)}</dd></div>
      <div className="mt-1 flex justify-between"><dt>Phí công</dt><dd className="m-0">{formatVND(fee)}</dd></div>
      <div className="mt-2 flex items-baseline justify-between text-text-primary">
        <dt className="font-bold">Tạm tính</dt>
        <dd className="m-0 font-serif text-[22px] font-semibold text-primary-deep">{formatVND(estimate)}</dd>
      </div>
    </dl>
    <div className="mt-3 space-y-1 border-t border-neutral-border pt-3 font-sans text-body-sm text-text-secondary">
      <p className="m-0"><strong className="text-text-primary">Giao đến:</strong> {address}</p>
      <p className="m-0"><strong className="text-text-primary">Thời gian mong muốn:</strong> {date ? `${formatCalendarDate(date)}${slot ? ` · ${deliverySlotLabel(slot)}` : ""}` : "Không chọn"}</p>
      <p className="m-0"><strong className="text-text-primary">Thanh toán:</strong> Tiền mặt khi nhận hàng (COD)</p>
    </div>
    <p className="m-0 mt-3 rounded-lg bg-neutral-surface p-3 font-sans text-body-sm text-text-primary">Cửa hàng sẽ xem yêu cầu và có thể đề xuất thay đổi. Đơn chỉ được xác nhận sau khi cửa hàng duyệt.</p>
  </ModalDialog>;
}
