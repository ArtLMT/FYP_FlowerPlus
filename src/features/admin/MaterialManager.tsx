"use client";

import Button from "@/components/ui/Button";
import ModalDialog from "@/components/ui/ModalDialog";
import FieldMessages from "@/features/admin/FieldMessages";
import InfoLine from "@/features/admin/InfoLine";
import MaterialDetailsDialog from "@/features/admin/MaterialDetailsDialog";
import MaterialStatusBadge from "@/features/admin/MaterialStatusBadge";
import { useMaterialManager } from "@/features/admin/hooks/use-material-manager";
import {
  formatMaterialPrice,
  MATERIAL_SORT_OPTIONS,
  MATERIAL_TYPE_LABELS,
  MATERIAL_UNIT_LABELS,
} from "@/features/admin/material-labels";
import type { MaterialSort, MaterialStatus, MaterialType, MaterialUnit } from "@/lib/services/materials";

/**
 * Materials workspace.
 * The page is ordered as: Add button → search/filters → editor/details dialogs → material cards → pagination.
 * Data and action state live in `hooks/use-material-manager.ts`.
 */
export default function MaterialManager() {
  const m = useMaterialManager();

  return (
    <div className="space-y-5">
      {/* Primary action above the list. */}
      <div className="flex justify-end">
        <Button type="button" onClick={m.openCreate} className="w-full rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-hover sm:w-auto">+ Thêm nguyên liệu</Button>
      </div>

      {/* Search, type/status filters, and sort controls for the material cards. */}
      <section className="space-y-4 rounded-xl border border-neutral-border bg-neutral-canvas p-4 sm:p-5" aria-label="Tìm và lọc nguyên liệu">
        <form onSubmit={m.applySearch} className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
          <label className="flex flex-col gap-1 text-xs font-semibold text-text-secondary">
            Tìm theo tên
            <input value={m.search} maxLength={100} onChange={(event) => m.setSearch(event.target.value)} placeholder="Nhập tên nguyên liệu" className="min-h-11 rounded-lg border border-neutral-border bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-primary" />
          </label>
          <Button type="submit" className="min-h-11 w-full self-end rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:w-auto">Tìm kiếm</Button>
        </form>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className="flex flex-col gap-1 text-xs font-semibold text-text-secondary">
            Loại
            <select value={m.type} onChange={(event) => m.setType(event.target.value as MaterialType | "")} className="min-h-11 rounded-lg border border-neutral-border bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-primary">
              <option value="">Tất cả loại</option><option value="FLOWER">Hoa</option><option value="DECORATION">Trang trí</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-text-secondary">
            Trạng thái
            <select value={m.status} onChange={(event) => m.setStatus(event.target.value as MaterialStatus | "")} className="min-h-11 rounded-lg border border-neutral-border bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-primary">
              <option value="">Tất cả trạng thái</option><option value="ACTIVE">Đang hoạt động</option><option value="DEACTIVATED">Đã ngừng</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-text-secondary">
            Sắp xếp
            <select value={m.sort} onChange={(event) => m.setSort(event.target.value as MaterialSort)} className="min-h-11 rounded-lg border border-neutral-border bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-primary">
              {MATERIAL_SORT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
        </div>
      </section>

      {m.feedback && !m.editorOpen && <p role="status" className={`rounded-lg px-4 py-3 text-sm ${m.feedback.kind === "error" ? "bg-red-50 text-red-800" : "bg-accent-sage-light text-text-primary"}`}>{m.feedback.text}</p>}
      {m.listError && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{m.listError}</p>}

      {/* Create/edit modal. The form fields and modal action buttons are changed here. */}
      {m.editorOpen && <ModalDialog
        title={m.editing ? "Chỉnh sửa nguyên liệu" : "Tạo nguyên liệu"}
        onClose={m.closeEditor}
        wide
        footer={<div className="flex justify-end gap-3">
          <Button type="button" onClick={m.closeEditor} className="rounded-lg border border-neutral-border bg-white px-5 py-2.5 text-sm font-semibold text-text-secondary">Hủy</Button>
          <Button type="submit" form="material-form" disabled={m.saving} className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover">{m.saving ? "Đang lưu…" : m.editing ? "Lưu thay đổi" : "Tạo nguyên liệu"}</Button>
        </div>}
      >
        <form id="material-form" onSubmit={(event) => void m.submit(event)} className="grid gap-4 sm:grid-cols-2">
          {m.feedback?.kind === "error" && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800 sm:col-span-2">{m.feedback.text}</p>}
          <label className="flex flex-col gap-1 text-sm font-semibold text-text-secondary sm:col-span-2">
            Tên nguyên liệu
            <input autoFocus required maxLength={100} value={m.form.name} onChange={(event) => m.updateForm({ name: event.target.value })} className="rounded-lg border border-neutral-border bg-white px-3 py-2.5 font-normal outline-none focus:border-primary" />
            <FieldMessages messages={m.fieldErrors.name} />
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold text-text-secondary">
            Loại
            <select required value={m.form.type} onChange={(event) => m.updateForm({ type: event.target.value as MaterialType })} className="rounded-lg border border-neutral-border bg-white px-3 py-2.5 font-normal outline-none focus:border-primary">
              <option value="FLOWER">Hoa</option><option value="DECORATION">Trang trí</option>
            </select>
            <FieldMessages messages={m.fieldErrors.type} />
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold text-text-secondary">
            Đơn vị
            <select required value={m.form.unitOfMeasure} onChange={(event) => m.updateForm({ unitOfMeasure: event.target.value as MaterialUnit })} className="rounded-lg border border-neutral-border bg-white px-3 py-2.5 font-normal outline-none focus:border-primary">
              {Object.entries(MATERIAL_UNIT_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            <FieldMessages messages={m.fieldErrors.unitOfMeasure} />
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold text-text-secondary sm:col-span-2">
            Giá bán (VND)
            <input required type="number" min="1" step="1" value={m.form.sellingPrice} onChange={(event) => m.setPrice(event.target.value)} className="rounded-lg border border-neutral-border bg-white px-3 py-2.5 font-normal outline-none focus:border-primary" />
            <FieldMessages messages={m.fieldErrors.sellingPrice} />
          </label>
        </form>
      </ModalDialog>}

      {/* Read-only detail modal; its internal layout lives in MaterialDetailsDialog.tsx. */}
      {m.detailsMaterial && <MaterialDetailsDialog material={m.detailsMaterial} onClose={m.closeDetails} onEdit={m.editFromDetails} />}

      {!m.loading && m.page && <p className="text-sm font-medium text-text-secondary">{m.page.totalElements} nguyên liệu</p>}

      {/* Material result cards and their Details/Edit/Status actions. */}
      {m.loading ? <p className="py-8 text-center text-sm text-text-muted">Đang tải nguyên liệu…</p>
        : m.listError ? null
          : m.page?.content.length === 0 ? <p className="rounded-xl border border-dashed border-neutral-border py-10 text-center text-sm text-text-muted">Không tìm thấy nguyên liệu phù hợp.</p>
          : <div className="grid gap-4 md:grid-cols-2">{m.page?.content.map((material) => <article key={material.id} className="flex h-full flex-col rounded-xl border border-neutral-border bg-white p-5 shadow-sm">
            <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
              <div><h3 className="font-serif text-xl font-semibold text-text-primary">{material.name}</h3><p className="mt-1 text-xs text-text-muted">{MATERIAL_TYPE_LABELS[material.type]} · {MATERIAL_UNIT_LABELS[material.unitOfMeasure]}</p></div>
              <MaterialStatusBadge status={material.status} />
            </div>
            <InfoLine label="Giá bán" value={`${formatMaterialPrice(material.sellingPrice)} / ${MATERIAL_UNIT_LABELS[material.unitOfMeasure]}`} />
            <div className="mt-auto flex flex-wrap gap-2 border-t border-neutral-border pt-4">
              <Button type="button" disabled={m.detailsDisabled} onClick={() => void m.openDetails(material.id)} className="rounded-lg border border-neutral-border bg-white px-4 py-2 text-sm font-semibold text-text-secondary hover:border-primary hover:text-primary-deep">{m.loadingDetailsId === material.id ? "Đang tải…" : "Chi tiết"}</Button>
              <Button type="button" disabled={m.actionsDisabled} onClick={() => void m.openEdit(material.id)} className="rounded-lg border border-neutral-border bg-white px-4 py-2 text-sm font-semibold text-text-secondary hover:border-primary hover:text-primary-deep">{m.loadingMaterialId === material.id ? "Đang mở…" : "Chỉnh sửa"}</Button>
              <Button type="button" disabled={m.actionsDisabled} onClick={() => void m.changeStatus(material)} className="rounded-lg px-3 py-2 text-sm font-semibold text-text-muted hover:bg-neutral-surface hover:text-text-primary">{m.actionMaterialId === material.id ? "Đang cập nhật…" : material.status === "ACTIVE" ? "Ngừng sử dụng" : "Kích hoạt lại"}</Button>
            </div>
          </article>)}</div>}

      {/* Material-list pagination. */}
      {!m.loading && m.page && m.page.totalPages > 1 && <div className="flex items-center justify-between border-t border-neutral-border pt-5">
        <Button type="button" disabled={!m.hasPrevious} onClick={m.previous} className="rounded-lg border border-neutral-border bg-white px-4 py-2 text-sm font-semibold text-text-secondary">Trước</Button>
        <span className="text-sm text-text-muted">{m.page.totalElements} mục · trang {m.page.page + 1}/{m.page.totalPages}</span>
        <Button type="button" disabled={!m.hasNext} onClick={m.next} className="rounded-lg border border-neutral-border bg-white px-4 py-2 text-sm font-semibold text-text-secondary">Tiếp</Button>
      </div>}
    </div>
  );
}
