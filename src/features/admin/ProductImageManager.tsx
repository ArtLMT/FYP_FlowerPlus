"use client";

import Image from "next/image";
import Button from "@/components/ui/Button";
import { takeFiles } from "@/features/admin/file-input";
import { IMAGE_ACCEPT, MAX_PRODUCT_IMAGES, type ManagedProduct } from "@/lib/services/managed-products";

/**
 * Upload, reorder, and remove a saved Product's images. Used under the detail gallery and in the
 * edit form. Each change is saved at once, separately from the form's Save button.
 */
export default function ProductImageManager({
  product,
  busy,
  onUpload,
  onMove,
  onRemove,
  onSelect,
}: {
  product: ManagedProduct;
  busy: boolean;
  onUpload: (files: File[]) => void;
  onMove: (index: number, direction: -1 | 1) => void;
  onRemove: (imageId: string) => void;
  /** Shows image `index` in a larger view, when there is one (the detail gallery). */
  onSelect?: (index: number) => void;
}) {
  const images = product.images;

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
              onClick={() => {
                if (window.confirm(`Xóa ảnh ${index + 1} khỏi ${product.name}?`)) onRemove(image.id);
              }}
              className="ml-1 px-1 py-1 text-xs font-semibold text-primary-deep disabled:opacity-40"
            >Xóa</Button>
          </div>
        </div>
      </article>)}
    </div>}
  </div>;
}
