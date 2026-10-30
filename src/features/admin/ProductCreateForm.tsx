"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import Button from "@/components/ui/Button";
import FieldMessages from "@/features/admin/FieldMessages";
import { takeFiles } from "@/features/admin/file-input";
import { useProductForm, type ProductFormProps } from "@/features/admin/hooks/use-product-form";
import { MATERIAL_TYPE_LABELS, MATERIAL_UNIT_LABELS } from "@/features/admin/material-labels";
import { IMAGE_ACCEPT, MAX_PRODUCT_IMAGES, type ManagedProduct, type ManagedProductType } from "@/lib/services/managed-products";
import type { MaterialUnit } from "@/lib/services/materials";

const unitLabel = (unit: MaterialUnit) => MATERIAL_UNIT_LABELS[unit].toLowerCase();

/** Field keys the backend reports, shown with their Vietnamese name in the error summary. */
const FIELD_NAMES: Record<string, string> = {
  name: "Tên sản phẩm",
  type: "Loại sản phẩm",
  description: "Mô tả",
  basePrice: "Giá bán gốc",
  categoryIds: "Danh mục",
  recipe: "Công thức",
  images: "Ảnh",
};

const fieldName = (field: string) => FIELD_NAMES[field.split(/[.[\]]/)[0]] ?? field;

/**
 * Product create/edit form UI.
 * Sections are: page header/actions → basic fields → description/price → categories → images
 * (create: picker uploaded after saving; edit: `imageManager`, saved at once) → recipe builder →
 * save/cancel footer. Form state lives in `use-product-form.ts`.
 */
export default function ProductCreateForm({
  onDeactivate,
  onReturnToDraft,
  imageManager,
  ...props
}: ProductFormProps & {
  onDeactivate?: (product: ManagedProduct) => void;
  onReturnToDraft?: (product: ManagedProduct) => void;
  /** Edit only: the saved product's image controls, shown in place of the create-time picker. */
  imageManager?: ReactNode;
}) {
  const { product } = props;
  const {
    editing,
    isActive,
    name,
    setName,
    type,
    setType,
    description,
    setDescription,
    basePrice,
    setBasePrice,
    categories,
    categoriesLoading,
    categoriesError,
    retryCategories,
    categoryIds,
    toggleCategory,
    recipe,
    selectedMaterialIds,
    updateRecipeRow,
    removeRecipeRow,
    materialSearch,
    setMaterialSearch,
    materials,
    materialsLoading,
    materialsError,
    retryMaterialSearch,
    addMaterial,
    pendingImages,
    imageError,
    chooseImages,
    removeImage,
    moveImage,
    createdProduct,
    saving,
    error,
    fieldErrors,
    cancel: cancelCreation,
    submit,
  } = useProductForm(props);

  return <section className="w-full min-w-0 max-w-full rounded-2xl border border-neutral-border bg-white shadow-sm">
    {/* Form title, explanation, lifecycle shortcuts, and top Cancel action. */}
    <header className="flex flex-col gap-3 border-b border-neutral-border px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-7">
      <div>
        <h2 className="font-serif text-2xl font-semibold text-text-primary">{editing ? "Chỉnh sửa sản phẩm" : "Tạo sản phẩm"}</h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-text-secondary">
          {editing
            ? isActive
              ? "Sản phẩm đang bán phải luôn đầy đủ thông tin. Hãy ngừng bán sản phẩm trước khi đổi loại hoặc bỏ bớt thông tin bắt buộc."
              : "Sản phẩm bản nháp hoặc đã ngừng bán có thể lưu khi chưa đầy đủ và hoàn thiện trước khi mở bán."
            : "Sản phẩm sẽ được lưu dưới dạng bản nháp. Nhân viên cần hoàn thiện thông tin bắt buộc và mở bán riêng trước khi khách hàng có thể thấy sản phẩm."}
        </p>
      </div>
      <div className="flex flex-wrap gap-2 self-start">
        {product?.status === "ACTIVE" && onDeactivate && <Button type="button" onClick={() => onDeactivate(product)} disabled={saving} className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50">Ngừng bán</Button>}
        {product?.status === "DEACTIVATED" && onReturnToDraft && <Button type="button" onClick={() => onReturnToDraft(product)} disabled={saving} className="rounded-lg border border-neutral-border bg-white px-4 py-2 text-sm font-semibold text-text-secondary hover:border-primary">Chuyển về bản nháp</Button>}
        <Button type="button" onClick={cancelCreation} disabled={saving} className="rounded-lg border border-neutral-border bg-white px-4 py-2 text-sm font-semibold text-text-secondary hover:border-primary">{createdProduct ? "Mở sản phẩm đã tạo" : "Hủy"}</Button>
      </div>
    </header>

    <form onSubmit={(event) => void submit(event)} className="min-w-0 space-y-6 px-4 py-6 sm:px-7">
      <p className="text-xs text-text-muted"><span className="font-bold text-primary-deep" aria-hidden="true">*</span> Trường bắt buộc</p>
      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        <p>{error}</p>
        {Object.entries(fieldErrors).length > 0 && <ul className="mt-2 list-inside list-disc space-y-1">
          {Object.entries(fieldErrors).flatMap(([field, messages]) => messages.map((message) => <li key={field + message}><strong>{fieldName(field)}:</strong> {message}</li>))}
        </ul>}
      </div>}

      {/* Product name and type. */}
      <section className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-text-secondary">
          <span>Tên sản phẩm <span className="text-primary-deep" aria-hidden="true">*</span></span>
          <input
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoFocus
            aria-invalid={Boolean(fieldErrors.name)}
            className="min-h-11 w-full min-w-0 rounded-xl border border-neutral-border bg-white px-3 py-2 text-sm font-normal text-text-primary outline-none focus:border-primary"
          />
          <span className={`text-xs font-normal ${name.trim().length > 255 ? "text-red-700" : "text-text-muted"}`}>Bắt buộc · {name.trim().length}/255 ký tự (không tính khoảng trắng đầu/cuối)</span>
          <FieldMessages messages={fieldErrors.name} />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-semibold text-text-secondary">
          <span>Loại sản phẩm <span className="text-primary-deep" aria-hidden="true">*</span></span>
          <select
            required
            disabled={isActive}
            value={type}
            onChange={(event) => setType(event.target.value as ManagedProductType | "")}
            className="min-h-11 rounded-xl border border-neutral-border bg-white px-3 py-2 text-sm font-normal text-text-primary outline-none focus:border-primary disabled:cursor-not-allowed disabled:bg-neutral-canvas disabled:text-text-muted"
          >
            <option value="">Chọn loại</option>
            <option value="PRE_ORDER">Đặt trước</option>
            <option value="PRE_MADE">Làm sẵn</option>
          </select>
          <span className="text-xs font-normal text-text-muted">{isActive ? "Ngừng bán trước khi đổi loại" : editing ? "Bắt buộc · có thể sửa khi sản phẩm đang ẩn" : "Bắt buộc · sản phẩm vẫn được tạo dưới dạng bản nháp"}</span>
          <FieldMessages messages={fieldErrors.type} />
        </label>
      </section>

      {/* Product description and base selling price. */}
      <section className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-text-secondary">
          <span>Mô tả {isActive && <span className="text-primary-deep" aria-hidden="true">*</span>}</span>
          <textarea
            rows={4}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            aria-invalid={Boolean(fieldErrors.description)}
            className="w-full min-w-0 resize-y rounded-xl border border-neutral-border bg-white px-3 py-2 text-sm font-normal text-text-primary outline-none focus:border-primary"
            placeholder="Mô tả sản phẩm (không bắt buộc)"
          />
          <span className={`text-xs font-normal ${description.trim().length > 5000 ? "text-red-700" : "text-text-muted"}`}>{isActive ? "Bắt buộc khi đang bán" : "Không bắt buộc"} · {description.trim().length}/5.000 ký tự</span>
          <FieldMessages messages={fieldErrors.description} />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-semibold text-text-secondary">
          <span>Giá bán gốc (VND) {isActive && <span className="text-primary-deep" aria-hidden="true">*</span>}</span>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={basePrice}
            onChange={(event) => setBasePrice(event.target.value)}
            aria-invalid={Boolean(fieldErrors.basePrice)}
            className="min-h-11 rounded-xl border border-neutral-border bg-white px-3 py-2 text-sm font-normal text-text-primary outline-none focus:border-primary"
            placeholder="Có thể để trống"
          />
          <span className="text-xs font-normal text-text-muted">{isActive ? "Bắt buộc khi đang bán" : "Không bắt buộc"} · số VND nguyên dương</span>
          <FieldMessages messages={fieldErrors.basePrice} />
        </label>
      </section>

      {/* Category selector. */}
      <section className="space-y-3">
        <div>
          <h3 className="font-semibold text-text-primary">Danh mục <span className="font-normal text-text-muted">· {isActive ? "bắt buộc" : "không bắt buộc"}</span></h3>
          <p className="mt-1 text-xs text-text-muted">{isActive ? "Sản phẩm đang bán phải có ít nhất một danh mục." : "Sản phẩm đang ẩn có thể lưu khi chưa có danh mục. Cần ít nhất một danh mục trước khi mở bán."}</p>
        </div>
        {categoriesLoading ? <p className="text-sm text-text-muted">Đang tải danh mục…</p>
          : categories.length ? <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => <label key={category.id} className="flex min-h-11 items-center gap-3 rounded-xl border border-neutral-border px-3 py-2 text-sm text-text-secondary">
              <input type="checkbox" checked={categoryIds.includes(category.id)} onChange={() => toggleCategory(category.id)} className="size-4 accent-[var(--color-primary)]" />
              <span className="min-w-0 break-words">{category.name}</span>
            </label>)}
          </div> : <p className="text-sm text-text-muted">Chưa có danh mục nào. Bạn vẫn có thể tạo bản nháp khi chưa chọn danh mục.</p>}
        {categoriesError && <div className="flex flex-wrap items-center gap-2 text-xs text-amber-800">
          <span role="status">{categoriesError}</span>
          <Button type="button" onClick={retryCategories} disabled={categoriesLoading} className="font-semibold underline">Tải lại danh mục</Button>
        </div>}
        {fieldErrors.categoryIds?.map((message) => <p key={message} className="text-xs text-red-700">{message}</p>)}
      </section>

      {/* Editing: the saved images, changed at once (not on Save) through ProductImageManager. */}
      {editing && imageManager && <section aria-label="Ảnh sản phẩm" className="space-y-3">
        {imageManager}
        <p className="text-xs text-text-muted">Thay đổi ảnh được lưu ngay, không cần bấm “Lưu thay đổi”.</p>
      </section>}

      {/* Creating: initial image picker and preview/reorder controls, uploaded after the Draft is saved. */}
      {!editing && <section className="space-y-3">
        <div>
          <h3 className="font-semibold text-text-primary">Ảnh <span className="font-normal text-text-muted">· không bắt buộc</span></h3>
          <p className="mt-1 text-xs text-text-muted">Chọn tối đa năm ảnh JPG, PNG hoặc WebP. Mỗi ảnh tối đa 2 MB. Ảnh đầu tiên sẽ là ảnh chính.</p>
        </div>
        <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-neutral-border bg-neutral-canvas px-4 py-5 text-center hover:border-primary">
          <span className="text-sm font-semibold text-primary-deep">Chọn ảnh</span>
          <span className="mt-1 text-xs text-text-muted">Còn {MAX_PRODUCT_IMAGES - pendingImages.length} / {MAX_PRODUCT_IMAGES} chỗ trống</span>
          <input
            type="file"
            multiple
            accept={IMAGE_ACCEPT}
            onChange={(event) => chooseImages(takeFiles(event))}
            disabled={pendingImages.length >= MAX_PRODUCT_IMAGES || saving}
            className="sr-only"
          />
        </label>
        {imageError && <p role="alert" className="text-sm text-red-700">{imageError}</p>}
        {createdProduct && <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">Bản nháp đã được tạo. Hãy thử tải lên lại các ảnh còn lại, hoặc mở sản phẩm đã tạo.</p>}
        {pendingImages.length > 0 && <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {pendingImages.map((image, index) => <article key={image.id} className="overflow-hidden rounded-xl border border-neutral-border bg-white">
            <div className="relative aspect-[4/3] bg-neutral-raised">
              <Image src={image.previewUrl} alt={`Ảnh sản phẩm đã chọn ${index + 1}`} fill unoptimized className="object-cover" />
              {index === 0 && <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">Ảnh chính</span>}
            </div>
            <div className="space-y-2 p-2.5">
              <p className="truncate text-xs font-semibold text-text-primary" title={image.file.name}>{image.file.name}</p>
              <div className="flex items-center justify-between gap-1">
                <div className="flex gap-1">
                  <Button type="button" disabled={index === 0 || saving} onClick={() => moveImage(index, -1)} aria-label={`Đưa ${image.file.name} lên trước`} className="rounded-md border border-neutral-border px-2 py-1 text-xs disabled:opacity-40">←</Button>
                  <Button type="button" disabled={index === pendingImages.length - 1 || saving} onClick={() => moveImage(index, 1)} aria-label={`Đưa ${image.file.name} ra sau`} className="rounded-md border border-neutral-border px-2 py-1 text-xs disabled:opacity-40">→</Button>
                </div>
                <Button type="button" disabled={saving} onClick={() => removeImage(image.id)} className="px-1 py-1 text-xs font-semibold text-primary-deep">Xóa</Button>
              </div>
            </div>
          </article>)}
        </div>}
      </section>}

      {/* Recipe builder: selected materials, quantities, and Active-material search results. */}
      <section className="space-y-3">
        <div>
          <h3 className="font-semibold text-text-primary">Công thức <span className="font-normal text-text-muted">· {isActive ? "bắt buộc" : "không bắt buộc"}</span></h3>
          <p className="mt-1 text-xs text-text-muted">Tìm nguyên liệu đang hoạt động và chọn một kết quả để thêm vào sản phẩm.</p>
        </div>

        <div className="flex items-center justify-between gap-3">
          <h4 className="text-sm font-semibold text-text-primary">Nguyên liệu hiện tại</h4>
          <span className="text-xs text-text-muted">Đã chọn {recipe.length}</span>
        </div>
        {recipe.length === 0 ? <p className="rounded-xl border border-dashed border-neutral-border px-4 py-5 text-center text-sm text-text-muted">Chưa chọn nguyên liệu nào. Tìm bên dưới và chọn Thêm để bắt đầu công thức.</p>
          : <div className="space-y-3 rounded-xl border border-neutral-border bg-neutral-canvas p-3">
              {recipe.map((row, index) => {
                const allowsFraction = row.material.unitOfMeasure === "METRE";
                return <div key={row.id} className="grid gap-3 border-b border-neutral-border pb-3 last:border-b-0 last:pb-0 sm:grid-cols-[minmax(0,1fr)_minmax(140px,0.55fr)_auto] sm:items-end">
                  <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 self-center">
                    <p className="min-w-0 flex-1 truncate text-base font-semibold text-text-primary">{row.material.name}</p>
                    <span className="shrink-0 rounded-full bg-neutral-raised px-2 py-0.5 text-xs font-medium text-text-muted">{MATERIAL_TYPE_LABELS[row.material.type]} · {unitLabel(row.material.unitOfMeasure)}</span>
                    {fieldErrors["recipe[" + index + "].materialId"]?.map((message) => <span key={message} className="basis-full text-xs text-red-700">{message}</span>)}
                  </div>
                  <label className="flex flex-col gap-1.5 text-sm font-semibold text-text-secondary">
                    <span>Số lượng ({unitLabel(row.material.unitOfMeasure)}) <span className="text-primary-deep" aria-hidden="true">*</span></span>
                    <input
                      required
                      type="number"
                      min={allowsFraction ? "0.01" : "1"}
                      step={allowsFraction ? "0.01" : "1"}
                      value={row.quantityRequired}
                      onChange={(event) => updateRecipeRow(index, { quantityRequired: event.target.value })}
                      className="min-h-11 rounded-lg border border-neutral-border bg-white px-3 py-2 text-sm font-normal text-text-primary outline-none focus:border-primary"
                      placeholder={allowsFraction ? "VD: 1.5" : "VD: 1"}
                    />
                    <FieldMessages messages={fieldErrors["recipe[" + index + "].quantityRequired"]} />
                  </label>
                  <Button
                    type="button"
                    onClick={() => removeRecipeRow(index)}
                    aria-label={`Xóa ${row.material.name} khỏi công thức`}
                    className="min-h-11 rounded-lg px-3 text-sm font-semibold text-text-muted hover:bg-white hover:text-primary-deep"
                  >Xóa</Button>
                </div>;
              })}
            </div>}

        <label className="flex flex-col gap-1.5 text-sm font-semibold text-text-secondary">
          Tìm nguyên liệu đang hoạt động
          <input
            type="search"
            value={materialSearch}
            onChange={(event) => setMaterialSearch(event.target.value)}
            className="min-h-11 rounded-lg border border-neutral-border bg-white px-3 py-2 text-sm font-normal text-text-primary outline-none focus:border-primary"
            placeholder="Nhập tên nguyên liệu"
          />
          <span className="text-xs font-normal text-text-muted">Nhập tên để tìm. Hiển thị tối đa tám nguyên liệu đang hoạt động phù hợp.</span>
        </label>
        {!materialSearch.trim() && <p className="text-sm text-text-muted">Kết quả tìm kiếm sẽ hiện ở đây sau khi bạn nhập tên nguyên liệu.</p>}
        {materialsLoading && <p role="status" className="text-sm text-text-muted">Đang tìm nguyên liệu…</p>}
        {materialSearch.trim() && !materialsLoading && !materialsError && materials.length === 0 && <p className="text-sm text-text-muted">Không có nguyên liệu đang hoạt động nào khớp với tìm kiếm.</p>}
        {!materialsLoading && materials.length > 0 && <div className="max-h-56 overflow-y-auto rounded-xl border border-neutral-border bg-white" aria-label="Kết quả tìm nguyên liệu đang hoạt động">
          {materials.map((material) => {
            const selected = selectedMaterialIds.has(material.id);
            return <button
              key={material.id}
              type="button"
              disabled={selected}
              onClick={() => addMaterial(material)}
              className="flex min-h-12 w-full min-w-0 items-center justify-between gap-3 border-b border-neutral-border px-3 py-2 text-left last:border-b-0 hover:bg-neutral-canvas disabled:cursor-default disabled:bg-neutral-canvas"
            >
              <span className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1"><span className="min-w-0 max-w-full truncate text-base font-semibold text-text-primary">{material.name}</span><span className="shrink-0 rounded-full bg-neutral-raised px-2 py-0.5 text-xs font-medium text-text-muted">{MATERIAL_TYPE_LABELS[material.type]} · {unitLabel(material.unitOfMeasure)}</span></span>
              <span className={`shrink-0 text-xs font-semibold ${selected ? "text-text-muted" : "text-primary-deep"}`}>{selected ? "Đã thêm" : "Thêm"}</span>
            </button>;
          })}
        </div>}
        {materialsError && <div className="flex flex-wrap items-center gap-2 text-xs text-amber-800">
          <span role="status">{materialsError}</span>
          <Button type="button" onClick={retryMaterialSearch} disabled={materialsLoading} className="font-semibold underline">Tìm lại nguyên liệu</Button>
        </div>}

        {fieldErrors.recipe?.map((message) => <p key={message} className="text-xs text-red-700">{message}</p>)}
      </section>

      {/* Bottom form actions. */}
      <footer className="flex flex-col-reverse gap-3 border-t border-neutral-border pt-5 sm:flex-row sm:justify-end">
        <Button type="button" onClick={cancelCreation} disabled={saving} className="rounded-xl border border-neutral-border bg-white px-5 py-2.5 text-sm font-semibold text-text-secondary">{createdProduct ? "Mở sản phẩm đã tạo" : "Hủy"}</Button>
        <Button type="submit" disabled={saving} className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover">{saving ? (editing ? "Đang lưu…" : createdProduct ? "Đang tải ảnh lên…" : "Đang tạo…") : editing ? "Lưu thay đổi" : createdProduct ? "Tải ảnh lên lại" : "Tạo bản nháp"}</Button>
      </footer>
    </form>
  </section>;
}
