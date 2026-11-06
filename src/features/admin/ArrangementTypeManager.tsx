"use client";

import Button from "@/components/ui/Button";
import ModalDialog from "@/components/ui/ModalDialog";
import FeedbackToast from "@/features/admin/FeedbackToast";
import FieldMessages from "@/features/admin/FieldMessages";
import { formatMoney } from "@/features/admin/OrderDetail";
import { useArrangementTypeManager } from "@/features/admin/hooks/use-arrangement-type-manager";
import { formatDate } from "@/features/admin/product-labels";

const FIELD = "rounded-lg border border-neutral-border bg-white px-3 py-2.5 font-normal outline-none focus:border-primary";

/**
 * Arrangement types workspace "Kiểu cắm" (T-ORD-13): Add button → feedback → list → dialogs.
 * Data and action state live in `hooks/use-arrangement-type-manager.ts`.
 */
export default function ArrangementTypeManager() {
  const m = useArrangementTypeManager();

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-text-muted">Khách chọn một kiểu cắm khi thiết kế bó hoa và trả phí công cố định của kiểu đó. Đơn đã gửi vẫn giữ phí cũ.</p>
        <Button type="button" onClick={() => m.openEditor(null)} className="w-full shrink-0 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-hover sm:w-auto">+ Thêm kiểu cắm</Button>
      </div>

      <FeedbackToast feedback={m.editorOpen ? null : m.feedback} />

      {m.loading ? <p className="py-8 text-center text-sm text-text-muted">Đang tải kiểu cắm…</p>
        : m.listError ? <div className="rounded-xl border border-neutral-border bg-white px-5 py-8 text-center">
          <p role="alert" className="text-sm text-red-800">{m.listError}</p>
          <Button type="button" onClick={m.reload} className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">Thử lại</Button>
        </div>
          : m.types.length === 0 ? <p className="rounded-xl border border-dashed border-neutral-border py-10 text-center text-sm text-text-muted">Chưa có kiểu cắm nào. Khách chưa thể thiết kế bó hoa cho đến khi có ít nhất một kiểu.</p>
            : <ul className="divide-y divide-neutral-border overflow-hidden rounded-xl border border-neutral-border bg-white">
              {m.types.map((type) => <li key={type.id} className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 break-words font-semibold text-text-primary">
                    {type.name}
                    {type.status !== "ACTIVE" && <span className="rounded-full bg-neutral-raised px-2 py-0.5 text-xs font-bold text-text-secondary">Đã ngừng</span>}
                  </p>
                  <p className="mt-0.5 text-xs text-text-muted">Phí công {formatMoney(type.labourFee)} · Cập nhật {formatDate(type.updatedAt)}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button type="button" disabled={m.saving} onClick={() => m.openEditor(type)} className="rounded-lg border border-neutral-border bg-white px-4 py-2 text-sm font-semibold text-text-secondary hover:border-primary hover:text-primary-deep">Sửa</Button>
                  <Button type="button" disabled={m.saving} onClick={() => m.askToToggle(type)} className="rounded-lg px-3 py-2 text-sm font-semibold text-text-muted hover:bg-neutral-surface">{type.status === "ACTIVE" ? "Ngừng" : "Mở lại"}</Button>
                </div>
              </li>)}
            </ul>}

      {m.editorOpen && <ModalDialog
        title={m.editing ? "Sửa kiểu cắm" : "Tạo kiểu cắm"}
        onClose={m.closeEditor}
        footer={<div className="flex justify-end gap-3">
          <Button type="button" onClick={m.closeEditor} className="rounded-lg border border-neutral-border bg-white px-5 py-2.5 text-sm font-semibold text-text-secondary">Hủy</Button>
          <Button type="submit" form="arrangement-type-form" disabled={m.saving} className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover">{m.saving ? "Đang lưu…" : "Lưu"}</Button>
        </div>}
      >
        <form id="arrangement-type-form" onSubmit={(event) => void m.submit(event)} className="space-y-4">
          {m.feedback?.kind === "error" && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{m.feedback.text}</p>}
          <label className="flex flex-col gap-1 text-sm font-semibold text-text-secondary">
            Tên kiểu cắm
            <input autoFocus required maxLength={100} value={m.name} onChange={(event) => m.setName(event.target.value)} className={FIELD} />
            <FieldMessages messages={m.fieldErrors.name} />
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold text-text-secondary">
            Phí công (VND)
            <input required type="number" min={0} step={1} value={m.labourFee} onChange={(event) => m.setLabourFee(event.target.value)} className={FIELD} />
            <FieldMessages messages={m.fieldErrors.labourFee} />
          </label>
        </form>
      </ModalDialog>}

      {m.toggling && <ModalDialog
        title={m.toggling.status === "ACTIVE" ? "Ngừng kiểu cắm" : "Mở lại kiểu cắm"}
        onClose={() => { if (!m.saving) m.closeToggle(); }}
        footer={<div className="flex justify-end gap-3">
          <Button type="button" disabled={m.saving} onClick={m.closeToggle} className="rounded-lg border border-neutral-border bg-white px-5 py-2.5 text-sm font-semibold text-text-secondary">Hủy</Button>
          <Button type="button" disabled={m.saving} onClick={() => void m.confirmToggle()} className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover">Xác nhận</Button>
        </div>}
      >
        <p className="text-sm text-text-secondary">
          {m.toggling.status === "ACTIVE"
            ? <><strong>{m.toggling.name}</strong> sẽ không còn được chọn cho yêu cầu mới. Yêu cầu đang chờ dùng kiểu này cần được đề xuất kiểu khác trước khi duyệt.</>
            : <><strong>{m.toggling.name}</strong> sẽ được chọn lại cho yêu cầu mới.</>}
        </p>
      </ModalDialog>}
    </div>
  );
}
