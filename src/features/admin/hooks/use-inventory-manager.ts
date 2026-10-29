import { useState, type FormEvent } from "react";
import { asApiError, type FieldErrors } from "@/lib/api";
import { useResource } from "@/lib/hooks/use-resource";
import { listBatches, receiveBatch, type MaterialBatch } from "@/lib/services/inventory";
import { listMaterials } from "@/lib/services/materials";
import { shopToday } from "@/lib/utils";

const PAGE_SIZE = 20;
/** The material catalog is small; one page of the backend's maximum covers it. */
const MATERIAL_PAGE_SIZE = 100;

/** The receive form's raw input values; numbers stay text until submit. */
interface ReceiveForm {
  materialId: string;
  quantity: string;
  unitCost: string;
  receivedDate: string;
  expiryDate: string;
}

const BLANK_FORM: ReceiveForm = { materialId: "", quantity: "", unitCost: "", receivedDate: "", expiryDate: "" };

type Feedback = { kind: "success" | "error"; text: string };

/**
 * Admin inventory: receive a delivery into a new batch, and the paged batch list (newest received
 * first, optionally one material's), and the batch being adjusted. After a receipt the list is
 * re-read from the first page; after an adjustment the current page is re-read.
 */
export function useInventoryManager({ receiveRequest = null, onStockChanged }: {
  /** A material to receive, e.g. from the stock alert; a new object picks it again. */
  receiveRequest?: { materialId: string } | null;
  /** Told after a receipt or an adjustment, which changes usable stock. */
  onStockChanged?: () => void;
} = {}) {
  // Materials: every one can filter the list; only Active ones can receive stock.
  const materials = useResource(
    () => listMaterials({ page: 0, size: MATERIAL_PAGE_SIZE, sort: "NAME_ASC" }),
    "inventory-materials",
  );
  const allMaterials = materials.data?.content ?? [];
  const activeMaterials = allMaterials.filter((material) => material.status === "ACTIVE");

  // Batch list
  const [pageNumber, setPageNumber] = useState(0);
  const [filterMaterialId, setFilterMaterialId] = useState("");
  const list = useResource(
    () => listBatches({ page: pageNumber, size: PAGE_SIZE, materialId: filterMaterialId || undefined }),
    `${pageNumber}|${filterMaterialId}`,
  );

  // Receive form
  const [form, setForm] = useState<ReceiveForm>(BLANK_FORM);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [saving, setSaving] = useState(false);
  const [handledRequest, setHandledRequest] = useState<{ materialId: string } | null>(null);

  if (receiveRequest && receiveRequest !== handledRequest) {
    setHandledRequest(receiveRequest);
    setForm({ ...BLANK_FORM, materialId: receiveRequest.materialId });
    setFieldErrors({});
    setFeedback(null);
  }

  // Adjust dialog: the batch it is open for, or null.
  const [adjusting, setAdjusting] = useState<MaterialBatch | null>(null);

  function adjusted(batch: MaterialBatch) {
    setAdjusting(null);
    setFeedback({ kind: "success", text: `Đã điều chỉnh lô ${batch.materialName}.` });
    list.reload();
    onStockChanged?.();
  }

  const selected = activeMaterials.find((material) => material.id === form.materialId) ?? null;
  const needsExpiry = selected?.type === "FLOWER";
  const today = shopToday();

  function selectMaterial(materialId: string) {
    const material = activeMaterials.find((candidate) => candidate.id === materialId);
    // A decoration batch has no expiry, so a date typed for a flower must not travel with it.
    setForm((current) => ({
      ...current,
      materialId,
      expiryDate: material?.type === "FLOWER" ? current.expiryDate : "",
    }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    setSaving(true);
    setFieldErrors({});
    setFeedback(null);
    try {
      const batch = await receiveBatch({
        materialId: selected.id,
        quantity: Number(form.quantity),
        unitCost: Number(form.unitCost),
        receivedDate: form.receivedDate || undefined,
        expiryDate: needsExpiry ? form.expiryDate || undefined : undefined,
      });
      setFeedback({ kind: "success", text: `Đã nhập lô ${batch.materialName}.` });
      // Keep the material for the next line of the same delivery; clear the rest.
      setForm({ ...BLANK_FORM, materialId: selected.id });
      // Show the new batch: the first page, and not hidden behind another material's filter.
      if (filterMaterialId && filterMaterialId !== selected.id) setFilterMaterialId("");
      setPageNumber(0);
      list.reload();
      onStockChanged?.();
    } catch (cause) {
      const error = asApiError(cause);
      setFeedback({ kind: "error", text: error.message });
      setFieldErrors(error.fieldErrors);
      if (error.is("MATERIAL_NOT_FOUND", "MATERIAL_DEACTIVATED")) {
        setForm((current) => ({ ...current, materialId: "" }));
        materials.reload();
      }
    } finally {
      setSaving(false);
    }
  }

  const page = list.data;
  const currentPage = page?.page ?? pageNumber;

  return {
    // Materials
    activeMaterials,
    allMaterials,
    materialsLoading: materials.loading && !materials.data,
    materialsError: materials.error?.message ?? "",
    // Receive form
    form,
    selected,
    needsExpiry,
    today,
    selectMaterial,
    updateForm: (patch: Partial<ReceiveForm>) => setForm((current) => ({ ...current, ...patch })),
    fieldErrors,
    feedback,
    saving,
    submit,
    // Adjust dialog
    adjusting,
    openAdjust: (batch: MaterialBatch) => setAdjusting(batch),
    closeAdjust: () => setAdjusting(null),
    adjusted,
    reloadBatches: list.reload,
    // Batch list
    page,
    loading: list.loading && !list.data,
    listError: list.error?.message ?? "",
    filterMaterialId,
    setFilterMaterialId: (materialId: string) => {
      setFilterMaterialId(materialId);
      setPageNumber(0);
    },
    hasPrevious: currentPage > 0,
    hasNext: page !== undefined && currentPage + 1 < page.totalPages,
    previous: () => setPageNumber(currentPage - 1),
    next: () => setPageNumber(currentPage + 1),
  };
}
