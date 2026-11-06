"use client";

import { useState, type FormEvent } from "react";
import Button from "@/components/ui/Button";
import ModalDialog from "@/components/ui/ModalDialog";
import { useToast } from "@/components/ui/ToastProvider";
import { UNITS } from "@/features/custom-order/QuantityStepper";
import { changesFrom } from "@/features/custom-order/terms-diff";
import { useAsyncAction } from "@/lib/hooks/use-async-action";
import { acceptProposal, declineProposal } from "@/lib/services/custom-orders";
import type { CustomOrderTerms, CustomerOrder } from "@/lib/services/orders";
import { formatVND } from "@/lib/utils";

function Materials({ terms }: { terms: CustomOrderTerms }) {
  return <ul className="m-0 list-none divide-y divide-neutral-border border-y border-neutral-border p-0">
    {terms.materials.map((material) => <li key={material.materialId} className="flex justify-between gap-3 py-2 font-sans text-[16px] text-text-secondary">
      <span className="min-w-0 break-words">{material.materialName}</span>
      <span className="flex-shrink-0">{material.quantity} {UNITS[material.unitOfMeasure] ?? ""}</span>
    </li>)}
  </ul>;
}

/**
 * The custom part of the customer's order page (screen inventory A13): the agreed design and price,
 * and a waiting proposal with what changed, Accept and Decline. CUSTOM_TERMS_CHANGED and a changed
 * status reload the page, because staff moved first.
 */
export default function CustomOrderCards({ order, onChanged, onStale, cardClassName }: {
  order: CustomerOrder;
  onChanged: (order: CustomerOrder) => void;
  onStale: () => void;
  cardClassName: string;
}) {
  const custom = order.custom;
  const { busy, error, run } = useAsyncAction();
  const { showToast } = useToast();
  const [declining, setDeclining] = useState(false);
  if (!custom) return null;
  const { agreed, pending } = custom;
  const changes = pending ? changesFrom(agreed, pending) : [];

  const handleFailure = (failure: { code?: string | null; message: string }) => {
    if (failure.code === "CUSTOM_TERMS_CHANGED" || failure.code === "ORDER_INVALID_STATE") {
      showToast("error", failure.message);
      onStale();
    }
  };

  function accept() {
    if (!pending) return;
    void run(async () => {
      onChanged(await acceptProposal(order.id, pending.termsNo, order.status));
      showToast("success", "Đã chấp nhận đề xuất. Cửa hàng sẽ duyệt đơn của bạn.");
    }, handleFailure);
  }

  return <>
    {pending && <section className={`${cardClassName} border-primary`}>
      <h2 className="font-serif font-medium text-heading-md text-primary m-0 mb-1">Cửa hàng đề xuất thay đổi</h2>
      {pending.note && <p className="font-sans text-[16px] text-text-secondary m-0 mb-2 whitespace-pre-line break-words">{pending.note}</p>}
      {changes.length > 0 && <>
        <p className="m-0 mt-3 mb-1 font-sans text-body-sm font-bold uppercase tracking-wide text-text-secondary">Thay đổi so với thiết kế hiện tại</p>
        <ul className="m-0 mb-4 list-none divide-y divide-neutral-border rounded-lg border border-neutral-border bg-neutral-surface p-0 font-sans text-[16px] text-text-primary">
          {changes.map((change) => <li key={change} className="px-3 py-2 break-words">{change}</li>)}
        </ul>
      </>}
      <p className="m-0 mb-1 font-sans text-body-sm font-bold uppercase tracking-wide text-text-secondary">Bó hoa đề xuất</p>
      <Materials terms={pending} />
      <p className="font-serif font-semibold text-[20px] text-primary-deep m-0 mt-2">Giá đề xuất {formatVND(pending.price)}</p>
      {error && !declining && <p role="alert" className="m-0 mt-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
      <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" disabled={busy} onClick={() => setDeclining(true)} className="rounded-full border-[1.5px] border-neutral-border bg-white px-5 py-2.5 font-sans text-body-sm font-bold text-text-secondary">Từ chối</Button>
        <Button type="button" disabled={busy} onClick={accept} className="rounded-full bg-primary px-6 py-2.5 font-sans text-body-sm font-bold text-white hover:bg-primary-hover disabled:opacity-50">{busy ? "Đang gửi…" : "Chấp nhận"}</Button>
      </div>
    </section>}

    {agreed && <section className={cardClassName}>
      <h2 className="font-serif font-medium text-heading-md text-primary m-0 mb-1">{pending ? "Thiết kế hiện tại" : "Thiết kế của bạn"}</h2>
      <p className="font-sans font-bold text-[16px] text-text-primary m-0 mb-1">{agreed.arrangementTypeName}</p>
      <Materials terms={agreed} />
      {agreed.note && <p className="font-sans text-body-sm text-text-muted m-0 mt-2 whitespace-pre-line break-words">{agreed.note}</p>}
      <p className="font-serif font-semibold text-[20px] text-primary-deep m-0 mt-2">{formatVND(agreed.price)}</p>
      {Number(agreed.price) === Number(agreed.materialsSubtotal) + Number(agreed.labourFee) && (
        <p className="font-sans text-body-sm text-text-muted m-0 mt-1">Gồm nguyên liệu {formatVND(agreed.materialsSubtotal)} và phí công {formatVND(agreed.labourFee)}.</p>
      )}
    </section>}

    {declining && pending && <DeclineDialog
      busy={busy}
      error={error}
      onClose={() => setDeclining(false)}
      onDecline={(reason) => {
        void run(async () => {
          onChanged(await declineProposal(order.id, pending.termsNo, order.status, reason));
          setDeclining(false);
          showToast("success", "Đã từ chối đề xuất.");
        }, (failure) => {
          setDeclining(false);
          handleFailure(failure);
        });
      }}
    />}
  </>;
}

function DeclineDialog({ busy, error, onClose, onDecline }: {
  busy: boolean;
  error: string | null;
  onClose: () => void;
  onDecline: (reason: string) => void;
}) {
  const [note, setNote] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (note.trim()) onDecline(note.trim());
  }
  return <ModalDialog
    title="Từ chối đề xuất"
    onClose={() => { if (!busy) onClose(); }}
    footer={<div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <Button type="button" disabled={busy} onClick={onClose} className="min-h-11 rounded-lg border border-neutral-border bg-white px-4 text-sm font-semibold text-text-secondary">Quay lại</Button>
      <Button type="submit" form="decline-proposal-form" disabled={busy || !note.trim()} className="min-h-11 rounded-lg bg-primary px-5 text-sm font-bold text-white disabled:opacity-50">{busy ? "Đang gửi…" : "Gửi từ chối"}</Button>
    </div>}
  >
    <form id="decline-proposal-form" onSubmit={submit} className="space-y-3">
      <p className="m-0 text-sm text-text-muted">Thiết kế hiện tại được giữ nguyên. Hãy cho cửa hàng biết lý do.</p>
      <label className="flex flex-col gap-1 text-xs font-semibold text-text-secondary">Lý do
        <textarea autoFocus required rows={4} maxLength={1000} value={note} onChange={(event) => setNote(event.target.value)} className="resize-y rounded-lg border border-neutral-border bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-primary" />
      </label>
      {error && <p role="alert" className="m-0 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
    </form>
  </ModalDialog>;
}
