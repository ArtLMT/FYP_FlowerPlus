"use client";

import Image from "next/image";
import { useState } from "react";
import Button from "@/components/ui/Button";
import ModalDialog from "@/components/ui/ModalDialog";
import ProductCreateForm from "@/features/admin/ProductCreateForm";
import ProductImageManager from "@/features/admin/ProductImageManager";
import { useProductManager, type StatusFilter } from "@/features/admin/hooks/use-product-manager";
import { MATERIAL_TYPE_LABELS, MATERIAL_UNIT_LABELS } from "@/features/admin/material-labels";
import {
  formatDate,
  formatMoney,
  PRODUCT_STATUS_LABELS,
  PRODUCT_STATUS_STYLES,
  productSetupSummary,
  productTypeLabel,
  shortId,
} from "@/features/admin/product-labels";
import {
  ACTIVATION_REQUIREMENTS,
  type ManagedProduct,
  type ManagedProductStatus,
} from "@/lib/services/managed-products";

/** Product lifecycle badge used in both list rows and the detail header. */
function StatusBadge({ status }: { status: ManagedProductStatus }) {
  return <span className={`inline-flex min-h-7 items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${PRODUCT_STATUS_STYLES[status]}`}>
    {PRODUCT_STATUS_LABELS[status]}<span aria-hidden="true" className="inline-block size-1.5 shrink-0 rounded-full bg-current" />
  </span>;
}

/** Activate, reactivate, or deactivate button shared by Product list and detail views. */
function LifecycleButton({
  product,
  busy,
  onClick,
  compact = false,
}: {
  product: ManagedProduct;
  busy: boolean;
  onClick: () => void;
  compact?: boolean;
}) {
  const action = product.status === "ACTIVE" ? "Ngừng bán" : product.status === "DEACTIVATED" ? "Mở bán lại" : "Mở bán";
  const active = product.status === "ACTIVE";
  return <Button
    type="button"
    disabled={busy}
    onClick={onClick}
    aria-label={`${action} ${product.name}`}
    className={`shrink-0 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed ${active ? "border-red-300 bg-white text-red-700 hover:bg-red-50" : "border-primary bg-primary text-white hover:bg-primary-hover"} ${compact ? "min-w-[82px]" : "min-w-[112px]"}`}
  >{busy ? "Đang lưu…" : action}</Button>;
}

/** Opens the Product edit form from a list row or detail view. */
function EditButton({ product, onClick }: { product: ManagedProduct; onClick: () => void }) {
  return <Button
    type="button"
    onClick={onClick}
    aria-label={`Sửa ${product.name}`}
    className="shrink-0 rounded-xl border border-neutral-border bg-white px-3 py-2 text-sm font-semibold text-text-secondary hover:border-primary hover:text-primary-deep"
  >Sửa</Button>;
}

/**
 * Full Product detail view.
 * Header/actions are first, image gallery is left, information/recipe are right, and audit is last.
 */
function ProductDetail({
  product,
  loading,
  error,
  busy,
  onBack,
  onEdit,
  onLifecycle,
  onReturnToDraft,
  onUpload,
  onMove,
  onRemove,
}: {
  product: ManagedProduct | null;
  loading: boolean;
  error: string;
  busy: boolean;
  onBack: () => void;
  onEdit: () => void;
  onLifecycle: () => void;
  onReturnToDraft: () => void;
  onUpload: (files: File[]) => void;
  onMove: (index: number, direction: -1 | 1) => void;
  onRemove: (imageId: string) => void;
}) {
  const [imageIndex, setImageIndex] = useState(0);

  if (loading) return <div className="w-full min-w-0 rounded-2xl border border-neutral-border bg-white p-8 text-center text-sm text-text-muted">Đang tải chi tiết sản phẩm…</div>;
  if (error || !product) return <div className="w-full min-w-0 rounded-2xl border border-neutral-border bg-white p-6">
    <Button type="button" onClick={onBack} className="mb-5 text-sm font-semibold text-primary-deep">← Quay lại danh sách sản phẩm</Button>
    <p role="alert" className="text-sm text-primary-deep">{error || "Không tìm thấy sản phẩm."}</p>
  </div>;

  const images = product.images;
  const visibleImageIndex = Math.max(0, Math.min(imageIndex, images.length - 1));
  const selectedImage = images[visibleImageIndex];

  return <div className="w-full min-w-0 max-w-full space-y-5">
    {/* Product identity, status, Back/Edit, and lifecycle actions. */}
    <div className="flex flex-col gap-4 border-b border-neutral-border pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <Button type="button" onClick={onBack} className="mb-3 text-sm font-semibold text-text-secondary hover:text-primary-deep">← Quay lại danh sách sản phẩm</Button>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="break-words font-serif text-3xl font-semibold text-text-primary">{product.name}</h2>
          <span className="rounded-full border border-neutral-border bg-neutral-raised px-3 py-1 text-xs font-semibold text-text-secondary">{productTypeLabel(product.type)}</span>
          <StatusBadge status={product.status} />
        </div>
      </div>
      <div className="flex flex-wrap justify-end gap-2">
        <EditButton product={product} onClick={onEdit} />
        <LifecycleButton product={product} busy={busy} onClick={onLifecycle} />
        {product.status === "DEACTIVATED" && <Button type="button" disabled={busy} onClick={onReturnToDraft} className="rounded-xl border border-neutral-border bg-white px-3 py-2 text-sm font-semibold text-text-secondary hover:border-primary">Chuyển về bản nháp</Button>}
      </div>
    </div>

    <div className="grid min-w-0 items-start gap-4 lg:grid-cols-2">
      {/* Product image gallery plus upload, reorder, and remove controls. */}
      <section aria-label="Thư viện ảnh sản phẩm" className="min-w-0 overflow-hidden rounded-2xl border border-neutral-border bg-neutral-surface">
        <div className="relative aspect-[4/3] bg-neutral-raised">
          {selectedImage ? <Image
            key={selectedImage.id}
            src={selectedImage.contentUrl}
            alt={`${product.name} - ảnh ${visibleImageIndex + 1}`}
            fill
            unoptimized
            className="object-contain"
            sizes="(max-width: 1024px) 100vw, 50vw"
          /> : <div className="absolute inset-0 grid place-items-center px-5 text-center text-sm text-text-muted">Sản phẩm chưa có ảnh nào.</div>}
          {selectedImage && visibleImageIndex === 0 && <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">Ảnh chính</span>}
          {images.length > 1 && <>
            <Button type="button" aria-label="Ảnh trước" onClick={() => setImageIndex((visibleImageIndex + images.length - 1) % images.length)} className="absolute left-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-neutral-border bg-white/90 text-lg shadow-sm">‹</Button>
            <Button type="button" aria-label="Ảnh tiếp theo" onClick={() => setImageIndex((visibleImageIndex + 1) % images.length)} className="absolute right-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-neutral-border bg-white/90 text-lg shadow-sm">›</Button>
          </>}
        </div>
        <div className="flex items-center justify-between gap-3 px-4 py-3 text-xs text-text-muted">
          <span>{selectedImage ? `Ảnh ${visibleImageIndex + 1} / ${images.length}` : "Thư viện ảnh"}</span>
          {images.length > 1 && <div className="flex gap-1.5" aria-label="Chọn ảnh">
            {images.map((image, index) => <button key={image.id} type="button" aria-label={`Xem ảnh ${index + 1}`} aria-pressed={index === visibleImageIndex} onClick={() => setImageIndex(index)} className={`size-2.5 rounded-full ${index === visibleImageIndex ? "bg-primary" : "bg-neutral-border"}`} />)}
          </div>}
        </div>
        <div className="border-t border-neutral-border bg-white p-4">
          <ProductImageManager product={product} busy={busy} onUpload={onUpload} onMove={onMove} onRemove={onRemove} onSelect={setImageIndex} />
        </div>
      </section>

      <div className="min-w-0 space-y-4">
        {/* Read-only Product fields such as price, type, description, and version. */}
        <section className="min-w-0 rounded-2xl border border-neutral-border bg-white p-4 sm:p-6">
          <h3 className="mb-4 font-serif text-xl font-semibold">Thông tin sản phẩm</h3>
          <dl className="grid grid-cols-[minmax(95px,0.7fr)_minmax(0,1.3fr)] gap-x-4 gap-y-3 text-sm">
            <dt className="text-text-muted">Giá bán (gốc)</dt><dd className="min-w-0 break-words text-right"><strong className="text-lg text-primary-deep">{formatMoney(product.basePrice)}</strong><span className="mt-0.5 block text-xs text-text-muted">Chưa áp dụng giảm giá theo lịch</span></dd>
            <dt className="text-text-muted">Loại</dt><dd className="min-w-0 break-words text-right">{productTypeLabel(product.type)}</dd>
            <dt className="text-text-muted">Mô tả</dt><dd className="min-w-0 break-words text-right leading-relaxed">{product.description || "Chưa có"}</dd>
            <dt className="text-text-muted">Phiên bản</dt><dd className="min-w-0 break-words text-right">{product.version}</dd>
          </dl>
        </section>

        {/* Product recipe shown as cards on mobile and a table on wider screens. */}
        <section className="min-w-0 rounded-2xl border border-neutral-border bg-white p-4 sm:p-6">
          <h3 className="mb-4 font-serif text-xl font-semibold">Công thức <span className="font-sans text-sm font-normal text-text-muted">· {product.recipe.length} nguyên liệu</span></h3>
          {product.recipe.length ? <>
            <div className="space-y-2 sm:hidden">
              {product.recipe.map((line) => <article key={line.materialId} className="min-w-0 rounded-xl border border-neutral-border bg-neutral-canvas p-3">
                <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
                  <p className="min-w-0 flex-1 break-words font-semibold text-text-primary">{line.materialName}</p>
                  <strong className="shrink-0 text-sm text-primary-deep">{line.quantityRequired} {MATERIAL_UNIT_LABELS[line.materialUnit].toLowerCase()}</strong>
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-text-muted">
                  <span>{MATERIAL_TYPE_LABELS[line.materialType]}</span><span aria-hidden="true">·</span><span>{line.materialStatus === "ACTIVE" ? "Nguyên liệu đang hoạt động" : "Nguyên liệu đã ngừng"}</span>
                </div>
              </article>)}
            </div>
            <div className="hidden overflow-x-auto sm:block"><table className="w-full min-w-[400px] text-left text-sm">
              <thead><tr className="border-b border-neutral-border text-xs text-text-muted"><th className="pb-2 font-medium">Nguyên liệu</th><th className="pb-2 font-medium">Loại</th><th className="pb-2 text-right font-medium">Số lượng cần</th></tr></thead>
              <tbody>{product.recipe.map((line) => <tr key={line.materialId} className="border-b border-neutral-border last:border-0">
                <td className="py-3 pr-3"><span className="font-semibold">{line.materialName}</span><span className="mt-0.5 block text-xs text-text-muted">{line.materialStatus === "ACTIVE" ? "Nguyên liệu đang hoạt động" : "Nguyên liệu đã ngừng"}</span></td>
                <td className="py-3 pr-3 text-text-secondary">{MATERIAL_TYPE_LABELS[line.materialType]}</td>
                <td className="py-3 text-right font-semibold">{line.quantityRequired} {MATERIAL_UNIT_LABELS[line.materialUnit].toLowerCase()}</td>
              </tr>)}</tbody>
            </table></div>
          </> : <p className="text-sm text-text-muted">Chưa có dòng công thức nào.</p>}
        </section>
      </div>

      {/* Product creation/update audit data. */}
      <section className="min-w-0 rounded-2xl border border-neutral-border bg-white p-4 sm:p-6 lg:col-span-2">
        <h3 className="mb-4 font-serif text-xl font-semibold">Lịch sử thay đổi</h3>
        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          <div className="border-t border-neutral-border pt-3"><dt className="text-xs text-text-muted">Ngày tạo</dt><dd className="mt-1 break-all">{formatDate(product.createdAt)} · {product.createdAt}</dd></div>
          <div className="border-t border-neutral-border pt-3"><dt className="text-xs text-text-muted">Người tạo · ID người dùng</dt><dd className="mt-1 break-all">{product.createdBy || "Hệ thống / không có"}</dd></div>
          <div className="border-t border-neutral-border pt-3"><dt className="text-xs text-text-muted">Ngày cập nhật</dt><dd className="mt-1 break-all">{formatDate(product.updatedAt)} · {product.updatedAt}</dd></div>
          <div className="border-t border-neutral-border pt-3"><dt className="text-xs text-text-muted">Người cập nhật · ID người dùng</dt><dd className="mt-1 break-all">{product.updatedBy || "Hệ thống / không có"}</dd></div>
        </dl>
      </section>
    </div>
  </div>;
}

/**
 * Products workspace controller and renderer.
 * It switches between list, create, edit, and detail views; lifecycle confirmation dialogs also
 * live here. Form fields live in `ProductCreateForm.tsx`, and state/API actions live in
 * `hooks/use-product-manager.ts`.
 */
export default function ProductManager() {
  const {
    view,
    search,
    setSearch,
    filter,
    selectFilter,
    counts,
    loading,
    error,
    reloadProducts,
    filteredProducts,
    visibleProducts,
    page,
    pageCount,
    previousPage,
    nextPage,
    startCreating,
    stopCreating,
    openCreatedProduct,
    editingProduct,
    editRevision,
    openEdit,
    closeEdit,
    finishEdit,
    selectedId,
    selectedProduct,
    detailLoading,
    detailError,
    openProduct,
    closeProduct,
    busyId,
    isBusy,
    actionError,
    activationIssues,
    refreshRequiredId,
    refreshLifecycleProduct,
    activationProduct,
    deactivationProduct,
    draftProduct,
    openLifecycle,
    openReturnToDraft,
    askToDeactivate,
    closeActivation,
    closeDeactivation,
    closeDraft,
    confirmActivation,
    confirmDeactivation,
    confirmReturnToDraft,
    uploadImages,
    moveImage,
    removeImage,
  } = useProductManager();

  // Confirmation modal used when activating a Draft or reactivating a hidden Product.
  const activationDialog = activationProduct && <ModalDialog
    title={activationProduct.status === "DEACTIVATED" ? "Mở bán lại sản phẩm" : "Mở bán sản phẩm"}
    onClose={() => { if (busyId !== activationProduct.id) closeActivation(); }}
    footer={<div className="flex flex-wrap justify-end gap-2">
      <Button type="button" disabled={busyId === activationProduct.id} onClick={closeActivation} className="rounded-lg border border-neutral-border px-4 py-2 text-sm font-semibold">Hủy</Button>
      {refreshRequiredId === activationProduct.id
        ? <Button type="button" disabled={busyId === activationProduct.id} onClick={() => void refreshLifecycleProduct(activationProduct.id)} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">Tải lại sản phẩm</Button>
        : <Button type="button" disabled={busyId === activationProduct.id} onClick={() => void confirmActivation()} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">{busyId === activationProduct.id ? "Đang lưu…" : activationProduct.status === "DEACTIVATED" ? "Xác nhận mở bán lại" : "Xác nhận mở bán"}</Button>}
    </div>}
  >
    <p className="text-sm text-text-secondary">Chuyển <strong>{activationProduct.name}</strong> sang trạng thái Đang bán? Sản phẩm sẽ được phép bán. Không cần có tồn kho để mở bán.</p>
    <p className="mt-4 text-sm font-semibold text-text-primary">Trước khi mở bán, sản phẩm cần có:</p>
    <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-text-secondary">
      {Object.values(ACTIVATION_REQUIREMENTS).map((requirement) => <li key={requirement}>{requirement}</li>)}
    </ul>
    {actionError && <p role="alert" className="mt-4 rounded-xl border border-primary/30 bg-white p-3 text-sm text-primary-deep">{actionError}</p>}
    {activationIssues.length > 0 && <div role="alert" className="mt-4 rounded-xl border border-primary/30 bg-white p-3 text-sm text-primary-deep">
      <p className="font-semibold">Vui lòng kiểm tra các yêu cầu sau:</p>
      <ul className="mt-1 list-inside list-disc">{activationIssues.map((issue) => <li key={issue}>{issue}</li>)}</ul>
    </div>}
    {refreshRequiredId === activationProduct.id && <p role="alert" className="mt-4 text-sm text-primary-deep">Sản phẩm này đã được thay đổi ở nơi khác. Chưa thể mở bán cho đến khi tải lại dữ liệu mới nhất.</p>}
  </ModalDialog>;

  // Confirmation modal used when hiding an Active Product.
  const deactivationDialog = deactivationProduct && <ModalDialog
    title="Ngừng bán sản phẩm"
    onClose={() => { if (busyId !== deactivationProduct.id) closeDeactivation(); }}
    footer={<div className="flex justify-end gap-2">
      <Button type="button" disabled={busyId === deactivationProduct.id} onClick={closeDeactivation} className="rounded-lg border border-neutral-border px-4 py-2 text-sm font-semibold">Hủy</Button>
      <Button type="button" disabled={busyId === deactivationProduct.id} onClick={() => void confirmDeactivation()} className="rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800">{busyId === deactivationProduct.id ? "Đang lưu…" : "Xác nhận ngừng bán"}</Button>
    </div>}
  >
    <p className="text-sm text-text-secondary"><strong>{deactivationProduct.name}</strong> sẽ bị ẩn và không thể đặt mua mới. Các dữ liệu hiện có vẫn được giữ lại.</p>
    {actionError && <p role="alert" className="mt-4 rounded-xl border border-primary/30 bg-white p-3 text-sm text-primary-deep">{actionError}</p>}
  </ModalDialog>;

  // Confirmation modal used when moving a Deactivated Product back to Draft.
  const draftDialog = draftProduct && <ModalDialog
    title="Chuyển sản phẩm về bản nháp"
    onClose={() => { if (busyId !== draftProduct.id) closeDraft(); }}
    footer={<div className="flex justify-end gap-2">
      <Button type="button" disabled={busyId === draftProduct.id} onClick={closeDraft} className="rounded-lg border border-neutral-border px-4 py-2 text-sm font-semibold">Hủy</Button>
      <Button type="button" disabled={busyId === draftProduct.id} onClick={() => void confirmReturnToDraft()} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">{busyId === draftProduct.id ? "Đang lưu…" : "Chuyển về bản nháp"}</Button>
    </div>}
  >
    <p className="text-sm text-text-secondary"><strong>{draftProduct.name}</strong> vẫn bị ẩn và trở thành bản nháp để chỉnh sửa lại.</p>
    {actionError && <p role="alert" className="mt-4 rounded-xl border border-primary/30 bg-white p-3 text-sm text-primary-deep">{actionError}</p>}
  </ModalDialog>;

  // Edit screen. The form restarts on `editRevision`, not on every version: an image change made
  // here bumps the version but must not throw away unsaved field edits.
  if (view === "edit" && editingProduct) return <div className="space-y-4">
    <ProductCreateForm
      key={`${editingProduct.id}:${editRevision}`}
      product={editingProduct}
      onCancel={closeEdit}
      onCreated={openCreatedProduct}
      onSaved={finishEdit}
      onDeactivate={askToDeactivate}
      onReturnToDraft={openReturnToDraft}
      imageManager={<>
        {actionError && <p role="alert" className="rounded-xl border border-primary/30 bg-white px-4 py-3 text-sm text-primary-deep">{actionError}</p>}
        <ProductImageManager
          product={editingProduct}
          busy={isBusy(editingProduct)}
          onUpload={(files) => { void uploadImages(files); }}
          onMove={(index, direction) => { void moveImage(index, direction); }}
          onRemove={(imageId) => { void removeImage(imageId); }}
        />
      </>}
    />
    {deactivationDialog}
    {draftDialog}
  </div>;

  // Detail screen.
  if (view === "detail" && selectedId) return <div className="w-full min-w-0 max-w-full space-y-4">
    {actionError && <p role="alert" className="rounded-xl border border-primary/30 bg-white px-4 py-3 text-sm text-primary-deep">{actionError}</p>}
    {refreshRequiredId === selectedId && !activationProduct && <Button type="button" disabled={busyId === selectedId} onClick={() => void refreshLifecycleProduct(selectedId)} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">Tải lại sản phẩm</Button>}
    <ProductDetail
      key={selectedId}
      product={selectedProduct}
      loading={detailLoading}
      error={detailError}
      busy={isBusy(selectedProduct)}
      onBack={closeProduct}
      onEdit={() => { if (selectedProduct) openEdit(selectedProduct); }}
      onLifecycle={() => { if (selectedProduct) openLifecycle(selectedProduct); }}
      onReturnToDraft={() => { if (selectedProduct) openReturnToDraft(selectedProduct); }}
      onUpload={(files) => { void uploadImages(files); }}
      onMove={(index, direction) => { void moveImage(index, direction); }}
      onRemove={(imageId) => { void removeImage(imageId); }}
    />
    {activationDialog}
    {deactivationDialog}
    {draftDialog}
  </div>;

  // Create screen.
  if (view === "create") return <ProductCreateForm onCancel={stopCreating} onCreated={openCreatedProduct} />;

  const filters: Array<{ value: StatusFilter; label: string }> = [
    { value: "ALL", label: "Tất cả sản phẩm" },
    { value: "ACTIVE", label: PRODUCT_STATUS_LABELS.ACTIVE },
    { value: "DRAFT", label: PRODUCT_STATUS_LABELS.DRAFT },
    { value: "DEACTIVATED", label: PRODUCT_STATUS_LABELS.DEACTIVATED },
  ];

  return <div className="w-full min-w-0 max-w-full space-y-5">
    {/* Create Product action; the workspace title comes from the shared Admin header. */}
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-text-muted">Tạo bản nháp trước, sau đó hoàn thiện thông tin và mở bán khi đã sẵn sàng.</p>
      <Button type="button" onClick={startCreating} className="min-h-11 w-full shrink-0 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-hover sm:w-auto">+ Thêm sản phẩm</Button>
    </div>

    {/* Product status tabs and name search. */}
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <div role="tablist" aria-label="Lọc sản phẩm theo trạng thái" className="no-scrollbar flex min-w-0 gap-2 overflow-x-auto pb-1 lg:shrink-0">
        {filters.map((item) => <button key={item.value} type="button" role="tab" aria-selected={filter === item.value} onClick={() => selectFilter(item.value)} className={`shrink-0 rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors ${filter === item.value ? "border-primary bg-primary text-white" : "border-neutral-border bg-white text-text-secondary hover:border-primary"}`}>
          {item.label}<span className={`ml-1.5 text-xs ${filter === item.value ? "text-white/80" : "text-text-muted"}`}>{counts[item.value]}</span>
        </button>)}
      </div>

      <label className="relative block w-full lg:min-w-[240px] lg:flex-1">
        <span className="sr-only">Tìm sản phẩm</span>
        <span aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">⌕</span>
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nhập tên sản phẩm" className="min-h-11 w-full rounded-xl border border-neutral-border bg-neutral-canvas pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:bg-white focus:outline-none" />
      </label>
    </div>

    {actionError && <p role="alert" className="rounded-xl border border-primary/30 bg-white px-4 py-3 text-sm text-primary-deep">{actionError}</p>}
    {refreshRequiredId && !activationProduct && <Button type="button" disabled={busyId === refreshRequiredId} onClick={() => void refreshLifecycleProduct(refreshRequiredId)} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">Tải lại sản phẩm</Button>}
    {error && <div className="rounded-2xl border border-neutral-border bg-white px-5 py-8 text-center"><p role="alert" className="text-sm text-primary-deep">{error}</p><Button type="button" onClick={reloadProducts} className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">Thử lại</Button></div>}
    {!error && loading && <div className="rounded-2xl border border-neutral-border bg-white py-12 text-center text-sm text-text-muted">Đang tải sản phẩm…</div>}
    {!error && !loading && visibleProducts.length === 0 && <div className="rounded-2xl border border-neutral-border bg-white px-5 py-12 text-center text-sm text-text-muted">{search ? "Không có sản phẩm nào khớp với tìm kiếm." : "Chưa có sản phẩm nào ở trạng thái này."}</div>}

    {/* Product results: compact cards below xl, table at xl and above. */}
    {!error && !loading && visibleProducts.length > 0 && <>
      <div className="space-y-2.5 xl:hidden">
        {visibleProducts.map((product) => <article key={product.id} className="rounded-2xl border border-neutral-border bg-white px-3.5 py-3 shadow-sm">
          <div className="flex min-w-0 items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <button type="button" onClick={() => openProduct(product.id)} className="min-w-0 truncate text-left font-semibold text-text-primary hover:text-primary-deep">{product.name}</button>
              <span className="shrink-0 rounded-full bg-neutral-raised px-2 py-1 text-[11px] font-semibold text-text-secondary">{productTypeLabel(product.type)}</span>
            </div>
            <StatusBadge status={product.status} />
          </div>
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5 border-t border-neutral-border pt-2.5">
            <div className="min-w-0 flex-1"><span className="block text-[10px] font-semibold uppercase tracking-wide text-text-muted">Giá bán (gốc)</span><strong className="block truncate text-base text-text-primary">{formatMoney(product.basePrice)}</strong></div>
            <div className="ml-auto flex shrink-0 items-center gap-1.5"><EditButton product={product} onClick={() => openEdit(product)} /><LifecycleButton product={product} busy={isBusy(product)} onClick={() => openLifecycle(product)} compact /></div>
          </div>
        </article>)}
      </div>

      <div className="hidden overflow-hidden rounded-2xl border border-neutral-border bg-white xl:block">
        <div className="grid grid-cols-[minmax(200px,1.5fr)_110px_130px_140px_190px] gap-2 border-b border-neutral-border bg-neutral-surface px-5 py-3 text-xs font-bold uppercase tracking-wide text-text-muted">
          <span>Sản phẩm</span><span className="text-center">Trạng thái</span><span>Giá bán (gốc)</span><span>Cập nhật lần cuối</span><span className="text-center">Thao tác</span>
        </div>
        {visibleProducts.map((product) => <article key={product.id} className="grid grid-cols-[minmax(200px,1.5fr)_110px_130px_140px_190px] items-center gap-2 border-b border-neutral-border px-5 py-4 last:border-b-0 hover:bg-neutral-canvas/60">
          <div className="min-w-0">
            <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-1.5">
              <div className="flex min-w-0 flex-wrap items-center gap-2"><button type="button" onClick={() => openProduct(product.id)} className="truncate text-left font-semibold text-text-primary hover:text-primary-deep">{product.name}</button><span className="shrink-0 rounded-full bg-neutral-raised px-2 py-0.5 text-[10px] font-semibold text-text-secondary">{productTypeLabel(product.type)}</span></div>
              <span className="shrink-0 text-xs text-text-muted">{productSetupSummary(product)}</span>
            </div>
          </div>
          <div className="flex justify-center"><StatusBadge status={product.status} /></div>
          <div><strong className="text-base text-text-primary">{formatMoney(product.basePrice)}</strong><span className="mt-0.5 block text-[10px] text-text-muted">Chưa trừ giảm giá</span></div>
          <div className="text-xs text-text-secondary">{formatDate(product.updatedAt)}<span className="mt-1 block text-[10px] text-text-muted">bởi · {shortId(product.updatedBy)}</span></div>
          <div className="flex items-center justify-center gap-2"><EditButton product={product} onClick={() => openEdit(product)} /><LifecycleButton product={product} busy={isBusy(product)} onClick={() => openLifecycle(product)} compact /></div>
        </article>)}
      </div>

      {pageCount > 1 && <div className="flex items-center justify-between border-t border-neutral-border pt-4 text-sm text-text-muted">
        <span>{filteredProducts.length} sản phẩm · trang {page + 1} / {pageCount}</span>
        <div className="flex gap-2"><Button type="button" disabled={page === 0} onClick={previousPage} className="rounded-lg border border-neutral-border bg-white px-3 py-2 font-semibold text-text-secondary">Trước</Button><Button type="button" disabled={page + 1 >= pageCount} onClick={nextPage} className="rounded-lg border border-neutral-border bg-white px-3 py-2 font-semibold text-text-secondary">Sau</Button></div>
      </div>}
    </>}
    {activationDialog}
    {deactivationDialog}
    {draftDialog}
  </div>;
}
