"use client";

import Button from "@/components/ui/Button";
import BatchAdjustDialog from "@/features/admin/BatchAdjustDialog";
import FieldMessages from "@/features/admin/FieldMessages";
import { useInventoryManager } from "@/features/admin/hooks/use-inventory-manager";
import { formatMaterialPrice, MATERIAL_TYPE_LABELS, MATERIAL_UNIT_LABELS } from "@/features/admin/material-labels";
import type { MaterialBatch } from "@/lib/services/inventory";
import { formatCalendarDate } from "@/lib/utils";

const INPUT = "min-h-11 rounded-lg border border-neutral-border bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-primary";

/** 12.5 → "12,5"; quantities have at most two decimals (METRE). */
const formatQuantity = (quantity: number) => Number(quantity).toLocaleString("vi-VN", { maximumFractionDigits: 2 });

/**
 * Inventory — receive a delivery into a batch, and see the batches with their Available / Reserved
 * / Consumed counters. A batch is never edited: its Available is corrected by an ADJUSTED
 * transaction with a note (BR-INV-21), from the row's Adjust button.
 * Change the receiving form in the first section and the batch table in the second section.
 */
export default function InventoryManager({ receiveRequest, onStockChanged }: {
  receiveRequest?: { materialId: string } | null;
  onStockChanged?: () => void;
} = {}) {
  const m = useInventoryManager({ receiveRequest, onStockChanged });
  const unit = m.selected ? MATERIAL_UNIT_LABELS[m.selected.unitOfMeasure] : "";
  const fractional = m.selected?.unitOfMeasure === "METRE";

  return (
    <div className="space-y-5">
      {/* Receive-stock form: creates one new material batch. */}
      <section className="space-y-4 rounded-xl border border-neutral-border bg-white p-4 shadow-sm sm:p-5" aria-labelledby="receive-heading">
        <div>
          <h2 id="receive-heading" className="font-serif text-xl font-semibold text-text-primary">Nhập lô hàng</h2>
          <p className="mt-1 text-sm text-text-muted">Mỗi lần nhận hàng tạo một lô mới, với giá nhập riêng của lô đó.</p>
        </div>

        {m.feedback && <p role={m.feedback.kind === "error" ? "alert" : "status"} className={`rounded-lg px-4 py-3 text-sm ${m.feedback.kind === "error" ? "bg-red-50 text-red-800" : "bg-accent-sage-light text-text-primary"}`}>{m.feedback.text}</p>}
        {m.materialsError && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{m.materialsError}</p>}

        <form onSubmit={(event) => void m.submit(event)} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="flex flex-col gap-1 text-xs font-semibold text-text-secondary sm:col-span-2 lg:col-span-3">
            Nguyên liệu
            <select required value={m.form.materialId} onChange={(event) => m.selectMaterial(event.target.value)} disabled={m.materialsLoading} className={INPUT}>
              <option value="">{m.materialsLoading ? "Đang tải nguyên liệu…" : "Chọn nguyên liệu đang hoạt động"}</option>
              {m.activeMaterials.map((material) => <option key={material.id} value={material.id}>
                {material.name} · {MATERIAL_TYPE_LABELS[material.type]} · {MATERIAL_UNIT_LABELS[material.unitOfMeasure]}
              </option>)}
            </select>
            <FieldMessages messages={m.fieldErrors.materialId} />
          </label>

          <label className="flex flex-col gap-1 text-xs font-semibold text-text-secondary">
            Số lượng{unit && ` (${unit})`}
            <input required type="number" inputMode="decimal" min={fractional ? "0.01" : "1"} step={fractional ? "0.01" : "1"} value={m.form.quantity} onChange={(event) => m.updateForm({ quantity: event.target.value })} className={INPUT} />
            <span className="font-normal text-text-muted">{fractional ? "Tối đa 2 chữ số thập phân." : "Số nguyên."}</span>
            <FieldMessages messages={m.fieldErrors.quantity} />
          </label>

          <label className="flex flex-col gap-1 text-xs font-semibold text-text-secondary">
            Giá nhập (VND / {unit || "đơn vị"})
            <input required type="number" inputMode="numeric" min="0" step="1" value={m.form.unitCost} onChange={(event) => m.updateForm({ unitCost: event.target.value })} className={INPUT} />
            <FieldMessages messages={m.fieldErrors.unitCost} />
          </label>

          <label className="flex flex-col gap-1 text-xs font-semibold text-text-secondary">
            Ngày nhận
            <input type="date" max={m.today} value={m.form.receivedDate} onChange={(event) => m.updateForm({ receivedDate: event.target.value })} className={INPUT} />
            <span className="font-normal text-text-muted">Để trống: hôm nay.</span>
            <FieldMessages messages={m.fieldErrors.receivedDate} />
          </label>

          {m.needsExpiry && <label className="flex flex-col gap-1 text-xs font-semibold text-text-secondary">
            Hạn sử dụng
            <input required type="date" min={m.today} value={m.form.expiryDate} onChange={(event) => m.updateForm({ expiryDate: event.target.value })} className={INPUT} />
            <FieldMessages messages={m.fieldErrors.expiryDate} />
          </label>}

          <div className="flex items-end sm:col-span-2 lg:col-span-3 lg:justify-end">
            <Button type="submit" disabled={m.saving || !m.selected} className="min-h-11 w-full rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-primary-hover disabled:opacity-60 sm:w-auto">
              {m.saving ? "Đang nhập…" : "Nhập lô hàng"}
            </Button>
          </div>
        </form>
      </section>

      {/* Existing batches: material filter, counters table, and pagination. */}
      <section className="space-y-4" aria-labelledby="batches-heading">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="batches-heading" className="font-serif text-xl font-semibold text-text-primary">Lô hàng</h2>
            {m.page && <p className="mt-1 text-sm text-text-muted">{m.page.totalElements} lô · mới nhận trước</p>}
          </div>
          <label className="flex flex-col gap-1 text-xs font-semibold text-text-secondary sm:w-72">
            Lọc theo nguyên liệu
            <select value={m.filterMaterialId} onChange={(event) => m.setFilterMaterialId(event.target.value)} className={INPUT}>
              <option value="">Tất cả nguyên liệu</option>
              {m.allMaterials.map((material) => <option key={material.id} value={material.id}>{material.name}</option>)}
            </select>
          </label>
        </div>

        {m.listError && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{m.listError}</p>}

        {m.loading ? <p className="py-8 text-center text-sm text-text-muted">Đang tải lô hàng…</p>
          : m.page?.content.length === 0 ? <p className="rounded-xl border border-dashed border-neutral-border py-10 text-center text-sm text-text-muted">Chưa có lô hàng nào.</p>
            : m.page && <div className="overflow-x-auto rounded-xl border border-neutral-border bg-white shadow-sm">
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead className="border-b border-neutral-border bg-neutral-canvas text-xs uppercase tracking-wider text-text-muted">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-semibold">Nguyên liệu</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Ngày nhận</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Hạn sử dụng</th>
                    <th scope="col" className="px-4 py-3 text-right font-semibold">Giá nhập</th>
                    <th scope="col" className="px-4 py-3 text-right font-semibold">Đã nhận</th>
                    <th scope="col" className="px-4 py-3 text-right font-semibold">Còn sẵn</th>
                    <th scope="col" className="px-4 py-3 text-right font-semibold">Đã giữ</th>
                    <th scope="col" className="px-4 py-3 text-right font-semibold">Đã dùng</th>
                    <th scope="col" className="px-4 py-3"><span className="sr-only">Thao tác</span></th>
                  </tr>
                </thead>
                <tbody>{m.page.content.map((batch) => <BatchRow key={batch.id} batch={batch} onAdjust={() => m.openAdjust(batch)} />)}</tbody>
              </table>
            </div>}

        {m.page && m.page.totalPages > 1 && <div className="flex items-center justify-between border-t border-neutral-border pt-5">
          <Button type="button" disabled={!m.hasPrevious} onClick={m.previous} className="rounded-lg border border-neutral-border bg-white px-4 py-2 text-sm font-semibold text-text-secondary">Trước</Button>
          <span className="text-sm text-text-muted">trang {m.page.page + 1}/{m.page.totalPages}</span>
          <Button type="button" disabled={!m.hasNext} onClick={m.next} className="rounded-lg border border-neutral-border bg-white px-4 py-2 text-sm font-semibold text-text-secondary">Tiếp</Button>
        </div>}
      </section>

      {m.adjusting && <BatchAdjustDialog batch={m.adjusting} onClose={m.closeAdjust} onAdjusted={m.adjusted} onMissing={m.reloadBatches} />}
    </div>
  );
}

/** One row in the existing-batches table. */
function BatchRow({ batch, onAdjust }: { batch: MaterialBatch; onAdjust: () => void }) {
  const unit = MATERIAL_UNIT_LABELS[batch.unitOfMeasure];
  const quantity = (value: number) => <td className="px-4 py-3 text-right tabular-nums text-text-secondary">{formatQuantity(value)} <span className="text-xs text-text-muted">{unit}</span></td>;

  return (
    <tr className={`border-b border-neutral-border last:border-b-0 ${batch.expired ? "bg-neutral-canvas" : ""}`}>
      <td className="px-4 py-3">
        <p className="font-semibold text-text-primary">{batch.materialName}</p>
        <p className="text-xs text-text-muted">{MATERIAL_TYPE_LABELS[batch.materialType]}</p>
      </td>
      <td className="px-4 py-3 text-text-secondary">{formatCalendarDate(batch.receivedDate)}</td>
      <td className="px-4 py-3 text-text-secondary">
        {batch.expiryDate ? formatCalendarDate(batch.expiryDate) : <span className="text-text-muted">Không có</span>}
        {batch.expired && <span className="ml-2 rounded-full bg-red-50 px-2 py-0.5 text-xs font-bold text-red-800">Hết hạn</span>}
      </td>
      <td className="px-4 py-3 text-right tabular-nums text-text-secondary">{formatMaterialPrice(batch.unitCost)}</td>
      {quantity(batch.receivedQuantity)}
      <td className="px-4 py-3 text-right font-semibold tabular-nums text-text-primary">{formatQuantity(batch.availableQuantity)} <span className="text-xs font-normal text-text-muted">{unit}</span></td>
      {quantity(batch.reservedQuantity)}
      {quantity(batch.consumedQuantity)}
      <td className="px-4 py-3 text-right">
        <Button type="button" onClick={onAdjust} aria-label={`Điều chỉnh lô ${batch.materialName}`} className="whitespace-nowrap rounded-lg border border-neutral-border bg-white px-3 py-1.5 text-xs font-semibold text-text-secondary hover:border-primary hover:text-primary-deep">Điều chỉnh</Button>
      </td>
    </tr>
  );
}
