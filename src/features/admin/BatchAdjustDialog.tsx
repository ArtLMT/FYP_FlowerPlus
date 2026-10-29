"use client";

import { useState, type FormEvent } from "react";
import Button from "@/components/ui/Button";
import ModalDialog from "@/components/ui/ModalDialog";
import FieldMessages from "@/features/admin/FieldMessages";
import { MATERIAL_TYPE_LABELS, MATERIAL_UNIT_LABELS } from "@/features/admin/material-labels";
import { asApiError, type FieldErrors } from "@/lib/api";
import { useResource } from "@/lib/hooks/use-resource";
import { adjustBatch, listBatches, type MaterialBatch } from "@/lib/services/inventory";
import { listMaterials } from "@/lib/services/materials";
import { formatCalendarDate } from "@/lib/utils";

const INPUT = "min-h-11 rounded-lg border border-neutral-border bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-primary";

type Direction = "OUT" | "IN";

/** The backend's page maximum; the material catalog and one material's batches fit in it. */
const PICKER_PAGE_SIZE = 100;

const formatQuantity = (quantity: number) => Number(quantity).toLocaleString("vi-VN", { maximumFractionDigits: 2 });

interface BatchAdjustDialogProps {
  /** The batch to adjust. Omitted (from the ledger): staff pick the material, then the batch. */
  batch?: MaterialBatch;
  onClose: () => void;
  /** Called with the updated batch after the ADJUSTED row is recorded. */
  onAdjusted: (batch: MaterialBatch) => void;
  /** The batch no longer exists; the list should be re-read. */
  onMissing: () => void;
}

/**
 * Adjust one batch's Available quantity with a required note (BR-INV-08). Taking out is the usual
 * case (damage, miscount); putting back covers a miscount the other way or an intact return.
 * Reserved and Consumed are never touched, and Available cannot go below 0 — the backend decides.
 * Opened from a batch row it adjusts that batch; opened from the ledger staff choose it (BR-INV-21).
 */
export default function BatchAdjustDialog({ batch: givenBatch, onClose, onAdjusted, onMissing }: BatchAdjustDialogProps) {
  // Pickers, used only when no batch was given. Every material is listed: a Deactivated one may
  // still hold stock that has to be taken out.
  const [materialId, setMaterialId] = useState("");
  const [batchId, setBatchId] = useState("");
  const materials = useResource(
    () => listMaterials({ page: 0, size: PICKER_PAGE_SIZE, sort: "NAME_ASC" }),
    givenBatch ? null : "adjust-materials",
  );
  const batches = useResource(
    () => listBatches({ page: 0, size: PICKER_PAGE_SIZE, materialId }),
    givenBatch || !materialId ? null : `adjust-batches|${materialId}`,
  );
  // An answer for a previously chosen material may still be showing while the new one loads.
  const materialBatches = (batches.data?.content ?? []).filter((candidate) => candidate.materialId === materialId);
  const batch = givenBatch ?? materialBatches.find((candidate) => candidate.id === batchId) ?? null;

  const [direction, setDirection] = useState<Direction>("OUT");
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const unit = batch ? MATERIAL_UNIT_LABELS[batch.unitOfMeasure] : "";
  const fractional = batch?.unitOfMeasure === "METRE";
  const amount = Number(quantity);
  const signed = direction === "OUT" ? -amount : amount;
  const preview = batch && quantity && amount > 0 ? Number(batch.availableQuantity) + signed : null;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!batch) return;
    setSaving(true);
    setFieldErrors({});
    setError("");
    try {
      onAdjusted(await adjustBatch(batch.id, { quantity: signed, note: note.trim() }));
    } catch (cause) {
      const apiError = asApiError(cause);
      if (apiError.is("BATCH_NOT_FOUND")) {
        onMissing();
        if (!givenBatch) {
          setBatchId("");
          batches.reload();
        }
      }
      setError(apiError.message);
      setFieldErrors(apiError.fieldErrors);
    } finally {
      setSaving(false);
    }
  }

  const footer = <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
    <Button type="button" onClick={onClose} className="min-h-11 rounded-lg border border-neutral-border bg-white px-5 py-2.5 text-sm font-semibold text-text-secondary hover:border-primary hover:text-primary-deep">Hủy</Button>
    <Button type="submit" form="adjust-batch-form" disabled={saving || !batch} className="min-h-11 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-primary-hover disabled:opacity-60">
      {saving ? "Đang lưu…" : "Lưu điều chỉnh"}
    </Button>
  </div>;

  return <ModalDialog title="Điều chỉnh tồn kho" onClose={onClose} footer={footer}>
    <form id="adjust-batch-form" onSubmit={(event) => void submit(event)} className="space-y-4">
      {/* Material and batch pickers, when opened from the ledger. */}
      {!givenBatch && <div className="grid gap-4">
        {materials.error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{materials.error.message}</p>}
        <label className="flex flex-col gap-1 text-xs font-semibold text-text-secondary">
          Nguyên liệu
          <select required value={materialId} disabled={materials.loading && !materials.data} onChange={(event) => { setMaterialId(event.target.value); setBatchId(""); }} className={INPUT}>
            <option value="">{materials.loading && !materials.data ? "Đang tải nguyên liệu…" : "Chọn nguyên liệu"}</option>
            {(materials.data?.content ?? []).map((material) => <option key={material.id} value={material.id}>
              {material.name} · {MATERIAL_TYPE_LABELS[material.type]}{material.status !== "ACTIVE" ? " · ngừng sử dụng" : ""}
            </option>)}
          </select>
        </label>
        {materialId && <label className="flex flex-col gap-1 text-xs font-semibold text-text-secondary">
          Lô hàng
          {batches.error && <span role="alert" className="font-normal text-red-800">{batches.error.message}</span>}
          <select required value={batchId} disabled={batches.loading} onChange={(event) => setBatchId(event.target.value)} className={INPUT}>
            <option value="">{batches.loading ? "Đang tải lô hàng…" : materialBatches.length === 0 ? "Nguyên liệu này chưa có lô nào" : "Chọn lô hàng"}</option>
            {materialBatches.map((candidate) => <option key={candidate.id} value={candidate.id}>
              {batchOptionLabel(candidate)}
            </option>)}
          </select>
        </label>}
      </div>}

      {/* The batch being adjusted. */}
      {batch && <div className="rounded-xl bg-white p-4 text-sm">
        <p className="font-semibold text-text-primary">{batch.materialName}</p>
        <p className="mt-1 text-text-muted">
          Nhận {formatCalendarDate(batch.receivedDate)}
          {batch.expiryDate && ` · HSD ${formatCalendarDate(batch.expiryDate)}`}
        </p>
        <p className="mt-2 text-text-secondary">Còn sẵn: <strong className="tabular-nums text-text-primary">{formatQuantity(batch.availableQuantity)} {unit}</strong>
          {Number(batch.reservedQuantity) > 0 && <span className="text-text-muted"> · Đã giữ {formatQuantity(batch.reservedQuantity)} {unit} (không điều chỉnh được)</span>}
        </p>
      </div>}

      {error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}

      <fieldset className="flex flex-col gap-2 text-xs font-semibold text-text-secondary">
        <legend className="mb-1">Loại điều chỉnh</legend>
        <div className="grid grid-cols-2 gap-2">
          {([["OUT", "Giảm (hư hỏng, đếm thiếu)"], ["IN", "Tăng (đếm thừa, hàng trả về)"]] as const).map(([value, label]) =>
            <label key={value} className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm font-normal ${direction === value ? "border-primary bg-tertiary text-primary-deep" : "border-neutral-border bg-white text-text-secondary"}`}>
              <input type="radio" name="direction" value={value} checked={direction === value} onChange={() => setDirection(value)} className="accent-primary" />
              {label}
            </label>)}
        </div>
      </fieldset>

      <label className="flex flex-col gap-1 text-xs font-semibold text-text-secondary">
        Số lượng{unit && ` (${unit})`}
        <input required autoFocus={Boolean(givenBatch)} disabled={!batch} type="number" inputMode="decimal" min={fractional ? "0.01" : "1"} step={fractional ? "0.01" : "1"}
          max={batch && direction === "OUT" ? Number(batch.availableQuantity) : undefined}
          value={quantity} onChange={(event) => setQuantity(event.target.value)} className={INPUT} />
        {preview !== null && <span className="font-normal text-text-muted">Còn sẵn sau điều chỉnh: <strong className="tabular-nums">{formatQuantity(preview)} {unit}</strong></span>}
        <FieldMessages messages={fieldErrors.quantity} />
      </label>

      <label className="flex flex-col gap-1 text-xs font-semibold text-text-secondary">
        Ghi chú
        <textarea required rows={4} maxLength={1000} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Lý do điều chỉnh: hoa dập, đếm sai, hàng giao thất bại trả về…" className="resize-y rounded-lg border border-neutral-border bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-primary" />
        <span className="font-normal text-text-muted">Bắt buộc. Được lưu vĩnh viễn trong lịch sử giao dịch.</span>
        <FieldMessages messages={fieldErrors.note} />
      </label>
    </form>
  </ModalDialog>;
}

/** "Nhận 12/10/2026 · HSD 20/10/2026 · còn 40 cành" — enough to tell one material's batches apart. */
function batchOptionLabel(batch: MaterialBatch) {
  const parts = [`Nhận ${formatCalendarDate(batch.receivedDate)}`];
  if (batch.expiryDate) parts.push(`HSD ${formatCalendarDate(batch.expiryDate)}`);
  parts.push(`còn ${formatQuantity(batch.availableQuantity)} ${MATERIAL_UNIT_LABELS[batch.unitOfMeasure]}`);
  if (batch.expired) parts.push("hết hạn");
  return parts.join(" · ");
}
