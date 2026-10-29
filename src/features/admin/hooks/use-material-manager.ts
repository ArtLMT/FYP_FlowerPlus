import { useState, type FormEvent } from "react";
import { asApiError, type FieldErrors } from "@/lib/api";
import { useResource } from "@/lib/hooks/use-resource";
import {
  getMaterial,
  listMaterials,
  saveMaterial,
  toggleMaterialStatus,
  type Material,
  type MaterialForm,
  type MaterialSort,
  type MaterialStatus,
  type MaterialType,
} from "@/lib/services/materials";

const PAGE_SIZE = 20;

const BLANK_FORM: MaterialForm = { name: "", type: "FLOWER", unitOfMeasure: "STEM", sellingPrice: "" };

type Feedback = { kind: "success" | "error"; text: string };

/**
 * Admin materials: the filtered, sorted, paged list; the create/edit dialog; the details dialog;
 * and activate/deactivate. After a change (or a concurrent-edit conflict) the list is re-read.
 */
export function useMaterialManager() {
  // List query
  const [pageNumber, setPageNumber] = useState(0);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [type, setType] = useState<MaterialType | "">("");
  const [status, setStatus] = useState<MaterialStatus | "">("");
  const [sort, setSort] = useState<MaterialSort>("NAME_ASC");
  const list = useResource(
    () => listMaterials({
      page: pageNumber,
      size: PAGE_SIZE,
      search: appliedSearch,
      type: type || undefined,
      status: status || undefined,
      sort,
    }),
    `${pageNumber}|${appliedSearch}|${type}|${status}|${sort}`,
  );

  // Dialogs and actions
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Material | null>(null);
  const [form, setForm] = useState<MaterialForm>(BLANK_FORM);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const [detailsMaterial, setDetailsMaterial] = useState<Material | null>(null);
  const [loadingDetailsId, setLoadingDetailsId] = useState("");
  const [loadingMaterialId, setLoadingMaterialId] = useState("");
  const [actionMaterialId, setActionMaterialId] = useState("");

  const page = list.data;
  /** The page actually shown (the service may have moved past a page that no longer exists). */
  const currentPage = page?.page ?? pageNumber;

  /** Changing a filter starts again from the first page. */
  function filterBy(apply: () => void) {
    apply();
    setPageNumber(0);
    setFeedback(null);
  }

  function openCreate() {
    setEditing(null);
    setForm(BLANK_FORM);
    setFieldErrors({});
    setFeedback(null);
    setEditorOpen(true);
  }

  async function openEdit(id: string) {
    setLoadingMaterialId(id);
    setFeedback(null);
    try {
      const material = await getMaterial(id);
      setEditing(material);
      setForm({
        name: material.name,
        type: material.type,
        unitOfMeasure: material.unitOfMeasure,
        sellingPrice: Number(material.sellingPrice),
      });
      setFieldErrors({});
      setEditorOpen(true);
    } catch (cause) {
      setFeedback({ kind: "error", text: asApiError(cause).message });
    } finally {
      setLoadingMaterialId("");
    }
  }

  async function openDetails(id: string) {
    setLoadingDetailsId(id);
    setFeedback(null);
    try {
      setDetailsMaterial(await getMaterial(id));
    } catch (cause) {
      setFeedback({ kind: "error", text: asApiError(cause).message });
    } finally {
      setLoadingDetailsId("");
    }
  }

  function editFromDetails() {
    if (!detailsMaterial) return;
    const id = detailsMaterial.id;
    setDetailsMaterial(null);
    void openEdit(id);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setFieldErrors({});
    setFeedback(null);
    try {
      await saveMaterial(editing, form);
      setEditorOpen(false);
      setFeedback({ kind: "success", text: editing ? "Đã cập nhật nguyên liệu." : "Đã tạo nguyên liệu." });
      setPageNumber(0);
      list.reload();
    } catch (cause) {
      const error = asApiError(cause);
      setFeedback({ kind: "error", text: error.message });
      setFieldErrors(error.fieldErrors);
      if (error.is("CONCURRENT_MODIFICATION")) {
        setEditorOpen(false);
        setEditing(null);
        list.reload();
      }
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(material: Material) {
    setActionMaterialId(material.id);
    setFeedback(null);
    try {
      const changed = await toggleMaterialStatus(material);
      setFeedback({ kind: "success", text: changed.status === "ACTIVE" ? "Đã kích hoạt nguyên liệu." : "Đã ngừng sử dụng nguyên liệu." });
      list.reload();
    } catch (cause) {
      const error = asApiError(cause);
      setFeedback({ kind: "error", text: error.message });
      if (error.is("CONCURRENT_MODIFICATION")) list.reload();
    } finally {
      setActionMaterialId("");
    }
  }

  return {
    // List
    page,
    loading: list.loading,
    listError: list.error?.message ?? "",
    currentPage,
    hasPrevious: currentPage > 0,
    hasNext: page !== undefined && currentPage + 1 < page.totalPages,
    previous: () => setPageNumber(currentPage - 1),
    next: () => setPageNumber(currentPage + 1),
    // Filters
    search,
    setSearch,
    applySearch: (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      filterBy(() => setAppliedSearch(search.trim()));
    },
    type,
    setType: (value: MaterialType | "") => filterBy(() => setType(value)),
    status,
    setStatus: (value: MaterialStatus | "") => filterBy(() => setStatus(value)),
    sort,
    setSort: (value: MaterialSort) => filterBy(() => setSort(value)),
    // Feedback and per-card actions
    feedback,
    loadingDetailsId,
    loadingMaterialId,
    actionMaterialId,
    detailsDisabled: Boolean(loadingDetailsId || loadingMaterialId || actionMaterialId || saving),
    actionsDisabled: Boolean(loadingMaterialId || actionMaterialId || saving),
    openDetails,
    openEdit,
    changeStatus,
    // Details dialog
    detailsMaterial,
    closeDetails: () => setDetailsMaterial(null),
    editFromDetails,
    // Editor dialog
    editorOpen,
    editing,
    form,
    updateForm: (patch: Partial<MaterialForm>) => setForm((current) => ({ ...current, ...patch })),
    /** The price input's raw text: "" stays empty, anything else becomes a number. */
    setPrice: (raw: string) => setForm((current) => ({ ...current, sellingPrice: raw === "" ? "" : Number(raw) })),
    fieldErrors,
    saving,
    openCreate,
    closeEditor: () => setEditorOpen(false),
    submit,
  };
}
