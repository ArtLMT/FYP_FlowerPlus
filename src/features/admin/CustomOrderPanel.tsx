"use client";

import { useState, type FormEvent } from "react";
import Button from "@/components/ui/Button";
import ModalDialog from "@/components/ui/ModalDialog";
import { formatAmount } from "@/features/admin/StockAlert";
import MaterialPicker from "@/features/custom-order/MaterialPicker";
import QuantityStepper, { UNITS } from "@/features/custom-order/QuantityStepper";
import { keepFormOpen, MAX_LINES, useMaterialQuantities } from "@/features/custom-order/hooks/use-material-quantities";
import { changesFrom } from "@/features/custom-order/terms-diff";
import { useResource } from "@/lib/hooks/use-resource";
import { getCustomOrderMaterials, getCustomOrderOptions, MAX_MATERIAL_PAGE, type ProposalInput } from "@/lib/services/custom-orders";
import type { CustomOrderTerms, ManagementOrder, TermsState } from "@/lib/services/orders";
import { formatShopDateTime } from "@/lib/utils";

const money = (value: number) => `${Number(value).toLocaleString("vi-VN")} ₫`;

const FIELD = "min-h-11 rounded-lg border border-neutral-border bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-primary";

const STATE_LABELS: Record<TermsState, string> = {
  REQUESTED: "Khách yêu cầu",
  PENDING: "Đang chờ khách trả lời",
  ACCEPTED: "Khách đã chấp nhận",
  DECLINED: "Khách đã từ chối",
  REPLACED: "Đã thay bằng đề xuất mới",
};

/**
 * The custom part of the admin order page (screen inventory B3, B4): the agreed terms, Approve, the
 * "propose changes" form prefilled from the agreed terms, and every version so far. Cancel is the
 * page's existing action. Approving confirms a COD order, so it asks first.
 */
export default function CustomOrderPanel({ order, saving, onPropose, onApprove }: {
  order: ManagementOrder;
  saving: boolean;
  onPropose: (basedOnTermsNo: number, input: ProposalInput) => Promise<boolean>;
  onApprove: (termsNo: number) => Promise<boolean>;
}) {
  const [proposing, setProposing] = useState(false);
  const [approving, setApproving] = useState(false);
  const custom = order.custom;
  if (!custom) return null;

  const allTerms = custom.allTerms ?? [];
  const latestNo = allTerms.at(-1)?.termsNo ?? custom.agreed?.termsNo ?? 1;
  const agreed = custom.agreed;
  const canPropose = order.status === "REQUESTED" || order.status === "CHANGES_PROPOSED";
  const canApprove = order.status === "REQUESTED" && agreed !== null;

  return <section aria-labelledby="custom-panel-heading" className="min-w-0 space-y-4 rounded-xl border border-neutral-border bg-white p-4 shadow-sm sm:p-5">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h3 id="custom-panel-heading" className="font-serif text-lg font-semibold text-text-primary">Đơn thiết kế riêng</h3>
        {custom.pending
          ? <p className="mt-1 text-sm text-amber-800">Đề xuất số {custom.pending.termsNo} đang chờ khách trả lời. Có thể gửi đề xuất mới để thay thế.</p>
          : order.status === "REQUESTED" && <p className="mt-1 text-sm font-semibold text-primary-deep">Cần cửa hàng xử lý: duyệt hoặc đề xuất thay đổi.</p>}
      </div>
      <div className="flex flex-col-reverse gap-2 sm:flex-row">
        {canPropose && <Button type="button" disabled={saving} onClick={() => setProposing((open) => !open)} className="min-h-11 rounded-lg border border-neutral-border bg-white px-4 text-sm font-semibold text-text-secondary hover:border-primary disabled:opacity-50">{proposing ? "Đóng biểu mẫu" : "Đề xuất thay đổi"}</Button>}
        {canApprove && <Button type="button" disabled={saving} onClick={() => setApproving(true)} className="min-h-11 rounded-lg bg-primary px-5 text-sm font-bold text-white hover:bg-primary-hover disabled:opacity-50">Duyệt đơn</Button>}
      </div>
    </div>

    {agreed && <TermsBlock terms={agreed} title={`Nội dung đã thống nhất (số ${agreed.termsNo})`} />}

    {proposing && canPropose && <ProposalForm
      key={latestNo}
      agreed={agreed}
      replacesNo={custom.pending?.termsNo ?? null}
      saving={saving}
      onSubmit={async (input) => {
        const sent = await onPropose(latestNo, input);
        if (sent) setProposing(false);
        return sent;
      }}
    />}

    {allTerms.length > 1 && <details className="rounded-lg border border-neutral-border">
      <summary className="cursor-pointer px-3 py-2.5 text-sm font-semibold text-text-secondary">Lịch sử các phiên bản ({allTerms.length})</summary>
      <div className="space-y-3 border-t border-neutral-border p-3">
        {[...allTerms].reverse().map((terms) => <TermsBlock key={terms.termsNo} terms={terms} title={`Số ${terms.termsNo} · ${STATE_LABELS[terms.state]}`} />)}
      </div>
    </details>}

    {approving && agreed && <ModalDialog
      title="Duyệt đơn thiết kế riêng"
      onClose={() => { if (!saving) setApproving(false); }}
      footer={<div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" disabled={saving} onClick={() => setApproving(false)} className="min-h-11 rounded-lg border border-neutral-border px-4 text-sm font-semibold text-text-secondary">Quay lại</Button>
        <Button type="button" disabled={saving} onClick={() => void onApprove(agreed.termsNo).then(() => setApproving(false))} className="min-h-11 rounded-lg bg-primary px-5 text-sm font-bold text-white disabled:opacity-50">{saving ? "Đang duyệt…" : "Xác nhận duyệt"}</Button>
      </div>}
    >
      <p className="text-sm text-text-secondary">Đơn thanh toán khi nhận hàng: duyệt cũng là xác nhận đơn. Nguyên liệu chỉ bị trừ khi bắt đầu chuẩn bị.</p>
      <div className="mt-3"><TermsBlock terms={agreed} title={`Giá ${money(agreed.price)}`} /></div>
    </ModalDialog>}
  </section>;
}

function TermsBlock({ terms, title }: { terms: CustomOrderTerms; title: string }) {
  return <div className="rounded-lg bg-neutral-canvas/60 p-3">
    <p className="text-sm font-semibold text-text-primary">{title}</p>
    <p className="mt-1 text-xs text-text-muted">{terms.arrangementTypeName} · phí công {money(terms.labourFee)} · nguyên liệu {money(terms.materialsSubtotal)} · <strong>tổng {money(terms.price)}</strong> · {formatShopDateTime(terms.createdAt)}</p>
    <ul className="mt-2 space-y-1">
      {terms.materials.map((material) => <li key={material.materialId} className="flex items-baseline justify-between gap-3 text-sm">
        <span className="min-w-0 break-words text-text-primary">{material.materialName}</span>
        <span className="whitespace-nowrap tabular-nums text-text-secondary">{formatAmount(material.quantity, material.unitOfMeasure)} × {money(material.unitPrice)}</span>
      </li>)}
    </ul>
    {terms.note && <p className="mt-2 whitespace-pre-wrap break-words text-sm text-text-secondary">Ghi chú: {terms.note}</p>}
    {terms.responseNote && <p className="mt-1 whitespace-pre-wrap break-words text-sm text-red-800">Lý do từ chối: {terms.responseNote}</p>}
  </div>;
}

/**
 * Staff's new version of the terms (screen inventory B4), prefilled from the agreed terms. Anything
 * the shop has stopped offering must be replaced first, because the server refuses it. The screen
 * suggests materials + fee; the price sent is what staff set. Sending shows what changes and asks first.
 */
function ProposalForm({ agreed, replacesNo, saving, onSubmit }: {
  agreed: CustomOrderTerms | null;
  /** The waiting proposal this one replaces, if any. */
  replacesNo: number | null;
  saving: boolean;
  onSubmit: (input: ProposalInput) => Promise<boolean>;
}) {
  const options = useResource(getCustomOrderOptions, "custom-options");
  const lines = useMaterialQuantities(
    Object.fromEntries((agreed?.materials ?? []).map((material) => [material.materialId, String(Number(material.quantity))])),
  );
  const { quantities, picks } = lines;
  // Picked lines may be on no loaded page of the pickers, so their current price and status are looked
  // up by id: first the agreed lines, and after a refused send every line. One missing from the answer
  // has stopped (T-ORD-15).
  const [checkedIds, setCheckedIds] = useState(() => Object.keys(quantities));
  const current = useResource(
    async () => (await getCustomOrderMaterials({ ids: checkedIds, size: MAX_MATERIAL_PAGE })).content,
    checkedIds.length > 0 ? `custom-picked:${checkedIds.join(",")}` : null,
  );
  const [pickedTypeId, setTypeId] = useState<string | null>(null);
  const [price, setPrice] = useState("");
  const [note, setNote] = useState("");
  const [previewing, setPreviewing] = useState(false);
  const [materialsRefresh, setMaterialsRefresh] = useState(0);

  const data = options.data;
  const lookup = checkedIds.length > 0 ? current.data ?? [] : [];
  const settled = checkedIds.length === 0 || !current.loading;
  const loadError = options.error ?? (checkedIds.length > 0 ? current.error : null);
  if (loadError) return <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{loadError.message}</p>;
  if (!data || (checkedIds.length > 0 && !current.data)) return <p className="text-sm text-text-muted">Đang tải lựa chọn…</p>;

  // A type or material the shop has stopped offering cannot be sent, so it is not treated as chosen.
  const type = data.arrangementTypes.find((candidate) => candidate.id === (pickedTypeId ?? agreed?.arrangementTypeId)) ?? null;
  const typeGone = pickedTypeId === null && type === null ? agreed?.arrangementTypeName ?? null : null;
  // A checked line takes the looked-up row; any other pick stands as it was chosen until checked, and
  // the server checks every line again on send.
  const known = (id: string) => lookup.find((material) => material.id === id)
    ?? (settled && checkedIds.includes(id) ? undefined : picks[id]);
  const nameOf = (id: string) =>
    picks[id]?.name ?? agreed?.materials.find((material) => material.materialId === id)?.materialName ?? id;
  const goneMaterials = Object.keys(quantities)
    .filter((id) => known(id) === undefined)
    .map((id) => ({ materialId: id, materialName: nameOf(id) }));
  const picked = Object.keys(quantities).flatMap((id) => {
    const material = known(id);
    return material ? [{ material, quantity: Number(quantities[id]) || 0 }] : [];
  });
  const chosen = picked.filter((line) => line.quantity > 0);
  const subtotal = Math.round(chosen.reduce((sum, line) => sum + line.material.sellingPrice * line.quantity, 0));
  const fee = type?.labourFee ?? 0;
  const suggested = subtotal + fee;
  const finalPrice = Number(price || suggested);

  const missing = [
    ...(type ? [] : ["Chọn kiểu cắm"]),
    ...(goneMaterials.length > 0 ? ["Bỏ nguyên liệu đã ngừng"] : []),
    ...(chosen.some((line) => line.material.type === "FLOWER") ? [] : ["Chọn ít nhất một loại hoa"]),
    ...(chosen.length > MAX_LINES ? [`Chọn tối đa ${MAX_LINES} loại nguyên liệu`] : []),
    ...(finalPrice > 0 ? [] : ["Nhập giá lớn hơn 0"]),
  ];

  const changes = type ? changesFrom(agreed, {
    arrangementTypeId: type.id,
    arrangementTypeName: type.name,
    price: finalPrice,
    materials: chosen.map(({ material, quantity }) => ({
      materialId: material.id,
      materialName: material.name,
      unitOfMeasure: material.unitOfMeasure,
      quantity,
    })),
  }) : [];

  function askToSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (missing.length === 0) setPreviewing(true);
  }

  async function send() {
    if (!type) return;
    const sent = await onSubmit({
      arrangementTypeId: type.id,
      items: chosen.map((line) => ({ materialId: line.material.id, quantity: line.quantity })),
      price: finalPrice,
      note: note.trim() || undefined,
    });
    if (!sent) {
      setPreviewing(false);
      options.reload();
      setCheckedIds(Object.keys(quantities));
      current.reload();
      setMaterialsRefresh((count) => count + 1);
    }
  }

  const pickerPicks = { ...Object.fromEntries(lookup.map((material) => [material.id, material])), ...picks };
  const pickerProps = { quantities, picks: pickerPicks, refresh: materialsRefresh, onSet: lines.onSet, onChange: lines.onChange, onSettle: lines.onSettle };

  return <form onSubmit={askToSend} onKeyDown={keepFormOpen} className="space-y-4 rounded-lg border border-neutral-border p-3">
    <label className="flex flex-col gap-1 text-xs font-semibold text-text-secondary">Kiểu cắm
      <select required value={type?.id ?? ""} onChange={(event) => setTypeId(event.target.value)} className={FIELD}>
        <option value="" disabled>Chọn kiểu cắm</option>
        {data.arrangementTypes.map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.name} · phí công {money(candidate.labourFee)}</option>)}
      </select>
      {typeGone && <span role="alert" className="font-normal text-red-800">Kiểu cắm {typeGone} đã ngừng. Hãy chọn kiểu khác.</span>}
    </label>

    <div className="space-y-2">
      <p className="text-xs font-semibold text-text-secondary">Nguyên liệu đã chọn ({picked.length + goneMaterials.length})</p>
      {goneMaterials.map((material) => <div key={material.materialId} className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
        <span className="min-w-0 break-words"><strong>{material.materialName}</strong> đã ngừng, cần bỏ hoặc thay thế.</span>
        <Button type="button" onClick={() => lines.onRemove(material.materialId)} className="min-h-11 shrink-0 rounded-lg px-3 font-semibold underline">Bỏ</Button>
      </div>)}
      {picked.map(({ material, quantity }) => <div key={material.id} className="flex flex-wrap items-center gap-2 border-b border-neutral-border pb-2 last:border-b-0">
        <div className="min-w-0 flex-1">
          <p className="break-words text-sm font-semibold text-text-primary">{material.name}</p>
          <p className="text-xs text-text-secondary">{money(material.sellingPrice)} / {UNITS[material.unitOfMeasure]} · {money(Math.round(material.sellingPrice * quantity))}</p>
        </div>
        <div className="w-32 shrink-0"><QuantityStepper material={material} value={quantities[material.id]} onSet={lines.onSet} onChange={lines.onChange} onSettle={lines.onSettle} /></div>
        <Button type="button" aria-label={`Bỏ ${material.name}`} onClick={() => lines.onRemove(material.id)} className="min-h-11 rounded-lg px-3 text-sm font-semibold text-text-secondary hover:bg-neutral-surface">Bỏ</Button>
      </div>)}
    </div>

    <details className="rounded-lg border border-neutral-border">
      <summary className="cursor-pointer px-3 py-2.5 text-sm font-semibold text-primary-deep">Thêm hoặc đổi nguyên liệu</summary>
      <div className="space-y-5 border-t border-neutral-border p-3">
        <div>
          <p className="mb-2 text-sm font-semibold text-text-primary">Hoa</p>
          <MaterialPicker label="loại hoa" type="FLOWER" emptyMessage="Chưa có loại hoa nào đang bán." {...pickerProps} />
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold text-text-primary">Trang trí</p>
          <MaterialPicker label="đồ trang trí" type="DECORATION" emptyMessage="Chưa có đồ trang trí nào đang bán." {...pickerProps} />
        </div>
      </div>
    </details>

    <label className="flex flex-col gap-1 text-xs font-semibold text-text-secondary">Giá đề xuất (VND)
      <input type="number" min={1} step={1} value={price} placeholder={String(suggested)} onChange={(event) => setPrice(event.target.value)} className={FIELD} />
      <span className="font-normal text-text-secondary">Gợi ý: nguyên liệu {money(subtotal)} + phí công {money(fee)} = {money(suggested)}. Để trống sẽ dùng giá gợi ý.</span>
    </label>

    <label className="flex flex-col gap-1 text-xs font-semibold text-text-secondary">Lời nhắn cho khách
      <textarea rows={3} maxLength={1000} value={note} onChange={(event) => setNote(event.target.value)} className={`${FIELD} resize-y`} />
    </label>

    {missing.length > 0 && <div className="rounded-lg bg-neutral-surface p-3 text-sm text-text-primary">
      <p className="font-semibold">Còn thiếu:</p>
      <ul className="mt-1 list-disc pl-5">{missing.map((item) => <li key={item}>{item}</li>)}</ul>
    </div>}

    <div className="flex justify-end">
      <Button type="submit" disabled={saving || missing.length > 0} className="min-h-11 rounded-lg bg-primary px-5 text-sm font-bold text-white hover:bg-primary-hover disabled:opacity-50">Xem trước và gửi</Button>
    </div>

    {previewing && <ModalDialog
      title="Gửi đề xuất cho khách?"
      onClose={() => { if (!saving) setPreviewing(false); }}
      footer={<div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" disabled={saving} onClick={() => setPreviewing(false)} className="min-h-11 rounded-lg border border-neutral-border bg-white px-4 text-sm font-semibold text-text-secondary">Quay lại</Button>
        <Button type="button" disabled={saving} onClick={() => void send()} className="min-h-11 rounded-lg bg-primary px-5 text-sm font-bold text-white hover:bg-primary-hover">{saving ? "Đang gửi…" : "Xác nhận gửi"}</Button>
      </div>}
    >
      <p className="text-sm font-semibold text-text-primary">So với nội dung đã thống nhất:</p>
      {changes.length > 0
        ? <ul className="mt-1 list-none divide-y divide-neutral-border rounded-lg border border-neutral-border p-0 text-sm text-text-primary">{changes.map((change) => <li key={change} className="break-words px-3 py-2">{change}</li>)}</ul>
        : <p className="mt-1 text-sm text-text-secondary">Không có thay đổi về kiểu cắm, nguyên liệu hay giá.</p>}
      <p className="mt-3 text-sm font-semibold text-text-primary">Giá đề xuất {money(finalPrice)}</p>
      <p className="mt-3 rounded-lg bg-neutral-surface p-3 text-sm text-text-primary">
        Khách hàng sẽ nhận email về đề xuất này.
        {replacesNo !== null && ` Đề xuất số ${replacesNo} đang chờ sẽ bị thay thế.`}
      </p>
    </ModalDialog>}
  </form>;
}
