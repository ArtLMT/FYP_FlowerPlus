"use client";

import Button from "@/components/ui/Button";
import ModalDialog from "@/components/ui/ModalDialog";
import FieldMessages from "@/features/admin/FieldMessages";
import { useCategoryManager } from "@/features/admin/hooks/use-category-manager";
import { formatDate } from "@/features/admin/product-labels";

/**
 * Categories workspace (T-PROD-10).
 * The page is ordered as: Add button → feedback → category list → create/rename and delete dialogs.
 * Data and action state live in `hooks/use-category-manager.ts`.
 */
export default function CategoryManager() {
  const c = useCategoryManager();

  return (
    <div className="space-y-5">
      {/* Primary action above the list. */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-text-muted">Khách hàng lọc sản phẩm theo các danh mục này. Mỗi sản phẩm đang bán cần ít nhất một danh mục.</p>
        <Button type="button" onClick={c.openCreate} className="w-full shrink-0 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-hover sm:w-auto">+ Thêm danh mục</Button>
      </div>

      {c.feedback && !c.editorOpen && <p role="status" className={`rounded-lg px-4 py-3 text-sm ${c.feedback.kind === "error" ? "bg-red-50 text-red-800" : "bg-accent-sage-light text-text-primary"}`}>{c.feedback.text}</p>}

      {/* Category list: name, last change, and Rename/Delete actions. */}
      {c.loading ? <p className="py-8 text-center text-sm text-text-muted">Đang tải danh mục…</p>
        : c.listError ? <div className="rounded-xl border border-neutral-border bg-white px-5 py-8 text-center">
          <p role="alert" className="text-sm text-red-800">{c.listError}</p>
          <Button type="button" onClick={c.reload} className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">Thử lại</Button>
        </div>
          : c.categories.length === 0 ? <p className="rounded-xl border border-dashed border-neutral-border py-10 text-center text-sm text-text-muted">Chưa có danh mục nào.</p>
            : <>
              <p className="text-sm font-medium text-text-secondary">{c.categories.length} danh mục</p>
              <ul className="divide-y divide-neutral-border overflow-hidden rounded-xl border border-neutral-border bg-white">
                {c.categories.map((category) => <li key={category.id} className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                  <div className="min-w-0">
                    <p className="break-words font-semibold text-text-primary">{category.name}</p>
                    <p className="mt-0.5 text-xs text-text-muted">Cập nhật {formatDate(category.updatedAt)}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button type="button" disabled={c.saving} onClick={() => c.openRename(category)} className="rounded-lg border border-neutral-border bg-white px-4 py-2 text-sm font-semibold text-text-secondary hover:border-primary hover:text-primary-deep">Đổi tên</Button>
                    <Button type="button" disabled={c.saving} onClick={() => c.askToDelete(category)} className="rounded-lg px-3 py-2 text-sm font-semibold text-text-muted hover:bg-neutral-surface hover:text-red-800">Xóa</Button>
                  </div>
                </li>)}
              </ul>
            </>}

      {/* Create/rename modal. */}
      {c.editorOpen && <ModalDialog
        title={c.editing ? "Đổi tên danh mục" : "Tạo danh mục"}
        onClose={c.closeEditor}
        footer={<div className="flex justify-end gap-3">
          <Button type="button" onClick={c.closeEditor} className="rounded-lg border border-neutral-border bg-white px-5 py-2.5 text-sm font-semibold text-text-secondary">Hủy</Button>
          <Button type="submit" form="category-form" disabled={c.saving} className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover">{c.saving ? "Đang lưu…" : c.editing ? "Lưu tên mới" : "Tạo danh mục"}</Button>
        </div>}
      >
        <form id="category-form" onSubmit={(event) => void c.submit(event)} className="space-y-4">
          {c.feedback?.kind === "error" && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{c.feedback.text}</p>}
          <label className="flex flex-col gap-1 text-sm font-semibold text-text-secondary">
            Tên danh mục
            <input autoFocus required maxLength={100} value={c.name} onChange={(event) => c.setName(event.target.value)} className="rounded-lg border border-neutral-border bg-white px-3 py-2.5 font-normal outline-none focus:border-primary" />
            <FieldMessages messages={c.fieldErrors.name} />
          </label>
          {c.editing && <p className="text-xs text-text-muted">Tên mới hiển thị ngay trên mọi sản phẩm thuộc danh mục này.</p>}
        </form>
      </ModalDialog>}

      {/* Delete confirmation. A refusal (Active products would lose their last category) stays here. */}
      {c.deleting && <ModalDialog
        title="Xóa danh mục"
        onClose={() => { if (!c.saving) c.closeDelete(); }}
        footer={<div className="flex justify-end gap-3">
          <Button type="button" disabled={c.saving} onClick={c.closeDelete} className="rounded-lg border border-neutral-border bg-white px-5 py-2.5 text-sm font-semibold text-text-secondary">Hủy</Button>
          <Button type="button" disabled={c.saving} onClick={() => void c.confirmDelete()} className="rounded-lg bg-red-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-800">{c.saving ? "Đang xóa…" : "Xác nhận xóa"}</Button>
        </div>}
      >
        <p className="text-sm text-text-secondary">Xóa <strong>{c.deleting.name}</strong>? Danh mục sẽ được gỡ khỏi mọi sản phẩm đang dùng nó. Không thể hoàn tác.</p>
        <p className="mt-3 text-sm text-text-secondary">Nếu một sản phẩm đang bán chỉ có danh mục này, hệ thống sẽ từ chối xóa.</p>
        {c.deleteError && <p role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{c.deleteError}</p>}
      </ModalDialog>}
    </div>
  );
}
