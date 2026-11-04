"use client";

import Image from "next/image";
import { useState } from "react";
import Button from "@/components/ui/Button";
import ModalDialog from "@/components/ui/ModalDialog";
import { takeFiles } from "@/features/admin/file-input";
import { IMAGE_ACCEPT, MAX_PRODUCT_IMAGES, type ManagedProduct } from "@/lib/services/managed-products";

/**
 * Upload, reorder, and remove a saved Product's images. Used under the detail gallery and in the
 * edit form. Each change is saved at once, separately from the form's Save button.
 */
export default function ProductImageManager({
  product,
  busy,
  error = "",
  onUpload,
  onMove,
  onRemove,
  onSelect,
}: {
  product: ManagedProduct;
  busy: boolean;
  /** Why the last image change was refused, shown right above the images it is about. */
  error?: string;
  onUpload: (files: File[]) => void;
  onMove: (index: number, direction: -1 | 1) => void;
  onRemove: (imageId: string) => void;
  /** Shows image `index` in a larger view, when there is one (the detail gallery). */
  onSelect?: (index: number) => void;
}) {
  const images = product.images;
  const [removing, setRemoving] = useState<{ id: string; position: number } | null>(null);

  return <div className="space-y-3">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h3 className="text-sm font-semibold text-text-primary">Quản lý ảnh</h3>
        <p className="mt-1 text-xs text-text-muted">JPG, PNG hoặc WebP · tối đa 2 MB mỗi ảnh · còn {MAX_PRODUCT_IMAGES - images.length} chỗ trống</p>
      </div>
      <label className={`inline-flex min-h-10 items-center rounded-lg border border-primary px-3 py-2 text-xs font-semibold text-primary-deep ${busy || images.length >= MAX_PRODUCT_IMAGES ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-neutral-canvas"}`}>
        Thêm ảnh
        <input
          type="file"
          multiple
          accept={IMAGE_ACCEPT}
          disabled={busy || images.length >= MAX_PRODUCT_IMAGES}
          onChange={(event) => {
            const files = takeFiles(event);
            if (files.length) onUpload(files);
          }}
          className="sr-only"
        />
      </label>
    </div>
    {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800">{error}</p>}
    {images.length === 0 && <p className="text-xs text-text-muted">Sản phẩm chưa có ảnh nào. Ảnh đầu tiên sẽ là ảnh chính.</p>}
    {images.length > 0 && <div className="grid gap-2 sm:grid-cols-2">
      {images.map((image, index) => <article key={image.id} className="flex min-w-0 items-center gap-2 rounded-xl border border-neutral-border bg-neutral-canvas p-2">
        {onSelect
          ? <button type="button" onClick={() => onSelect(index)} className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-neutral-raised" aria-label={`Xem ảnh ${index + 1}`}>
            <Image src={image.contentUrl} alt="" fill unoptimized className="object-cover" sizes="56px" />
          </button>
          : <span className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-neutral-raised">
            <Image src={image.contentUrl} alt={`Ảnh ${index + 1}`} fill unoptimized className="object-cover" sizes="56px" />
          </span>}
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-text-primary">{index === 0 ? "Ảnh chính" : `Ảnh ${index + 1}`}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1">
            <Button
              type="button"
              disabled={busy || index === 0}
              onClick={() => onMove(index, -1)}
              aria-label={`Đưa ảnh ${index + 1} lên trước`}
              className="rounded-md border border-neutral-border bg-white px-2 py-1 text-xs disabled:opacity-40"
            >←</Button>
            <Button
              type="button"
              disabled={busy || index === images.length - 1}
              onClick={() => onMove(index, 1)}
              aria-label={`Đưa ảnh ${index + 1} ra sau`}
              className="rounded-md border border-neutral-border bg-white px-2 py-1 text-xs disabled:opacity-40"
            >→</Button>
            <Button
              type="button"
              disabled={busy}
              onClick={() => setRemoving({ id: image.id, position: index + 1 })}
              className="ml-1 px-1 py-1 text-xs font-semibold text-primary-deep disabled:opacity-40"
            >Xóa</Button>
          </div>
        </div>
      </article>)}
    </div>}

    {removing && <ModalDialog
      title="Xóa ảnh sản phẩm"
      onClose={() => setRemoving(null)}
      footer={<div className="flex justify-end gap-3">
        <Button type="button" onClick={() => setRemoving(null)} className="rounded-lg border border-neutral-border bg-white px-5 py-2.5 text-sm font-semibold text-text-secondary">Hủy</Button>
        <Button
          type="button"
          onClick={() => {
            onRemove(removing.id);
            setRemoving(null);
          }}
          className="rounded-lg bg-red-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-800"
        >Xác nhận xóa</Button>
      </div>}
    >
      <p className="text-sm text-text-secondary">Xóa ảnh {removing.position} khỏi <strong>{product.name}</strong>? Không thể hoàn tác.</p>
    </ModalDialog>}
  </div>;
}
