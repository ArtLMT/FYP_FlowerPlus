import Button from "@/components/ui/Button";
import QuantityStepper, { UNITS, type Material } from "@/features/custom-order/QuantityStepper";
import { formatVND } from "@/lib/utils";

/**
 * "Bó hoa của bạn": what is picked, the live estimate and the submit button. Sticky beside the form on
 * large screens and the last block of the page on small ones, where `BouquetBar` links down to it.
 */
export default function BouquetSummary({ lines, quantities, subtotal, fee, estimate, missing, error, submitting, canSubmit, onSet, onChange, onSettle, onRemove }: {
  lines: { material: Material; quantity: number }[];
  quantities: Record<string, string>;
  subtotal: number;
  /** Null until an arrangement type is chosen, so the estimate does not read as free labour. */
  fee: number | null;
  estimate: number;
  missing: string[];
  error: string | null;
  submitting: boolean;
  canSubmit: boolean;
  onSet: (material: Material, value: string) => void;
  onChange: (material: Material, change: number) => void;
  onSettle: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  return <section id="bo-hoa" aria-label="Bó hoa của bạn" className="scroll-mt-[136px] rounded-2xl border border-neutral-border bg-white p-4 shadow-sm sm:p-5 lg:sticky lg:top-[98px] lg:max-h-[calc(100dvh-114px)] lg:overflow-y-auto">
    <h2 className="m-0 font-serif text-[22px] font-medium text-text-primary">Bó hoa của bạn</h2>

    {lines.length === 0
      ? <p className="m-0 mt-3 rounded-xl bg-neutral-surface p-4 font-sans text-body-sm text-text-secondary">Chưa chọn gì. Hoa và trang trí bạn chọn sẽ hiện ở đây.</p>
      : <ul className="m-0 mt-3 list-none divide-y divide-neutral-border p-0 lg:max-h-[34dvh] lg:overflow-y-auto lg:pr-1">
        {lines.map(({ material, quantity }) => <li key={material.id} className="py-3">
          <div className="flex items-start justify-between gap-2">
            <p className="m-0 min-w-0 break-words font-sans text-body-sm font-bold text-text-primary">{material.name}</p>
            <Button type="button" aria-label={`Bỏ ${material.name}`} onClick={() => onRemove(material.id)} className="-mr-1 -mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-text-secondary hover:bg-neutral-surface">
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">close</span>
            </Button>
          </div>
          <div className="mt-2 flex items-center justify-between gap-3">
            <div className="w-32 flex-shrink-0">
              <QuantityStepper material={material} value={quantities[material.id]} onSet={onSet} onChange={onChange} onSettle={onSettle} />
            </div>
            <p className="m-0 text-right font-sans text-body-sm font-bold text-text-primary">
              {formatVND(Math.round(material.sellingPrice * quantity))}
              <span className="block font-normal text-text-secondary">{quantity} {UNITS[material.unitOfMeasure]}</span>
            </p>
          </div>
        </li>)}
      </ul>}

    <dl className="m-0 mt-3 border-t border-neutral-border pt-3 font-sans text-body text-text-secondary">
      <div className="flex justify-between"><dt>Nguyên liệu</dt><dd className="m-0">{formatVND(subtotal)}</dd></div>
      <div className="mt-1 flex justify-between"><dt>Phí công</dt><dd className="m-0">{fee === null ? "—" : formatVND(fee)}</dd></div>
      <div className="mt-2 flex items-baseline justify-between text-text-primary">
        <dt className="font-serif text-[20px] font-semibold">Tạm tính</dt>
        <dd className="m-0 font-serif text-[24px] font-semibold text-primary-deep">{formatVND(estimate)}</dd>
      </div>
    </dl>

    <p className="m-0 mt-2 font-sans text-body-sm text-text-secondary">Thanh toán khi nhận hàng (COD). Cửa hàng xem yêu cầu của bạn và có thể đề xuất thay đổi trước khi duyệt.</p>

    {missing.length > 0 && <div className="mt-3 rounded-xl bg-neutral-surface p-3 font-sans text-body-sm text-text-primary">
      <p className="m-0 font-bold">Còn thiếu:</p>
      <ul className="m-0 mt-1 list-disc pl-5">{missing.map((item) => <li key={item}>{item}</li>)}</ul>
    </div>}
    {error && <p role="alert" className="m-0 mt-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}

    <Button type="submit" disabled={!canSubmit} className="mt-4 block w-full rounded-full bg-primary-deep py-4 text-center font-sans text-body-sm font-bold tracking-[0.1em] text-white hover:brightness-110">
      {submitting ? "ĐANG GỬI..." : "GỬI YÊU CẦU"}
    </Button>
  </section>;
}

/**
 * Small screens only: keeps the count and estimate in view above the bottom navigation. The right
 * padding keeps the button clear of the floating chat button.
 */
export function BouquetBar({ count, estimate }: { count: number; estimate: number }) {
  return <div className="fixed inset-x-0 bottom-[77px] z-40 border-t border-neutral-border bg-white py-2.5 pl-4 pr-[84px] shadow-[0_-4px_12px_rgba(46,26,22,0.08)] md:bottom-0 lg:hidden">
    <div className="flex items-center justify-between gap-3">
      <p className="m-0 min-w-0 font-sans text-body-sm text-text-secondary">
        {count} loại · <span className="font-serif text-[20px] font-semibold text-primary-deep">{formatVND(estimate)}</span>
      </p>
      <a href="#bo-hoa" className="flex-shrink-0 rounded-full bg-primary-deep px-5 py-2.5 font-sans text-body-sm font-bold text-white">Xem lại</a>
    </div>
  </div>;
}
