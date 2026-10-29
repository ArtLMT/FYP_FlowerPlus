"use client";

import Button from "@/components/ui/Button";
import ModalDialog from "@/components/ui/ModalDialog";
import MaterialStatusBadge from "@/features/admin/MaterialStatusBadge";
import { formatMaterialPrice, MATERIAL_TYPE_LABELS, MATERIAL_UNIT_LABELS } from "@/features/admin/material-labels";
import type { Material } from "@/lib/services/materials";

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

/** Audit fields hold a user id until the backend can name the user. */
function displayUser(value: string | null) {
  if (!value) return "Chưa ghi nhận";
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
    return "Thông tin người dùng chưa khả dụng";
  }
  return value;
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 py-2">
      <dt className="text-xs font-semibold uppercase tracking-wide text-text-muted">{label}</dt>
      <dd className="mt-1 break-words text-sm text-text-primary">{value}</dd>
    </div>
  );
}

interface MaterialDetailsDialogProps {
  material: Material;
  onClose: () => void;
  onEdit: () => void;
}

/** Material detail modal: identity/price summary, material properties, audit fields, and Edit action. */
export default function MaterialDetailsDialog({ material, onClose, onEdit }: MaterialDetailsDialogProps) {
  return (
    <ModalDialog
      title="Chi tiết nguyên liệu"
      onClose={onClose}
      footer={<div className="flex justify-end"><Button type="button" onClick={onEdit} className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover">Chỉnh sửa</Button></div>}
    >
      {/* Material identity, lifecycle badge, and selling price. */}
      <div className="mb-5">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="font-serif text-2xl font-semibold text-text-primary">{material.name}</h3>
          <MaterialStatusBadge status={material.status} />
        </div>
        <p className="mt-3 font-serif text-2xl font-semibold text-primary-deep">{formatMaterialPrice(material.sellingPrice)} <span className="font-sans text-sm font-normal text-text-muted">/ {MATERIAL_UNIT_LABELS[material.unitOfMeasure]}</span></p>
      </div>
      <dl className="grid grid-cols-2 gap-x-6">
        <Detail label="Loại" value={MATERIAL_TYPE_LABELS[material.type]} />
        <Detail label="Đơn vị" value={MATERIAL_UNIT_LABELS[material.unitOfMeasure]} />
      </dl>
      {/* Read-only creation and last-update audit information. */}
      <section className="mt-5 border-t border-neutral-border pt-4" aria-labelledby="material-audit-title">
        <h4 id="material-audit-title" className="mb-2 font-semibold text-text-primary">Thông tin cập nhật</h4>
        <dl className="grid grid-cols-2 gap-x-6">
          <Detail label="Người tạo" value={displayUser(material.createdBy)} />
          <Detail label="Ngày tạo" value={formatDate(material.createdAt)} />
          <Detail label="Cập nhật bởi" value={displayUser(material.updatedBy)} />
          <Detail label="Cập nhật lúc" value={formatDate(material.updatedAt)} />
        </dl>
      </section>
    </ModalDialog>
  );
}
