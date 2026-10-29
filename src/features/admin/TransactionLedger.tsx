"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Button from "@/components/ui/Button";
import BatchAdjustDialog from "@/features/admin/BatchAdjustDialog";
import { MATERIAL_UNIT_LABELS } from "@/features/admin/material-labels";
import { useResource } from "@/lib/hooks/use-resource";
import { formatShopDateTime } from "@/lib/utils";
import { listTransactions, type InventoryTransaction, type InventoryTransactionType, type MaterialBatch } from "@/lib/services/inventory";

const PAGE_SIZE = 20;

const TYPE_LABELS: Record<InventoryTransactionType, string> = {
  RECEIVED: "Nhập kho",
  RESERVED: "Giữ cho đơn",
  RELEASED: "Trả lại kho",
  CONSUMED: "Đã sử dụng",
  EXPIRED: "Hết hạn",
  ADJUSTED: "Điều chỉnh",
};

const TYPE_STYLES: Record<InventoryTransactionType, string> = {
  RECEIVED: "bg-accent-sage-light text-text-primary",
  RESERVED: "bg-tertiary text-primary",
  RELEASED: "bg-neutral-raised text-text-secondary",
  CONSUMED: "bg-neutral-raised text-text-secondary",
  EXPIRED: "bg-red-50 text-red-800",
  ADJUSTED: "bg-neutral-raised text-text-secondary",
};

/** The first block of a UUID, enough to tell rows apart on screen. */
const shortId = (id: string) => id.slice(0, 8).toUpperCase();

/**
 * Inventory transactions — the append-only stock ledger, newest first. Rows are never edited or
 * deleted (BR-INV-09); a correction is a new ADJUSTED row, recorded from the Adjust dialog.
 * Change the summary/action bar, ledger table, and pagination in this component.
 */
export default function TransactionLedger() {
  const [pageNumber, setPageNumber] = useState(0);
  const list = useResource(() => listTransactions({ page: pageNumber, size: PAGE_SIZE }), String(pageNumber));
  const page = list.data;
  const currentPage = page?.page ?? pageNumber;
  const [adjusting, setAdjusting] = useState(false);
  const [notice, setNotice] = useState("");

  function adjusted(batch: MaterialBatch) {
    setAdjusting(false);
    setNotice(`Đã điều chỉnh lô ${batch.materialName}.`);
    // The new row is the newest: show the first page.
    setPageNumber(0);
    list.reload();
  }

  return (
    <div className="space-y-4">
      {/* Ledger count, manual reload, and the adjust action. */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {page && <p className="text-sm text-text-muted">{page.totalElements} giao dịch · mới nhất trước</p>}
        <div className="ml-auto flex gap-2">
          <Button type="button" onClick={list.reload} className="rounded-lg border border-neutral-border bg-white px-4 py-2 text-sm font-semibold text-text-secondary hover:border-primary hover:text-primary-deep">Tải lại</Button>
          <Button type="button" onClick={() => { setNotice(""); setAdjusting(true); }} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-primary-hover">Điều chỉnh tồn kho</Button>
        </div>
      </div>

      {notice && <p role="status" className="rounded-lg bg-accent-sage-light px-4 py-3 text-sm text-text-primary">{notice}</p>}

      {list.error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{list.error.message}</p>}

      {/* Read-only transaction table, including its loading and empty states. */}
      {list.loading && !page ? <p className="py-8 text-center text-sm text-text-muted">Đang tải giao dịch…</p>
        : page?.content.length === 0 ? <p className="rounded-xl border border-dashed border-neutral-border py-10 text-center text-sm text-text-muted">Chưa có giao dịch nào.</p>
          : page && <div className="overflow-x-auto rounded-xl border border-neutral-border bg-white shadow-sm">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="border-b border-neutral-border bg-neutral-canvas text-xs uppercase tracking-wider text-text-muted text-center">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">Thời gian</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Loại</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Nguyên liệu</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">Số lượng</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Lô</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Đơn hàng</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Ghi chú</th>
                </tr>
              </thead>
              <tbody className={"text-center"}>{page.content.map((transaction) => <TransactionRow key={transaction.id} transaction={transaction} />)}</tbody>
            </table>
          </div>}

      {/* Ledger pagination. */}
      {page && page.totalPages > 1 && <div className="flex items-center justify-between border-t border-neutral-border pt-5">
        <Button type="button" disabled={currentPage === 0} onClick={() => setPageNumber(currentPage - 1)} className="rounded-lg border border-neutral-border bg-white px-4 py-2 text-sm font-semibold text-text-secondary">Trước</Button>
        <span className="text-sm text-text-muted">trang {currentPage + 1}/{page.totalPages}</span>
        <Button type="button" disabled={currentPage + 1 >= page.totalPages} onClick={() => setPageNumber(currentPage + 1)} className="rounded-lg border border-neutral-border bg-white px-4 py-2 text-sm font-semibold text-text-secondary">Tiếp</Button>
      </div>}

      {adjusting && <BatchAdjustDialog onClose={() => setAdjusting(false)} onAdjusted={adjusted} onMissing={() => {}} />}
    </div>
  );
}

/** One row in the stock-transaction ledger. */
function TransactionRow({ transaction }: { transaction: InventoryTransaction }) {
  const amount = Number(transaction.quantity);
  // Only ADJUSTED is signed; show + too so an increase reads as one at a glance.
  const quantity = `${transaction.type === "ADJUSTED" && amount > 0 ? "+" : ""}${amount.toLocaleString("vi-VN", { maximumFractionDigits: 2 })}`;

  return (
    <tr className="border-b border-neutral-border last:border-b-0">
      <td className="whitespace-nowrap px-4 py-3 text-text-secondary">{formatShopDateTime(transaction.createdAt)}</td>
      <td className="px-4 py-3">
        <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${TYPE_STYLES[transaction.type]}`}>{TYPE_LABELS[transaction.type]}</span>
      </td>
      <td className="px-4 py-3 font-semibold text-text-primary">{transaction.materialName}</td>
      <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-text-primary">
        {quantity} <span className="text-xs text-text-muted">{MATERIAL_UNIT_LABELS[transaction.unitOfMeasure]}</span>
      </td>
      <td className="px-4 py-3 font-mono text-xs text-text-muted">{shortId(transaction.materialBatchId)}</td>
      <td className="px-4 py-3 font-mono text-xs text-text-muted">{transaction.orderId ? `#${shortId(transaction.orderId)}` : "—"}</td>
      <td className="w-72 max-w-72 px-4 py-3 text-left text-text-secondary">{transaction.note ? <NoteCell note={transaction.note} /> : <span className="block text-center">—</span>}</td>
    </tr>
  );
}

/**
 * A note clamped to two lines so a long one cannot stretch the row; when it is cut off, a toggle
 * shows the whole paragraph in place.
 */
function NoteCell({ note }: { note: string }) {
  const textRef = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);

  // Measured while clamped: the full text is taller than the two visible lines.
  useLayoutEffect(() => {
    const text = textRef.current;
    if (text && !expanded) setOverflowing(text.scrollHeight > text.clientHeight + 1);
  }, [note, expanded]);

  return (
    <div>
      <p ref={textRef} title={expanded ? undefined : note} className={`whitespace-pre-line break-words ${expanded ? "" : "line-clamp-2"}`}>{note}</p>
      {(overflowing || expanded) && <Button type="button" onClick={() => setExpanded((current) => !current)} aria-expanded={expanded} className="mt-1 text-xs font-semibold text-primary hover:text-primary-deep hover:underline">
        {expanded ? "Thu gọn" : "Xem thêm"}
      </Button>}
    </div>
  );
}
