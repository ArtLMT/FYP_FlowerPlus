import { useEffect, useMemo, useRef, useState } from "react";
import { asApiError, type ApiError } from "@/lib/api";
import { useResource } from "@/lib/hooks/use-resource";
import {
  activateProduct,
  deactivateProduct,
  getManagedProduct,
  imageSelectionError,
  listAllManagedProducts,
  MAX_PRODUCT_IMAGES,
  refreshManagedProduct,
  removeProductImage,
  reorderProductImages,
  returnProductToDraft,
  uploadProductImage,
  type ManagedProduct,
  type ManagedProductStatus,
} from "@/lib/services/managed-products";

export type StatusFilter = "ALL" | ManagedProductStatus;
export type ProductManagerView = "list" | "create" | "edit" | "detail";

const PAGE_SIZE = 10;

/**
 * Admin products: the searchable list (filtered and paged here), the create/edit form, the detail
 * screen with its images, and the lifecycle (activate, deactivate, return to Draft).
 *
 * Every product change uses the product's version. When the backend reports a concurrent edit, the
 * product must be re-read before another lifecycle action is allowed (`refreshRequiredId`).
 */
export function useProductManager() {
  /* ── List ────────────────────────────────────────── */

  const [search, setSearchText] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilterValue] = useState<StatusFilter>("ALL");
  const [page, setPage] = useState(0);
  const searchTimer = useRef<number | undefined>(undefined);
  const list = useResource(() => listAllManagedProducts(query), `products:${query}`);

  useEffect(() => () => window.clearTimeout(searchTimer.current), []);

  /** Typing searches after a short pause; the new results start on page one. */
  function setSearch(value: string) {
    setSearchText(value);
    window.clearTimeout(searchTimer.current);
    searchTimer.current = window.setTimeout(() => {
      setQuery(value);
      setPage(0);
    }, value.trim() ? 250 : 0);
  }

  function reloadProducts() {
    list.reload();
    setPage(0);
  }

  const products = useMemo(() => (list.error ? [] : list.data ?? []), [list.error, list.data]);
  const filteredProducts = useMemo(() => filter === "ALL"
    ? products
    : products.filter((product) => product.status === filter), [filter, products]);
  const counts = useMemo(() => ({
    ALL: products.length,
    ACTIVE: products.filter((product) => product.status === "ACTIVE").length,
    DRAFT: products.filter((product) => product.status === "DRAFT").length,
    DEACTIVATED: products.filter((product) => product.status === "DEACTIVATED").length,
  }), [products]);
  const pageCount = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));

  /* ── Screens ─────────────────────────────────────── */

  const [creating, setCreating] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ManagedProduct | null>(null);
  /** Bumped when the open edit form must restart from the server's copy (see applyProductUpdate). */
  const [editRevision, setEditRevision] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ManagedProduct | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const detailRequest = useRef(0);

  /* ── Actions ─────────────────────────────────────── */

  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const [activationIssues, setActivationIssues] = useState<string[]>([]);
  const [refreshRequiredId, setRefreshRequiredId] = useState<string | null>(null);
  const [activationProduct, setActivationProduct] = useState<ManagedProduct | null>(null);
  const [deactivationProduct, setDeactivationProduct] = useState<ManagedProduct | null>(null);
  const [draftProduct, setDraftProduct] = useState<ManagedProduct | null>(null);
  const actionLocked = busyId !== null || refreshRequiredId !== null;

  /**
   * Puts a product the server just returned into the list, the detail screen and the edit form.
   * The edit form restarts from it (losing unsaved edits) unless `keepFormEdits`: an image change
   * made from the form itself only moves the version the next Save sends.
   */
  function applyProductUpdate(updated: ManagedProduct, keepFormEdits = false) {
    list.setData((current) => current?.map((item) => item.id === updated.id ? updated : item));
    setSelectedProduct((current) => current?.id === updated.id ? updated : current);
    setEditingProduct((current) => current?.id === updated.id ? updated : current);
    if (!keepFormEdits) setEditRevision((revision) => revision + 1);
  }

  async function openProduct(id: string) {
    const request = ++detailRequest.current;
    setDetailLoading(true);
    setDetailError("");
    setSelectedProduct(null);
    setSelectedId(id);
    try {
      const product = await getManagedProduct(id);
      if (request === detailRequest.current) setSelectedProduct(product);
    } catch (cause) {
      if (request === detailRequest.current) setDetailError(asApiError(cause).message);
    } finally {
      if (request === detailRequest.current) setDetailLoading(false);
    }
  }

  function closeProduct() {
    detailRequest.current++;
    setSelectedId(null);
    setSelectedProduct(null);
    setDetailError("");
    setActionError("");
    setActivationProduct(null);
    setDeactivationProduct(null);
    setDraftProduct(null);
  }

  function openEdit(product: ManagedProduct) {
    setActionError("");
    setEditingProduct(product);
  }

  function openCreatedProduct(product: ManagedProduct) {
    list.setData((current) => [product, ...(current ?? []).filter((item) => item.id !== product.id)]);
    setFilterValue("ALL");
    setSearch("");
    setPage(0);
    setCreating(false);
    detailRequest.current++;
    setDetailLoading(false);
    setDetailError("");
    setActionError("");
    setSelectedProduct(product);
    setSelectedId(product.id);
  }

  /* ── Lifecycle ───────────────────────────────────── */

  function openActivation(product: ManagedProduct) {
    if (product.status === "ACTIVE" || actionLocked) return;
    setActivationIssues([]);
    setActionError("");
    setActivationProduct(product);
  }

  /** The row/detail lifecycle button: deactivate an Active product, otherwise (re)activate it. */
  function openLifecycle(product: ManagedProduct) {
    if (product.status !== "ACTIVE") return openActivation(product);
    if (actionLocked) return;
    setActionError("");
    setDeactivationProduct(product);
  }

  function openReturnToDraft(product: ManagedProduct) {
    if (product.status !== "DEACTIVATED" || actionLocked) return;
    setActionError("");
    setDraftProduct(product);
  }

  function closeDialogs() {
    setActivationProduct(null);
    setDeactivationProduct(null);
    setDraftProduct(null);
  }

  /** Re-reads a product after a conflict so its current version is used next time. */
  async function refreshLifecycleProduct(productId: string) {
    setBusyId(productId);
    try {
      applyProductUpdate(await refreshManagedProduct(productId));
      closeDialogs();
      setActivationIssues([]);
      setRefreshRequiredId(null);
      setActionError("Đã tải lại sản phẩm. Vui lòng xem lại thông tin hiện tại trước khi thử lại.");
    } catch (cause) {
      setActionError(asApiError(cause).message);
    } finally {
      setBusyId(null);
    }
  }

  async function changeLifecycle(
    product: ManagedProduct,
    request: (product: ManagedProduct) => Promise<ManagedProduct>,
    onFailure?: (error: ApiError) => void,
  ) {
    setBusyId(product.id);
    setActionError("");
    try {
      // The edit form (if open) restarts from the new status and version.
      applyProductUpdate(await request(product));
      closeDialogs();
    } catch (cause) {
      const error = asApiError(cause);
      setActionError(error.message);
      onFailure?.(error);
      if (error.is("CONCURRENT_MODIFICATION")) {
        setRefreshRequiredId(product.id);
        await refreshLifecycleProduct(product.id);
      }
    } finally {
      setBusyId(null);
    }
  }

  function confirmActivation() {
    const product = activationProduct;
    if (!product || product.status === "ACTIVE" || actionLocked) return;
    setActivationIssues([]);
    return changeLifecycle(product, activateProduct, (error) => {
      // Missing requirements are listed in the dialog instead of a single message.
      setActivationIssues(error.fieldMessages);
      if (error.fieldMessages.length > 0) setActionError("");
    });
  }

  function confirmDeactivation() {
    const product = deactivationProduct;
    if (!product || product.status !== "ACTIVE" || actionLocked) return;
    return changeLifecycle(product, deactivateProduct);
  }

  function confirmReturnToDraft() {
    const product = draftProduct;
    if (!product || product.status !== "DEACTIVATED" || actionLocked) return;
    return changeLifecycle(product, returnProductToDraft);
  }

  /* ── Images (detail screen and edit form) ────────── */

  /** The product whose images are on screen: the one being edited, else the one being viewed. */
  const imageProduct = editingProduct ?? selectedProduct;

  async function changeImages(request: (product: ManagedProduct) => Promise<void>) {
    const product = imageProduct;
    if (!product) return;
    setBusyId(product.id);
    setActionError("");
    try {
      await request(product);
    } catch (cause) {
      const error = asApiError(cause);
      setActionError(error.message);
      if (error.is("CONCURRENT_MODIFICATION")) {
        // Changed elsewhere: show the current copy everywhere, the edit form included.
        reloadProducts();
        void getManagedProduct(product.id).then((fresh) => applyProductUpdate(fresh)).catch(() => undefined);
      }
    } finally {
      setBusyId(null);
    }
  }

  function uploadImages(files: File[]) {
    if (!imageProduct) return;
    const problem = imageSelectionError(files, MAX_PRODUCT_IMAGES - imageProduct.images.length, "add");
    if (problem) return setActionError(problem);
    return changeImages(async (product) => {
      let current = product;
      for (const file of files) {
        current = await uploadProductImage(current, file);
        applyProductUpdate(current, true);
      }
    });
  }

  /** Swaps image `index` with its neighbour before (-1) or after (+1) it. */
  function moveImage(index: number, direction: -1 | 1) {
    if (!imageProduct) return;
    const ordered = imageProduct.images.map((image) => image.id);
    [ordered[index], ordered[index + direction]] = [ordered[index + direction], ordered[index]];
    return changeImages(async (product) => applyProductUpdate(await reorderProductImages(product, ordered), true));
  }

  const removeImage = (imageId: string) =>
    changeImages(async (product) => applyProductUpdate(await removeProductImage(product, imageId), true));

  /* ── Result ──────────────────────────────────────── */

  const view: ProductManagerView = editingProduct ? "edit" : selectedId ? "detail" : creating ? "create" : "list";

  return {
    view,
    // List
    search,
    setSearch,
    filter,
    selectFilter: (value: StatusFilter) => {
      setFilterValue(value);
      setPage(0);
    },
    counts,
    loading: list.loading,
    error: list.loading ? "" : list.error?.message ?? "",
    reloadProducts,
    filteredProducts,
    visibleProducts: filteredProducts.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
    page,
    pageCount,
    previousPage: () => setPage((current) => current - 1),
    nextPage: () => setPage((current) => current + 1),
    // Screens
    startCreating: () => setCreating(true),
    stopCreating: () => setCreating(false),
    openCreatedProduct,
    editingProduct,
    editRevision,
    openEdit,
    closeEdit: () => {
      setEditingProduct(null);
      setActionError("");
    },
    finishEdit: (updated: ManagedProduct) => {
      applyProductUpdate(updated);
      setEditingProduct(null);
    },
    selectedId,
    selectedProduct,
    detailLoading,
    detailError,
    openProduct,
    closeProduct,
    // Lifecycle
    busyId,
    isBusy: (product: ManagedProduct | null) => busyId === product?.id || refreshRequiredId !== null,
    actionError,
    activationIssues,
    refreshRequiredId,
    refreshLifecycleProduct,
    activationProduct,
    deactivationProduct,
    draftProduct,
    openLifecycle,
    openReturnToDraft,
    /** From the edit form, which only offers Deactivate for an Active product. */
    askToDeactivate: setDeactivationProduct,
    closeActivation: () => setActivationProduct(null),
    closeDeactivation: () => setDeactivationProduct(null),
    closeDraft: () => setDraftProduct(null),
    confirmActivation,
    confirmDeactivation,
    confirmReturnToDraft,
    // Images
    uploadImages,
    moveImage,
    removeImage,
  };
}
