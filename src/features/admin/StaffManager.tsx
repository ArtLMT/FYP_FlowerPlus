"use client";

import Button from "@/components/ui/Button";
import ModalDialog from "@/components/ui/ModalDialog";
import FieldMessages from "@/features/admin/FieldMessages";
import InfoLine from "@/features/admin/InfoLine";
import { useStaffList } from "@/features/admin/hooks/use-staff-list";
import type { StaffAccount, StaffStatusFilter } from "@/lib/services/staff";

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Đang hoạt động",
  BANNED: "Đã vô hiệu hóa",
};

/** One Staff account card in the grid, with its deactivate/reactivate and resend-set-up-email actions. */
function StaffCard({ person, busy, resending, disabled, onToggle, onResend }: {
  person: StaffAccount;
  busy: boolean;
  resending: boolean;
  disabled: boolean;
  onToggle: () => void;
  onResend: () => void;
}) {
  const banned = person.status === "BANNED";
  return <article className="flex h-full flex-col rounded-xl border border-neutral-border bg-neutral-canvas p-5">
    <div className="mb-3 flex items-center justify-between gap-3"><h3 className="truncate font-serif text-xl font-semibold">{person.fullName || person.username}</h3><span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${banned ? "bg-neutral-raised text-text-secondary" : "bg-accent-sage-light text-text-primary"}`}>{STATUS_LABELS[person.status] ?? person.status}</span></div>
    <div className="space-y-2"><InfoLine label="Email" value={person.email} /><InfoLine label="Tên tài khoản" value={person.username} /></div>
    <div className="mt-auto flex flex-wrap gap-2 border-t border-neutral-border pt-4">
      <Button type="button" disabled={disabled} onClick={onToggle} className="rounded-lg border border-neutral-border bg-white px-4 py-2 text-sm font-semibold text-text-secondary hover:border-primary hover:text-primary-deep">{busy ? "Đang cập nhật…" : banned ? "Kích hoạt lại" : "Vô hiệu hóa"}</Button>
      {/* Only an active account can use the code, so a deactivated one gets no resend. */}
      {!banned && <Button type="button" disabled={disabled} onClick={onResend} className="rounded-lg px-3 py-2 text-sm font-semibold text-primary-deep hover:bg-neutral-surface">{resending ? "Đang gửi…" : "Gửi lại email thiết lập"}</Button>}
    </div>
  </article>;
}

/**
 * Staff workspace.
 * The page is ordered as: heading/Add button → status filter → create dialog → account cards → pagination.
 * Data and action state live in `hooks/use-staff-list.ts`.
 */
export default function StaffManager() {
  const list = useStaffList();

  return <section className="rounded-2xl border border-neutral-border bg-white p-4 shadow-sm sm:p-6">
    {/* Workspace heading, counts, and the primary action. */}
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div><h2 className="font-serif text-xl font-semibold text-text-primary">Staff accounts</h2><p className="mt-1 text-sm text-text-muted">{list.totalElements} tài khoản · trang {list.pageNumber + 1}/{Math.max(1, list.totalPages)}</p></div>
      <Button type="button" onClick={list.openCreate} className="w-full rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-hover sm:w-auto">+ Thêm nhân viên</Button>
    </div>

    {/* Status filter. */}
    <label className="mb-5 flex max-w-xs flex-col gap-1 text-xs font-semibold text-text-secondary">
      Trạng thái
      <select value={list.status} onChange={(event) => list.setStatus(event.target.value as StaffStatusFilter | "")} className="min-h-11 rounded-lg border border-neutral-border bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-primary">
        <option value="">Tất cả trạng thái</option><option value="ACTIVE">{STATUS_LABELS.ACTIVE}</option><option value="BANNED">{STATUS_LABELS.BANNED}</option>
      </select>
    </label>

    {list.feedback && !list.creatorOpen && <p role="status" className={`mb-5 rounded-lg px-4 py-3 text-sm ${list.feedback.kind === "error" ? "bg-red-50 text-red-800" : "bg-accent-sage-light text-text-primary"}`}>{list.feedback.text}</p>}

    {/* Create modal: name and email only; the new Staff member sets their own password. */}
    {list.creatorOpen && <ModalDialog
      title="Thêm nhân viên"
      onClose={list.closeCreator}
      footer={<div className="flex justify-end gap-3">
        <Button type="button" onClick={list.closeCreator} className="rounded-lg border border-neutral-border bg-white px-5 py-2.5 text-sm font-semibold text-text-secondary">Hủy</Button>
        <Button type="submit" form="staff-form" disabled={list.saving} className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover">{list.saving ? "Đang tạo…" : "Tạo tài khoản"}</Button>
      </div>}
    >
      <form id="staff-form" onSubmit={(event) => void list.submit(event)} className="grid gap-4">
        {list.feedback?.kind === "error" && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{list.feedback.text}</p>}
        <label className="flex flex-col gap-1 text-sm font-semibold text-text-secondary">
          Họ tên
          <input autoFocus required minLength={2} value={list.form.fullName} onChange={(event) => list.updateForm({ fullName: event.target.value })} className="rounded-lg border border-neutral-border bg-white px-3 py-2.5 font-normal outline-none focus:border-primary" />
          <FieldMessages messages={list.fieldErrors.fullName} />
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold text-text-secondary">
          Email
          <input required type="email" value={list.form.email} onChange={(event) => list.updateForm({ email: event.target.value })} className="rounded-lg border border-neutral-border bg-white px-3 py-2.5 font-normal outline-none focus:border-primary" />
          <FieldMessages messages={list.fieldErrors.email} />
        </label>
        <p className="text-xs text-text-muted">Nhân viên sẽ nhận email chứa mã để tự đặt mật khẩu.</p>
      </form>
    </ModalDialog>}

    {/* Staff-card grid, including loading/error/empty states. */}
    {list.state === "loading" ? <p className="py-8 text-center text-sm text-text-muted">Đang tải nhân viên…</p>
      : list.state === "error" ? <p role="alert" className="py-5 text-sm text-primary-deep">{list.error}</p>
        : list.state === "empty" ? <p className="py-8 text-center text-sm text-text-muted">{list.status ? "Không có nhân viên ở trạng thái này." : "Chưa có nhân sự."}</p>
          : <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{list.staff.map((person) => <StaffCard
            key={person.id}
            person={person}
            busy={list.actionStaffId === person.id}
            resending={list.resendingStaffId === person.id}
            disabled={list.actionsDisabled}
            onToggle={() => void list.changeStatus(person)}
            onResend={() => void list.resendInvitation(person)}
          />)}</div>}

    {/* Staff-list pagination. */}
    {list.showPagination && <div className="mt-6 flex justify-between border-t border-neutral-border pt-5">
      <Button type="button" disabled={!list.hasPrevious} onClick={list.previous} className="rounded-lg border border-neutral-border px-4 py-2 text-sm font-semibold text-text-secondary">Trước</Button>
      <Button type="button" disabled={!list.hasNext} onClick={list.next} className="rounded-lg border border-neutral-border px-4 py-2 text-sm font-semibold text-text-secondary">Tiếp</Button>
    </div>}
  </section>;
}
