"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Button from "@/components/ui/Button";
import ModalDialog from "@/components/ui/ModalDialog";
import { RequestError } from "@/lib/api";
import ProductCreateForm from "@/features/admin/ProductCreateForm";
import {
  activateManagedProduct,
  deactivateManagedProduct,
  getManagedProduct,
  listManagedProducts,
  removeManagedProductImage,
  reorderManagedProductImages,
  returnManagedProductToDraft,
  uploadManagedProductImage,
  type ManagedProduct,
  type ManagedProductStatus,
} from "@/lib/services/admin";

type StatusFilter = "ALL" | ManagedProductStatus;
const PAGE_SIZE = 10;
const MAX_IMAGES = 5;
const MAX_IMAGE_BYTES = 2_000_000;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const activationRequirements: Record<string, string> = {
  name: "A product name (up to 255 characters)",
  description: "A description (up to 5,000 characters)",
  basePrice: "A positive, whole-VND base price",
  categoryIds: "At least one category",
  recipe: "At least one valid recipe line",
  images: "At least one uploaded image",
};

function activationFieldLabels(error: RequestError) {
  if (error.errorCode !== "VALIDATION_FAILED") return [];
  const labels = (error.details?.fields ?? []).map(({ field, rule }) => {
    const key = field.split(/[.[\]]/)[0];
    return activationRequirements[key] ?? (rule === "ActivationRequirement" ? "A valid product requirement" : "Review the product information");
  });
  return [...new Set(labels)];
}

const statusLabels: Record<ManagedProductStatus, string> = {
  ACTIVE: "Active",
  DRAFT: "Draft",
  DEACTIVATED: "Deactivated",
};

const statusStyles: Record<ManagedProductStatus, string> = {
  ACTIVE: "bg-accent-sage-light/60 text-[#465d40]",
  DRAFT: "bg-[#F5E9CF] text-[#805119]",
  DEACTIVATED: "bg-[#F0DEDA] text-[#8A4640]",
};

function formatMoney(value: number | null) {
  return value == null
    ? "Not set"
    : new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(value) + " ₫";
}

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  }).format(date);
}

function shortId(value: string | null) {
  return value ? `${value.slice(0, 8)}…${value.slice(-4)}` : "—";
}

function productTypeLabel(value: ManagedProduct["type"]) {
  return value === "PRE_MADE" ? "Pre-made" : "Pre-order";
}

function productSetupSummary(product: ManagedProduct) {
  const materialLabel = product.recipe.length === 1 ? "material" : "materials";
  const imageLabel = product.images.length === 1 ? "image" : "images";
  return `Recipe: ${product.recipe.length} ${materialLabel} · Images: ${product.images.length} ${imageLabel}`;
}

function errorMessage(error: unknown, action: string) {
  if (!(error instanceof RequestError)) return "Could not connect to FlowerPlus. Try again.";
  if (error.status === 404) return "This Product action is not available in the backend yet.";
  if (error.errorCode === "CONCURRENT_MODIFICATION") return "This product changed elsewhere. Its current record must load before trying again.";
  if (error.errorCode === "PRODUCT_INVALID_STATE") return "The product status changed. Refresh and review the current status.";
  if (error.errorCode === "PRODUCT_IMAGE_INVALID") return "Choose a valid JPG, PNG, or WebP image.";
  if (error.errorCode === "PRODUCT_IMAGE_TOO_LARGE") return "Each image must be 2 MB or smaller.";
  if (error.errorCode === "PRODUCT_IMAGE_LIMIT_REACHED") return "A Product can have at most five images.";
  if (error.errorCode === "PRODUCT_IMAGE_REQUIRED") return "An Active Product must keep at least one image.";
  if (error.errorCode === "VALIDATION_FAILED") {
    const labels = activationFieldLabels(error);
    return labels.length ? `Review: ${labels.join("; ")}.` : "Review the product requirements and try again.";
  }
  if (error.status === 403) return "Your account does not have permission to manage products.";
  return `${action} failed. Please try again.`;
}

function StatusBadge({ status }: { status: ManagedProductStatus }) {
  return <span className={`inline-flex min-h-7 items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${statusStyles[status]}`}>
    {statusLabels[status]}<span aria-hidden="true" className="inline-block size-1.5 shrink-0 rounded-full bg-current" />
  </span>;
}

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
  const action = product.status === "ACTIVE" ? "Deactivate" : product.status === "DEACTIVATED" ? "Reactivate" : "Activate";
  const active = product.status === "ACTIVE";
  return <Button
    type="button"
    disabled={busy}
    onClick={onClick}
    aria-label={`${action} ${product.name}`}
    className={`shrink-0 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed ${active ? "border-red-300 bg-white text-red-700 hover:bg-red-50" : "border-primary bg-primary text-white hover:bg-primary-hover"} ${compact ? "min-w-[82px]" : "min-w-[112px]"}`}
  >{busy ? "Saving…" : action}</Button>;
}

function EditButton({ product, onClick }: { product: ManagedProduct; onClick: () => void }) {
  return <Button
    type="button"
    onClick={onClick}
    aria-label={`Edit ${product.name}`}
    className="shrink-0 rounded-xl border border-neutral-border bg-white px-3 py-2 text-sm font-semibold text-text-secondary hover:border-primary hover:text-primary-deep"
  >Edit</Button>;
}

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
  onReorder,
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
  onReorder: (imageIds: string[]) => void;
  onRemove: (imageId: string) => void;
}) {
  const [imageIndex, setImageIndex] = useState(0);

  if (loading) return <div className="w-full min-w-0 rounded-2xl border border-neutral-border bg-white p-8 text-center text-sm text-text-muted">Loading product details…</div>;
  if (error || !product) return <div className="w-full min-w-0 rounded-2xl border border-neutral-border bg-white p-6">
    <Button type="button" onClick={onBack} className="mb-5 text-sm font-semibold text-primary-deep">← Back to Products</Button>
    <p role="alert" className="text-sm text-primary-deep">{error || "Product not found."}</p>
  </div>;

  const images = [...product.images].sort((left, right) => left.displayOrder - right.displayOrder);
  const visibleImageIndex = Math.max(0, Math.min(imageIndex, images.length - 1));
  const selectedImage = images[visibleImageIndex];

  return <div className="w-full min-w-0 max-w-full space-y-5">
    <div className="flex flex-col gap-4 border-b border-neutral-border pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <Button type="button" onClick={onBack} className="mb-3 text-sm font-semibold text-text-secondary hover:text-primary-deep">← Back to Products</Button>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="break-words font-serif text-3xl font-semibold text-text-primary">{product.name}</h2>
          <span className="rounded-full border border-neutral-border bg-neutral-raised px-3 py-1 text-xs font-semibold text-text-secondary">{productTypeLabel(product.type)}</span>
          <StatusBadge status={product.status} />
        </div>
      </div>
      <div className="flex flex-wrap justify-end gap-2">
        <EditButton product={product} onClick={onEdit} />
        <LifecycleButton product={product} busy={busy} onClick={onLifecycle} />
        {product.status === "DEACTIVATED" && <Button type="button" disabled={busy} onClick={onReturnToDraft} className="rounded-xl border border-neutral-border bg-white px-3 py-2 text-sm font-semibold text-text-secondary hover:border-primary">Return to Draft</Button>}
      </div>
    </div>

    <div className="grid min-w-0 items-start gap-4 lg:grid-cols-2">
      <section aria-label="Product image gallery" className="min-w-0 overflow-hidden rounded-2xl border border-neutral-border bg-neutral-surface">
        <div className="relative aspect-[4/3] bg-neutral-raised">
          {selectedImage ? <Image
            key={selectedImage.id}
            src={selectedImage.contentUrl}
            alt={`${product.name} image ${visibleImageIndex + 1}`}
            fill
            unoptimized
            className="object-contain"
            sizes="(max-width: 1024px) 100vw, 50vw"
          /> : <div className="absolute inset-0 grid place-items-center px-5 text-center text-sm text-text-muted">No product images have been added.</div>}
          {selectedImage && visibleImageIndex === 0 && <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">Main image</span>}
          {images.length > 1 && <>
            <Button type="button" aria-label="Previous image" onClick={() => setImageIndex((visibleImageIndex + images.length - 1) % images.length)} className="absolute left-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-neutral-border bg-white/90 text-lg shadow-sm">‹</Button>
            <Button type="button" aria-label="Next image" onClick={() => setImageIndex((visibleImageIndex + 1) % images.length)} className="absolute right-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-neutral-border bg-white/90 text-lg shadow-sm">›</Button>
          </>}
        </div>
        <div className="flex items-center justify-between gap-3 px-4 py-3 text-xs text-text-muted">
          <span>{selectedImage ? `Image ${visibleImageIndex + 1} of ${images.length}` : "Product gallery"}</span>
          {images.length > 1 && <div className="flex gap-1.5" aria-label="Choose image">
            {images.map((image, index) => <button key={image.id} type="button" aria-label={`Show image ${index + 1}`} aria-pressed={index === visibleImageIndex} onClick={() => setImageIndex(index)} className={`size-2.5 rounded-full ${index === visibleImageIndex ? "bg-primary" : "bg-neutral-border"}`} />)}
          </div>}
        </div>
        <div className="space-y-3 border-t border-neutral-border bg-white p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Manage images</h3>
              <p className="mt-1 text-xs text-text-muted">JPG, PNG or WebP · up to 2 MB each · {MAX_IMAGES - images.length} slots available</p>
            </div>
            <label className={`inline-flex min-h-10 items-center rounded-lg border border-primary px-3 py-2 text-xs font-semibold text-primary-deep ${busy || images.length >= MAX_IMAGES ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-neutral-canvas"}`}>
              Add images
              <input
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                disabled={busy || images.length >= MAX_IMAGES}
                onChange={(event) => {
                  const files = Array.from(event.target.files ?? []);
                  event.target.value = "";
                  if (files.length) onUpload(files);
                }}
                className="sr-only"
              />
            </label>
          </div>
          {images.length > 0 && <div className="grid gap-2 sm:grid-cols-2">
            {images.map((image, index) => <article key={image.id} className="flex min-w-0 items-center gap-2 rounded-xl border border-neutral-border bg-neutral-canvas p-2">
              <button type="button" onClick={() => setImageIndex(index)} className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-neutral-raised" aria-label={`Show image ${index + 1}`}>
                <Image src={image.contentUrl} alt="" fill unoptimized className="object-cover" sizes="56px" />
              </button>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-text-primary">{index === 0 ? "Main image" : `Image ${index + 1}`}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-1">
                  <Button
                    type="button"
                    disabled={busy || index === 0}
                    onClick={() => {
                      const ordered = images.map((item) => item.id);
                      [ordered[index - 1], ordered[index]] = [ordered[index], ordered[index - 1]];
                      onReorder(ordered);
                    }}
                    aria-label={`Move image ${index + 1} earlier`}
                    className="rounded-md border border-neutral-border bg-white px-2 py-1 text-xs disabled:opacity-40"
                  >←</Button>
                  <Button
                    type="button"
                    disabled={busy || index === images.length - 1}
                    onClick={() => {
                      const ordered = images.map((item) => item.id);
                      [ordered[index], ordered[index + 1]] = [ordered[index + 1], ordered[index]];
                      onReorder(ordered);
                    }}
                    aria-label={`Move image ${index + 1} later`}
                    className="rounded-md border border-neutral-border bg-white px-2 py-1 text-xs disabled:opacity-40"
                  >→</Button>
                  <Button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      if (window.confirm(`Remove image ${index + 1} from ${product.name}?`)) onRemove(image.id);
                    }}
                    className="ml-1 px-1 py-1 text-xs font-semibold text-primary-deep disabled:opacity-40"
                  >Remove</Button>
                </div>
              </div>
            </article>)}
          </div>}
        </div>
      </section>

      <div className="min-w-0 space-y-4">
        <section className="min-w-0 rounded-2xl border border-neutral-border bg-white p-4 sm:p-6">
          <h3 className="mb-4 font-serif text-xl font-semibold">Product information</h3>
          <dl className="grid grid-cols-[minmax(95px,0.7fr)_minmax(0,1.3fr)] gap-x-4 gap-y-3 text-sm">
            <dt className="text-text-muted">Selling price (base)</dt><dd className="min-w-0 break-words text-right"><strong className="text-lg text-primary-deep">{formatMoney(product.basePrice)}</strong><span className="mt-0.5 block text-xs text-text-muted">Before any scheduled sale discount</span></dd>
            <dt className="text-text-muted">Type</dt><dd className="min-w-0 break-words text-right">{productTypeLabel(product.type)}</dd>
            <dt className="text-text-muted">Description</dt><dd className="min-w-0 break-words text-right leading-relaxed">{product.description || "Not provided"}</dd>
            <dt className="text-text-muted">Version</dt><dd className="min-w-0 break-words text-right">{product.version}</dd>
          </dl>
        </section>

        <section className="min-w-0 rounded-2xl border border-neutral-border bg-white p-4 sm:p-6">
          <h3 className="mb-4 font-serif text-xl font-semibold">Recipe <span className="font-sans text-sm font-normal text-text-muted">· {product.recipe.length} materials</span></h3>
          {product.recipe.length ? <>
            <div className="space-y-2 sm:hidden">
              {product.recipe.map((line) => <article key={line.materialId} className="min-w-0 rounded-xl border border-neutral-border bg-neutral-canvas p-3">
                <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
                  <p className="min-w-0 flex-1 break-words font-semibold text-text-primary">{line.materialName}</p>
                  <strong className="shrink-0 text-sm text-primary-deep">{line.quantityRequired} {line.materialUnit.toLowerCase()}</strong>
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-text-muted">
                  <span>{line.materialType === "FLOWER" ? "Flower" : "Decoration"}</span><span aria-hidden="true">·</span><span>{line.materialStatus === "ACTIVE" ? "Active material" : "Deactivated material"}</span>
                </div>
              </article>)}
            </div>
            <div className="hidden overflow-x-auto sm:block"><table className="w-full min-w-[400px] text-left text-sm">
              <thead><tr className="border-b border-neutral-border text-xs text-text-muted"><th className="pb-2 font-medium">Material</th><th className="pb-2 font-medium">Type</th><th className="pb-2 text-right font-medium">Required</th></tr></thead>
              <tbody>{product.recipe.map((line) => <tr key={line.materialId} className="border-b border-neutral-border last:border-0">
                <td className="py-3 pr-3"><span className="font-semibold">{line.materialName}</span><span className="mt-0.5 block text-xs text-text-muted">{line.materialStatus === "ACTIVE" ? "Active material" : "Deactivated material"}</span></td>
                <td className="py-3 pr-3 text-text-secondary">{line.materialType === "FLOWER" ? "Flower" : "Decoration"}</td>
                <td className="py-3 text-right font-semibold">{line.quantityRequired} {line.materialUnit.toLowerCase()}</td>
              </tr>)}</tbody>
            </table></div>
          </> : <p className="text-sm text-text-muted">No recipe lines recorded.</p>}
        </section>
      </div>

      <section className="min-w-0 rounded-2xl border border-neutral-border bg-white p-4 sm:p-6 lg:col-span-2">
        <h3 className="mb-4 font-serif text-xl font-semibold">Audit</h3>
        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          <div className="border-t border-neutral-border pt-3"><dt className="text-xs text-text-muted">Created at</dt><dd className="mt-1 break-all">{formatDate(product.createdAt)} · {product.createdAt}</dd></div>
          <div className="border-t border-neutral-border pt-3"><dt className="text-xs text-text-muted">Created by · user ID</dt><dd className="mt-1 break-all">{product.createdBy || "System / unavailable"}</dd></div>
          <div className="border-t border-neutral-border pt-3"><dt className="text-xs text-text-muted">Updated at</dt><dd className="mt-1 break-all">{formatDate(product.updatedAt)} · {product.updatedAt}</dd></div>
          <div className="border-t border-neutral-border pt-3"><dt className="text-xs text-text-muted">Updated by · user ID</dt><dd className="mt-1 break-all">{product.updatedBy || "System / unavailable"}</dd></div>
        </dl>
      </section>
    </div>
  </div>;
}

export default function ProductManager() {
  const [products, setProducts] = useState<ManagedProduct[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("ALL");
  const [page, setPage] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ManagedProduct | null>(null);
  const [editingProduct, setEditingProduct] = useState<ManagedProduct | null>(null);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");
  const [detailError, setDetailError] = useState("");
  const [actionError, setActionError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [activationProduct, setActivationProduct] = useState<ManagedProduct | null>(null);
  const [deactivationProduct, setDeactivationProduct] = useState<ManagedProduct | null>(null);
  const [draftProduct, setDraftProduct] = useState<ManagedProduct | null>(null);
  const [activationIssues, setActivationIssues] = useState<string[]>([]);
  const [refreshRequiredId, setRefreshRequiredId] = useState<string | null>(null);
  const productRequest = useRef(0);

  const refreshProducts = useCallback(async (query: string) => {
    const requestId = ++productRequest.current;
    setLoading(true);
    setError("");
    try {
      const first = await listManagedProducts({ page: 0, size: 100, search: query });
      const remainingPages = await Promise.all(Array.from({ length: Math.max(0, first.totalPages - 1) }, (_, index) =>
        listManagedProducts({ page: index + 1, size: 100, search: query })),
      );
      if (productRequest.current !== requestId) return;
      setProducts([...first.content, ...remainingPages.flatMap((result) => result.content)]);
      setPage(0);
    } catch (reason) {
      if (productRequest.current !== requestId) return;
      setError(reason instanceof RequestError && reason.status === 403
        ? "Your account does not have permission to manage products."
        : "Could not load products. Check the backend connection and try again.");
      setProducts([]);
    } finally {
      if (productRequest.current === requestId) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => { void refreshProducts(search); }, search.trim() ? 250 : 0);
    return () => window.clearTimeout(timeout);
  }, [refreshProducts, search]);

  useEffect(() => {
    if (!selectedId) return;
    let active = true;
    getManagedProduct(selectedId)
      .then((product) => { if (active) setSelectedProduct(product); })
      .catch(() => { if (active) { setSelectedProduct(null); setDetailError("Could not load this product's details."); } })
      .finally(() => { if (active) setDetailLoading(false); });
    return () => { active = false; };
  }, [selectedId]);

  function openProduct(id: string) {
    setDetailLoading(true);
    setDetailError("");
    setSelectedProduct(null);
    setSelectedId(id);
  }

  function openEdit(product: ManagedProduct) {
    setActionError("");
    setEditingProduct(product);
  }

  function closeProduct() {
    setSelectedId(null);
    setSelectedProduct(null);
    setDetailError("");
    setActionError("");
    setActivationProduct(null);
    setDeactivationProduct(null);
    setDraftProduct(null);
  }

  const filteredProducts = useMemo(() => filter === "ALL"
    ? products
    : products.filter((product) => product.status === filter), [filter, products]);
  const pageCount = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const visibleProducts = filteredProducts.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const counts = useMemo(() => ({
    ALL: products.length,
    ACTIVE: products.filter((product) => product.status === "ACTIVE").length,
    DRAFT: products.filter((product) => product.status === "DRAFT").length,
    DEACTIVATED: products.filter((product) => product.status === "DEACTIVATED").length,
  }), [products]);

  function openActivation(product: ManagedProduct) {
    if (product.status === "ACTIVE" || busyId || refreshRequiredId) return;
    setActivationIssues([]);
    setActionError("");
    setActivationProduct(product);
  }

  function openLifecycle(product: ManagedProduct) {
    if (product.status === "ACTIVE") {
      if (busyId || refreshRequiredId) return;
      setActionError("");
      setDeactivationProduct(product);
      return;
    }
    openActivation(product);
  }

  function openReturnToDraft(product: ManagedProduct) {
    if (product.status !== "DEACTIVATED" || busyId || refreshRequiredId) return;
    setActionError("");
    setDraftProduct(product);
  }

  async function refreshLifecycleProduct(productId: string) {
    setBusyId(productId);
    try {
      const updated = await getManagedProduct(productId);
      applyProductUpdate(updated);
      setActivationProduct(null);
      setDeactivationProduct(null);
      setDraftProduct(null);
      setActivationIssues([]);
      setRefreshRequiredId(null);
      setActionError("Product refreshed. Review its current details before trying again.");
    } catch {
      setActionError("Could not refresh this product. Refresh it before trying the lifecycle action again.");
    } finally {
      setBusyId(null);
    }
  }

  async function confirmActivation() {
    const product = activationProduct;
    if (!product || product.status === "ACTIVE" || busyId || refreshRequiredId) return;
    setBusyId(product.id);
    setActionError("");
    setActivationIssues([]);
    try {
      const updated = await activateManagedProduct(product);
      applyProductUpdate(updated);
      setActivationProduct(null);
    } catch (reason) {
      const issues = reason instanceof RequestError ? activationFieldLabels(reason) : [];
      setActivationIssues(issues);
      setActionError(issues.length > 0 ? "" : errorMessage(reason, "Activation"));
      if (reason instanceof RequestError && reason.errorCode === "CONCURRENT_MODIFICATION") {
        setRefreshRequiredId(product.id);
        await refreshLifecycleProduct(product.id);
      }
    } finally {
      setBusyId(null);
    }
  }

  async function confirmDeactivation() {
    const product = deactivationProduct;
    if (!product || product.status !== "ACTIVE" || busyId || refreshRequiredId) return;
    setBusyId(product.id);
    setActionError("");
    try {
      const updated = await deactivateManagedProduct(product);
      applyProductUpdate(updated);
      setEditingProduct((current) => current?.id === updated.id ? updated : current);
      setDeactivationProduct(null);
    } catch (reason) {
      setActionError(errorMessage(reason, "Deactivation"));
      if (reason instanceof RequestError && reason.errorCode === "CONCURRENT_MODIFICATION") {
        setRefreshRequiredId(product.id);
        await refreshLifecycleProduct(product.id);
      }
    } finally {
      setBusyId(null);
    }
  }

  async function confirmReturnToDraft() {
    const product = draftProduct;
    if (!product || product.status !== "DEACTIVATED" || busyId || refreshRequiredId) return;
    setBusyId(product.id);
    setActionError("");
    try {
      const updated = await returnManagedProductToDraft(product);
      applyProductUpdate(updated);
      setEditingProduct((current) => current?.id === updated.id ? updated : current);
      setDraftProduct(null);
    } catch (reason) {
      setActionError(errorMessage(reason, "Return to Draft"));
      if (reason instanceof RequestError && reason.errorCode === "CONCURRENT_MODIFICATION") {
        setRefreshRequiredId(product.id);
        await refreshLifecycleProduct(product.id);
      }
    } finally {
      setBusyId(null);
    }
  }

  function applyProductUpdate(updated: ManagedProduct) {
    setProducts((current) => current.map((item) => item.id === updated.id ? updated : item));
    setSelectedProduct((current) => current?.id === updated.id ? updated : current);
  }

  function refreshAfterConflict(productId: string) {
    void refreshProducts(search);
    void getManagedProduct(productId).then(setSelectedProduct).catch(() => undefined);
  }

  async function uploadImages(files: File[]) {
    if (!selectedProduct) return;
    const availableSlots = MAX_IMAGES - selectedProduct.images.length;
    if (files.length > availableSlots) {
      setActionError(`You can add ${availableSlots} more image${availableSlots === 1 ? "" : "s"}.`);
      return;
    }
    const invalid = files.find((file) => !IMAGE_TYPES.has(file.type)
      && !/\.(jpe?g|png|webp)$/i.test(file.name));
    if (invalid) {
      setActionError(`${invalid.name} is not a JPG, PNG, or WebP image.`);
      return;
    }
    const oversized = files.find((file) => file.size > MAX_IMAGE_BYTES);
    if (oversized) {
      setActionError(`${oversized.name} is larger than 2 MB.`);
      return;
    }

    setBusyId(selectedProduct.id);
    setActionError("");
    let current = selectedProduct;
    try {
      for (const file of files) {
        current = await uploadManagedProductImage(current, file);
        applyProductUpdate(current);
      }
    } catch (reason) {
      setActionError(errorMessage(reason, "Image upload"));
      if (reason instanceof RequestError && reason.errorCode === "CONCURRENT_MODIFICATION") {
        refreshAfterConflict(selectedProduct.id);
      }
    } finally {
      setBusyId(null);
    }
  }

  async function reorderImages(imageIds: string[]) {
    if (!selectedProduct) return;
    setBusyId(selectedProduct.id);
    setActionError("");
    try {
      applyProductUpdate(await reorderManagedProductImages(selectedProduct, imageIds));
    } catch (reason) {
      setActionError(errorMessage(reason, "Image reorder"));
      if (reason instanceof RequestError && reason.errorCode === "CONCURRENT_MODIFICATION") {
        refreshAfterConflict(selectedProduct.id);
      }
    } finally {
      setBusyId(null);
    }
  }

  async function removeImage(imageId: string) {
    if (!selectedProduct) return;
    setBusyId(selectedProduct.id);
    setActionError("");
    try {
      applyProductUpdate(await removeManagedProductImage(selectedProduct, imageId));
    } catch (reason) {
      setActionError(errorMessage(reason, "Image removal"));
      if (reason instanceof RequestError && reason.errorCode === "CONCURRENT_MODIFICATION") {
        refreshAfterConflict(selectedProduct.id);
      }
    } finally {
      setBusyId(null);
    }
  }

  function openCreatedProduct(product: ManagedProduct) {
    setProducts((current) => [product, ...current.filter((item) => item.id !== product.id)]);
    setFilter("ALL");
    setSearch("");
    setPage(0);
    setCreating(false);
    setDetailLoading(false);
    setDetailError("");
    setActionError("");
    setSelectedProduct(product);
    setSelectedId(product.id);
  }

  const activationDialog = activationProduct && <ModalDialog
    title={activationProduct.status === "DEACTIVATED" ? "Reactivate product" : "Activate product"}
    onClose={() => { if (busyId !== activationProduct.id) setActivationProduct(null); }}
    footer={<div className="flex flex-wrap justify-end gap-2">
      <Button type="button" disabled={busyId === activationProduct.id} onClick={() => setActivationProduct(null)} className="rounded-lg border border-neutral-border px-4 py-2 text-sm font-semibold">Cancel</Button>
      {refreshRequiredId === activationProduct.id
        ? <Button type="button" disabled={busyId === activationProduct.id} onClick={() => void refreshLifecycleProduct(activationProduct.id)} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">Refresh product</Button>
        : <Button type="button" disabled={busyId === activationProduct.id} onClick={() => void confirmActivation()} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">{busyId === activationProduct.id ? "Saving…" : activationProduct.status === "DEACTIVATED" ? "Confirm reactivation" : "Confirm activation"}</Button>}
    </div>}
  >
    <p className="text-sm text-text-secondary">Move <strong>{activationProduct.name}</strong> to Active? It will be eligible for sale. Stock is not required for activation.</p>
    <p className="mt-4 text-sm font-semibold text-text-primary">Before activation, the product needs:</p>
    <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-text-secondary">
      {Object.values(activationRequirements).map((requirement) => <li key={requirement}>{requirement}</li>)}
    </ul>
    {actionError && <p role="alert" className="mt-4 rounded-xl border border-primary/30 bg-white p-3 text-sm text-primary-deep">{actionError}</p>}
    {activationIssues.length > 0 && <div role="alert" className="mt-4 rounded-xl border border-primary/30 bg-white p-3 text-sm text-primary-deep">
      <p className="font-semibold">Review these requirements:</p>
      <ul className="mt-1 list-inside list-disc">{activationIssues.map((issue) => <li key={issue}>{issue}</li>)}</ul>
    </div>}
    {refreshRequiredId === activationProduct.id && <p role="alert" className="mt-4 text-sm text-primary-deep">This product changed elsewhere. Activation is unavailable until its current management record loads.</p>}
  </ModalDialog>;

  const deactivationDialog = deactivationProduct && <ModalDialog
    title="Deactivate product"
    onClose={() => { if (busyId !== deactivationProduct.id) setDeactivationProduct(null); }}
    footer={<div className="flex justify-end gap-2">
      <Button type="button" disabled={busyId === deactivationProduct.id} onClick={() => setDeactivationProduct(null)} className="rounded-lg border border-neutral-border px-4 py-2 text-sm font-semibold">Cancel</Button>
      <Button type="button" disabled={busyId === deactivationProduct.id} onClick={() => void confirmDeactivation()} className="rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800">{busyId === deactivationProduct.id ? "Saving…" : "Confirm deactivation"}</Button>
    </div>}
  >
    <p className="text-sm text-text-secondary"><strong>{deactivationProduct.name}</strong> will become hidden and unavailable for new purchases. Existing records are retained.</p>
    {actionError && <p role="alert" className="mt-4 rounded-xl border border-primary/30 bg-white p-3 text-sm text-primary-deep">{actionError}</p>}
  </ModalDialog>;

  const draftDialog = draftProduct && <ModalDialog
    title="Return product to Draft"
    onClose={() => { if (busyId !== draftProduct.id) setDraftProduct(null); }}
    footer={<div className="flex justify-end gap-2">
      <Button type="button" disabled={busyId === draftProduct.id} onClick={() => setDraftProduct(null)} className="rounded-lg border border-neutral-border px-4 py-2 text-sm font-semibold">Cancel</Button>
      <Button type="button" disabled={busyId === draftProduct.id} onClick={() => void confirmReturnToDraft()} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">{busyId === draftProduct.id ? "Saving…" : "Return to Draft"}</Button>
    </div>}
  >
    <p className="text-sm text-text-secondary"><strong>{draftProduct.name}</strong> will remain hidden and become a Draft for rework.</p>
    {actionError && <p role="alert" className="mt-4 rounded-xl border border-primary/30 bg-white p-3 text-sm text-primary-deep">{actionError}</p>}
  </ModalDialog>;

  if (editingProduct) return <div className="space-y-4">
    <ProductCreateForm
      key={`${editingProduct.id}:${editingProduct.version}`}
      product={editingProduct}
      onCancel={() => setEditingProduct(null)}
      onCreated={openCreatedProduct}
      onSaved={(updated) => { applyProductUpdate(updated); setEditingProduct(null); }}
      onDeactivate={(product) => setDeactivationProduct(product)}
      onReturnToDraft={openReturnToDraft}
    />
    {deactivationDialog}
    {draftDialog}
  </div>;

  if (selectedId) return <div className="w-full min-w-0 max-w-full space-y-4">
    {actionError && <p role="alert" className="rounded-xl border border-primary/30 bg-white px-4 py-3 text-sm text-primary-deep">{actionError}</p>}
    {refreshRequiredId === selectedId && !activationProduct && <Button type="button" disabled={busyId === selectedId} onClick={() => void refreshLifecycleProduct(selectedId)} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">Refresh product</Button>}
    <ProductDetail
      key={selectedId}
      product={selectedProduct}
      loading={detailLoading}
      error={detailError}
      busy={busyId === selectedProduct?.id || refreshRequiredId != null}
      onBack={closeProduct}
      onEdit={() => { if (selectedProduct) openEdit(selectedProduct); }}
      onLifecycle={() => { if (selectedProduct) openLifecycle(selectedProduct); }}
      onReturnToDraft={() => { if (selectedProduct) openReturnToDraft(selectedProduct); }}
      onUpload={(files) => { void uploadImages(files); }}
      onReorder={(imageIds) => { void reorderImages(imageIds); }}
      onRemove={(imageId) => { void removeImage(imageId); }}
    />
    {activationDialog}
    {deactivationDialog}
    {draftDialog}
  </div>;

  if (creating) return <ProductCreateForm onCancel={() => setCreating(false)} onCreated={openCreatedProduct} />;

  const filters: Array<{ value: StatusFilter; label: string }> = [
    { value: "ALL", label: "All products" },
    { value: "ACTIVE", label: "Active" },
    { value: "DRAFT", label: "Draft" },
    { value: "DEACTIVATED", label: "Deactivated" },
  ];

  return <div className="w-full min-w-0 max-w-full space-y-5">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="font-serif text-2xl font-semibold text-text-primary">Products</h2>
        <p className="mt-1 text-sm text-text-muted">Create a Draft first, then complete and activate it when it is ready.</p>
      </div>
      <Button type="button" onClick={() => setCreating(true)} className="min-h-11 self-start rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover sm:self-auto">Create Product</Button>
    </div>

    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <div role="tablist" aria-label="Filter products by status" className="no-scrollbar flex min-w-0 gap-2 overflow-x-auto pb-1 lg:shrink-0">
        {filters.map((item) => <button key={item.value} type="button" role="tab" aria-selected={filter === item.value} onClick={() => { setFilter(item.value); setPage(0); }} className={`shrink-0 rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors ${filter === item.value ? "border-primary bg-primary text-white" : "border-neutral-border bg-white text-text-secondary hover:border-primary"}`}>
          {item.label}<span className={`ml-1.5 text-xs ${filter === item.value ? "text-white/80" : "text-text-muted"}`}>{counts[item.value]}</span>
        </button>)}
      </div>

      <label className="relative block w-full lg:min-w-[240px] lg:flex-1">
        <span className="sr-only">Search products</span>
        <span aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">⌕</span>
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search product names" className="min-h-11 w-full rounded-xl border border-neutral-border bg-neutral-canvas pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:bg-white focus:outline-none" />
      </label>
    </div>

    {actionError && <p role="alert" className="rounded-xl border border-primary/30 bg-white px-4 py-3 text-sm text-primary-deep">{actionError}</p>}
    {refreshRequiredId && !activationProduct && <Button type="button" disabled={busyId === refreshRequiredId} onClick={() => void refreshLifecycleProduct(refreshRequiredId)} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">Refresh product</Button>}
    {error && <div className="rounded-2xl border border-neutral-border bg-white px-5 py-8 text-center"><p role="alert" className="text-sm text-primary-deep">{error}</p><Button type="button" onClick={() => void refreshProducts(search)} className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">Try again</Button></div>}
    {!error && loading && <div className="rounded-2xl border border-neutral-border bg-white py-12 text-center text-sm text-text-muted">Loading products…</div>}
    {!error && !loading && visibleProducts.length === 0 && <div className="rounded-2xl border border-neutral-border bg-white px-5 py-12 text-center text-sm text-text-muted">{search ? "No products match this search." : "No products in this status yet."}</div>}

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
            <div className="min-w-0 flex-1"><span className="block text-[10px] font-semibold uppercase tracking-wide text-text-muted">Selling price (base)</span><strong className="block truncate text-base text-text-primary">{formatMoney(product.basePrice)}</strong></div>
            <div className="ml-auto flex shrink-0 items-center gap-1.5"><EditButton product={product} onClick={() => openEdit(product)} /><LifecycleButton product={product} busy={busyId === product.id || refreshRequiredId != null} onClick={() => openLifecycle(product)} compact /></div>
          </div>
        </article>)}
      </div>

      <div className="hidden overflow-hidden rounded-2xl border border-neutral-border bg-white xl:block">
        <div className="grid grid-cols-[minmax(200px,1.5fr)_100px_130px_140px_170px] gap-2 border-b border-neutral-border bg-neutral-surface px-5 py-3 text-xs font-bold uppercase tracking-wide text-text-muted">
          <span>Product</span><span className="text-center">Status</span><span>Selling price (base)</span><span>Last updated</span><span className="text-center">Action</span>
        </div>
        {visibleProducts.map((product) => <article key={product.id} className="grid grid-cols-[minmax(200px,1.5fr)_100px_130px_140px_170px] items-center gap-2 border-b border-neutral-border px-5 py-4 last:border-b-0 hover:bg-neutral-canvas/60">
          <div className="min-w-0">
            <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-1.5">
              <div className="flex min-w-0 flex-wrap items-center gap-2"><button type="button" onClick={() => openProduct(product.id)} className="truncate text-left font-semibold text-text-primary hover:text-primary-deep">{product.name}</button><span className="shrink-0 rounded-full bg-neutral-raised px-2 py-0.5 text-[10px] font-semibold text-text-secondary">{productTypeLabel(product.type)}</span></div>
              <span className="shrink-0 text-xs text-text-muted">{productSetupSummary(product)}</span>
            </div>
          </div>
          <div className="flex justify-center"><StatusBadge status={product.status} /></div>
          <div><strong className="text-base text-text-primary">{formatMoney(product.basePrice)}</strong><span className="mt-0.5 block text-[10px] text-text-muted">Before sale discounts</span></div>
          <div className="text-xs text-text-secondary">{formatDate(product.updatedAt)}<span className="mt-1 block text-[10px] text-text-muted">by · {shortId(product.updatedBy)}</span></div>
          <div className="flex items-center justify-center gap-2"><EditButton product={product} onClick={() => openEdit(product)} /><LifecycleButton product={product} busy={busyId === product.id || refreshRequiredId != null} onClick={() => openLifecycle(product)} compact /></div>
        </article>)}
      </div>

      {pageCount > 1 && <div className="flex items-center justify-between border-t border-neutral-border pt-4 text-sm text-text-muted">
        <span>{filteredProducts.length} products · page {page + 1} of {pageCount}</span>
        <div className="flex gap-2"><Button type="button" disabled={page === 0} onClick={() => setPage((current) => current - 1)} className="rounded-lg border border-neutral-border bg-white px-3 py-2 font-semibold text-text-secondary">Previous</Button><Button type="button" disabled={page + 1 >= pageCount} onClick={() => setPage((current) => current + 1)} className="rounded-lg border border-neutral-border bg-white px-3 py-2 font-semibold text-text-secondary">Next</Button></div>
      </div>}
    </>}
    {activationDialog}
    {deactivationDialog}
    {draftDialog}
  </div>;
}
