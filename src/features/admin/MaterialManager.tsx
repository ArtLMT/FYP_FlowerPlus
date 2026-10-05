"use client";
import Button from "@/components/ui/Button";

import { useEffect, useState } from "react";
import { RequestError, errorText, type ValidationFieldError } from "@/lib/api";
import MaterialDetailsDialog from "@/features/admin/MaterialDetailsDialog";
import ModalDialog from "@/components/ui/ModalDialog";
import {
  createMaterial,
  deactivateMaterial,
  getMaterial,
  listMaterials,
  reactivateMaterial,
  updateMaterial,
  type AdminMaterial,
  type MaterialInput,
  type MaterialSort,
  type MaterialStatus,
  type MaterialType,
  type MaterialUnit,
  type PageResponse,
} from "@/lib/services/admin";

const pageSize = 20;

const sortOptions: { value: MaterialSort; label: string }[] = [
  { value: "NAME_ASC", label: "Tên A–Z" },
  { value: "NAME_DESC", label: "Tên Z–A" },
  { value: "PRICE_ASC", label: "Giá tăng dần" },
  { value: "PRICE_DESC", label: "Giá giảm dần" },
  { value: "CREATED_NEWEST", label: "Mới tạo trước" },
  { value: "CREATED_OLDEST", label: "Cũ tạo trước" },
];

const typeLabels: Record<MaterialType, string> = { FLOWER: "Hoa", DECORATION: "Trang trí" };
const unitLabels: Record<MaterialUnit, string> = {
  STEM: "Cành",
  PIECE: "Chiếc",
  METRE: "Mét",
  SHEET: "Tờ",
};
const fieldLabels: Record<string, string> = {
  name: "Tên nguyên liệu",
  type: "Loại",
  unitOfMeasure: "Đơn vị",
  sellingPrice: "Giá bán",
};

type MaterialFormState = Omit<MaterialInput, "sellingPrice"> & {
  sellingPrice: number | "";
};

const blankForm: MaterialFormState = {
  name: "",
  type: "FLOWER",
  unitOfMeasure: "STEM",
  sellingPrice: "",
};

function validationMessage(field: ValidationFieldError) {
  const name = fieldLabels[field.field] ?? "Thông tin";
  if (field.field === "name" && field.rule === "NotBlank") return `${name} là bắt buộc.`;
  if (field.field === "name" && field.rule === "Size") return `${name} tối đa 100 ký tự.`;
  if (field.field === "sellingPrice" && field.rule === "Min") return `${name} phải lớn hơn 0.`;
  if (field.field === "sellingPrice" && field.rule === "Digits") return `${name} phải là số VND nguyên, tối đa 12 chữ số.`;
  return `${name} chưa hợp lệ.`;
}

function validationErrors(fields: ValidationFieldError[] = []) {
  return fields.reduce<Record<string, string[]>>((errors, field) => {
    errors[field.field] = [...(errors[field.field] ?? []), validationMessage(field)];
    return errors;
  }, {});
}

function TextField({ label, value }: { label: string; value: string }) {
  return <p className="text-sm text-text-secondary"><span className="font-semibold text-text-primary">{label}: </span>{value}</p>;
}

export default function MaterialManager() {
  const [page, setPage] = useState<PageResponse<AdminMaterial> | null>(null);
  const [pageNumber, setPageNumber] = useState(0);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [type, setType] = useState<MaterialType | "">("");
  const [status, setStatus] = useState<MaterialStatus | "">("");
  const [sort, setSort] = useState<MaterialSort>("NAME_ASC");
  const [refreshNumber, setRefreshNumber] = useState(0);
  const [loadedKey, setLoadedKey] = useState("");
  const [listError, setListError] = useState("");
  const [feedback, setFeedback] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [detailsMaterial, setDetailsMaterial] = useState<AdminMaterial | null>(null);
  const [loadingDetailsId, setLoadingDetailsId] = useState("");
  const [editing, setEditing] = useState<AdminMaterial | null>(null);
  const [form, setForm] = useState<MaterialFormState>(blankForm);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [saving, setSaving] = useState(false);
  const [loadingMaterialId, setLoadingMaterialId] = useState("");
  const [actionMaterialId, setActionMaterialId] = useState("");

  const queryKey = `${pageNumber}|${appliedSearch}|${type}|${status}|${sort}|${refreshNumber}`;

  useEffect(() => {
    let active = true;
    listMaterials({
      page: pageNumber,
      size: pageSize,
      search: appliedSearch,
      type: type || undefined,
      status: status || undefined,
      sort,
    })
      .then((result) => {
        if (!active) return;
        if (result.totalPages > 0 && pageNumber >= result.totalPages) {
          setPageNumber(result.totalPages - 1);
          return;
        }
        setPage(result);
        setListError("");
      })
      .catch((reason: unknown) => { if (active) setListError(errorText(reason)); })
      .finally(() => { if (active) setLoadedKey(queryKey); });
    return () => { active = false; };
  }, [appliedSearch, pageNumber, queryKey, sort, status, type]);

  function openCreate() {
    setEditing(null);
    setForm(blankForm);
    setFieldErrors({});
    setFeedback(null);
    setEditorOpen(true);
  }

  async function openEdit(id: string) {
    setLoadingMaterialId(id);
    setFeedback(null);
    setListError("");
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
    } catch (reason) {
      setFeedback({ kind: "error", text: errorText(reason) });
    } finally {
      setLoadingMaterialId("");
    }
  }

  async function openDetails(id: string) {
    setLoadingDetailsId(id);
    setFeedback(null);
    try {
      setDetailsMaterial(await getMaterial(id));
    } catch (reason) {
      setFeedback({ kind: "error", text: errorText(reason) });
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

  async function submitMaterial(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setFieldErrors({});
    setFeedback(null);
    const input: MaterialInput = {
      name: form.name.trim(),
      type: form.type,
      unitOfMeasure: form.unitOfMeasure,
      sellingPrice: Number(form.sellingPrice),
    };
    try {
      if (editing) await updateMaterial(editing.id, input, editing.version);
      else await createMaterial(input);
      setEditorOpen(false);
      setFeedback({ kind: "success", text: editing ? "Đã cập nhật nguyên liệu." : "Đã tạo nguyên liệu." });
      setPageNumber(0);
      setRefreshNumber((number) => number + 1);
    } catch (reason) {
      setFeedback({ kind: "error", text: errorText(reason) });
      if (reason instanceof RequestError && reason.errorCode === "VALIDATION_FAILED") {
        setFieldErrors(validationErrors(reason.details?.fields));
      }
      if (reason instanceof RequestError && reason.errorCode === "CONCURRENT_MODIFICATION") {
        setEditorOpen(false);
        setEditing(null);
        setRefreshNumber((number) => number + 1);
      }
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(material: AdminMaterial) {
    setActionMaterialId(material.id);
    setFeedback(null);
    try {
      const changed = material.status === "ACTIVE"
        ? await deactivateMaterial(material.id, material.version)
        : await reactivateMaterial(material.id, material.version);
      setFeedback({ kind: "success", text: changed.status === "ACTIVE" ? "Đã kích hoạt nguyên liệu." : "Đã ngừng sử dụng nguyên liệu." });
      setRefreshNumber((number) => number + 1);
    } catch (reason) {
      setFeedback({ kind: "error", text: errorText(reason) });
      if (reason instanceof RequestError && reason.errorCode === "CONCURRENT_MODIFICATION") {
        setRefreshNumber((number) => number + 1);
      }
    } finally {
      setActionMaterialId("");
    }
  }

  const isLoading = loadedKey !== queryKey;

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Button type="button" onClick={openCreate} className="w-full rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-hover sm:w-auto">+ Thêm nguyên liệu</Button>
      </div>

      <section className="space-y-4 rounded-xl border border-neutral-border bg-neutral-canvas p-4 sm:p-5" aria-label="Tìm và lọc nguyên liệu">
        <form onSubmit={(event) => { event.preventDefault(); setPageNumber(0); setAppliedSearch(search.trim()); setFeedback(null); }} className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
          <label className="flex flex-col gap-1 text-xs font-semibold text-text-secondary">
            Tìm theo tên
            <input value={search} maxLength={100} onChange={(event) => setSearch(event.target.value)} placeholder="Nhập tên nguyên liệu" className="min-h-11 rounded-lg border border-neutral-border bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-primary" />
          </label>
          <Button type="submit" className="min-h-11 w-full self-end rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:w-auto">Tìm kiếm</Button>
        </form>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className="flex flex-col gap-1 text-xs font-semibold text-text-secondary">
            Loại
            <select value={type} onChange={(event) => { setType(event.target.value as MaterialType | ""); setPageNumber(0); setFeedback(null); }} className="min-h-11 rounded-lg border border-neutral-border bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-primary">
              <option value="">Tất cả loại</option><option value="FLOWER">Hoa</option><option value="DECORATION">Trang trí</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-text-secondary">
            Trạng thái
            <select value={status} onChange={(event) => { setStatus(event.target.value as MaterialStatus | ""); setPageNumber(0); setFeedback(null); }} className="min-h-11 rounded-lg border border-neutral-border bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-primary">
              <option value="">Tất cả trạng thái</option><option value="ACTIVE">Đang hoạt động</option><option value="DEACTIVATED">Đã ngừng</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-text-secondary">
            Sắp xếp
            <select value={sort} onChange={(event) => { setSort(event.target.value as MaterialSort); setPageNumber(0); setFeedback(null); }} className="min-h-11 rounded-lg border border-neutral-border bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-primary">
              {sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
        </div>
      </section>

      {feedback && !editorOpen && <p role="status" className={`rounded-lg px-4 py-3 text-sm ${feedback.kind === "error" ? "bg-red-50 text-red-800" : "bg-accent-sage-light text-text-primary"}`}>{feedback.text}</p>}
      {listError && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{listError}</p>}

      {editorOpen && <ModalDialog
        title={editing ? "Chỉnh sửa nguyên liệu" : "Tạo nguyên liệu"}
        onClose={() => setEditorOpen(false)}
        wide
        footer={<div className="flex justify-end gap-3">
          <Button type="button" onClick={() => setEditorOpen(false)} className="rounded-lg border border-neutral-border bg-white px-5 py-2.5 text-sm font-semibold text-text-secondary">Hủy</Button>
          <Button type="submit" form="material-form" disabled={saving} className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover">{saving ? "Đang lưu…" : editing ? "Lưu thay đổi" : "Tạo nguyên liệu"}</Button>
        </div>}
      >
        <form id="material-form" onSubmit={submitMaterial} className="grid gap-4 sm:grid-cols-2">
          {feedback?.kind === "error" && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800 sm:col-span-2">{feedback.text}</p>}
          <label className="flex flex-col gap-1 text-sm font-semibold text-text-secondary sm:col-span-2">
            Tên nguyên liệu
            <input autoFocus required maxLength={100} value={form.name} onChange={(event) => setForm((value) => ({ ...value, name: event.target.value }))} className="rounded-lg border border-neutral-border bg-white px-3 py-2.5 font-normal outline-none focus:border-primary" />
            {fieldErrors.name?.map((message) => <span key={message} className="text-xs font-normal text-red-700">{message}</span>)}
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold text-text-secondary">
            Loại
            <select required value={form.type} onChange={(event) => setForm((value) => ({ ...value, type: event.target.value as MaterialType }))} className="rounded-lg border border-neutral-border bg-white px-3 py-2.5 font-normal outline-none focus:border-primary">
              <option value="FLOWER">Hoa</option><option value="DECORATION">Trang trí</option>
            </select>
            {fieldErrors.type?.map((message) => <span key={message} className="text-xs font-normal text-red-700">{message}</span>)}
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold text-text-secondary">
            Đơn vị
            <select required value={form.unitOfMeasure} onChange={(event) => setForm((value) => ({ ...value, unitOfMeasure: event.target.value as MaterialUnit }))} className="rounded-lg border border-neutral-border bg-white px-3 py-2.5 font-normal outline-none focus:border-primary">
              {Object.entries(unitLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            {fieldErrors.unitOfMeasure?.map((message) => <span key={message} className="text-xs font-normal text-red-700">{message}</span>)}
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold text-text-secondary sm:col-span-2">
            Giá bán (VND)
            <input required type="number" min="1" step="1" value={form.sellingPrice} onChange={(event) => setForm((value) => ({ ...value, sellingPrice: event.target.value === "" ? "" : Number(event.target.value) }))} className="rounded-lg border border-neutral-border bg-white px-3 py-2.5 font-normal outline-none focus:border-primary" />
            {fieldErrors.sellingPrice?.map((message) => <span key={message} className="text-xs font-normal text-red-700">{message}</span>)}
          </label>
        </form>
      </ModalDialog>}

      {detailsMaterial && <MaterialDetailsDialog material={detailsMaterial} onClose={() => setDetailsMaterial(null)} onEdit={editFromDetails} />}

      {!isLoading && page && <p className="text-sm font-medium text-text-secondary">{page.totalElements} nguyên liệu</p>}

      {isLoading ? <p className="py-8 text-center text-sm text-text-muted">Đang tải nguyên liệu…</p>
        : listError ? null
          : page?.content.length === 0 ? <p className="rounded-xl border border-dashed border-neutral-border py-10 text-center text-sm text-text-muted">Không tìm thấy nguyên liệu phù hợp.</p>
          : <div className="grid gap-4 md:grid-cols-2">{page?.content.map((material) => <article key={material.id} className="flex h-full flex-col rounded-xl border border-neutral-border bg-white p-5 shadow-sm">
            <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
              <div><h3 className="font-serif text-xl font-semibold text-text-primary">{material.name}</h3><p className="mt-1 text-xs text-text-muted">{typeLabels[material.type]} · {unitLabels[material.unitOfMeasure]}</p></div>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${material.status === "ACTIVE" ? "bg-accent-sage-light text-text-primary" : "bg-neutral-raised text-text-secondary"}`}>{material.status === "ACTIVE" ? "Đang hoạt động" : "Đã ngừng"}</span>
            </div>
            <TextField label="Giá bán" value={`${Number(material.sellingPrice).toLocaleString("vi-VN")} ₫ / ${unitLabels[material.unitOfMeasure]}`} />
            <div className="mt-auto flex flex-wrap gap-2 border-t border-neutral-border pt-4">
              <Button type="button" disabled={Boolean(loadingDetailsId || loadingMaterialId || actionMaterialId || saving)} onClick={() => void openDetails(material.id)} className="rounded-lg border border-neutral-border bg-white px-4 py-2 text-sm font-semibold text-text-secondary hover:border-primary hover:text-primary-deep">{loadingDetailsId === material.id ? "Đang tải…" : "Chi tiết"}</Button>
              <Button type="button" disabled={Boolean(loadingMaterialId || actionMaterialId || saving)} onClick={() => void openEdit(material.id)} className="rounded-lg border border-neutral-border bg-white px-4 py-2 text-sm font-semibold text-text-secondary hover:border-primary hover:text-primary-deep">{loadingMaterialId === material.id ? "Đang mở…" : "Chỉnh sửa"}</Button>
              <Button type="button" disabled={Boolean(loadingMaterialId || actionMaterialId || saving)} onClick={() => void changeStatus(material)} className="rounded-lg px-3 py-2 text-sm font-semibold text-text-muted hover:bg-neutral-surface hover:text-text-primary">{actionMaterialId === material.id ? "Đang cập nhật…" : material.status === "ACTIVE" ? "Ngừng sử dụng" : "Kích hoạt lại"}</Button>
            </div>
          </article>)}</div>}

      {!isLoading && page && page.totalPages > 1 && <div className="flex items-center justify-between border-t border-neutral-border pt-5">
        <Button type="button" disabled={pageNumber === 0} onClick={() => setPageNumber((current) => current - 1)} className="rounded-lg border border-neutral-border bg-white px-4 py-2 text-sm font-semibold text-text-secondary">Trước</Button>
        <span className="text-sm text-text-muted">{page.totalElements} mục · trang {page.page + 1}/{page.totalPages}</span>
        <Button type="button" disabled={pageNumber + 1 >= page.totalPages} onClick={() => setPageNumber((current) => current + 1)} className="rounded-lg border border-neutral-border bg-white px-4 py-2 text-sm font-semibold text-text-secondary">Tiếp</Button>
      </div>}
    </div>
  );
}
