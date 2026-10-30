import { useState, type FormEvent } from "react";
import { asApiError, type FieldErrors } from "@/lib/api";
import { useResource } from "@/lib/hooks/use-resource";
import {
  deleteCategory,
  listManagedCategories,
  saveCategory,
  type ManagedCategory,
} from "@/lib/services/categories";

type Feedback = { kind: "success" | "error"; text: string };

/**
 * Admin categories: the full list (the API returns it unpaged, in display order), the
 * create/rename dialog and the delete confirmation. After a change, or when the category changed
 * elsewhere, the list is re-read.
 */
export function useCategoryManager() {
  const list = useResource(listManagedCategories, "categories");

  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<ManagedCategory | null>(null);
  const [name, setName] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<ManagedCategory | null>(null);
  const [deleteError, setDeleteError] = useState("");

  function openCreate() {
    setEditing(null);
    setName("");
    setFieldErrors({});
    setFeedback(null);
    setEditorOpen(true);
  }

  function openRename(category: ManagedCategory) {
    setEditing(category);
    setName(category.name);
    setFieldErrors({});
    setFeedback(null);
    setEditorOpen(true);
  }

  /** The category is stale: close whatever was open on it and show the current list. */
  function staleCategory(text: string) {
    setEditorOpen(false);
    setEditing(null);
    setDeleting(null);
    setFeedback({ kind: "error", text });
    list.reload();
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setFieldErrors({});
    setFeedback(null);
    try {
      await saveCategory(editing, name);
      setEditorOpen(false);
      setFeedback({ kind: "success", text: editing ? "Đã đổi tên danh mục." : "Đã tạo danh mục." });
      list.reload();
    } catch (cause) {
      const error = asApiError(cause);
      if (error.is("CONCURRENT_MODIFICATION", "NOT_FOUND")) return staleCategory(error.message);
      setFeedback({ kind: "error", text: error.message });
      setFieldErrors(error.fieldErrors);
    } finally {
      setSaving(false);
    }
  }

  function askToDelete(category: ManagedCategory) {
    setFeedback(null);
    setDeleteError("");
    setDeleting(category);
  }

  async function confirmDelete() {
    if (!deleting) return;
    setSaving(true);
    setDeleteError("");
    try {
      await deleteCategory(deleting);
      setFeedback({ kind: "success", text: `Đã xóa danh mục ${deleting.name}.` });
      setDeleting(null);
      list.reload();
    } catch (cause) {
      const error = asApiError(cause);
      if (error.is("CONCURRENT_MODIFICATION", "NOT_FOUND")) return staleCategory(error.message);
      // Kept in the dialog: the staff member has to change products first, then retry.
      setDeleteError(error.message);
    } finally {
      setSaving(false);
    }
  }

  return {
    // List
    categories: list.data ?? [],
    loading: list.loading && list.data === undefined,
    listError: list.error?.message ?? "",
    reload: list.reload,
    feedback,
    // Create/rename dialog
    editorOpen,
    editing,
    name,
    setName: (value: string) => {
      setName(value);
      setFieldErrors({});
    },
    fieldErrors,
    saving,
    openCreate,
    openRename,
    closeEditor: () => setEditorOpen(false),
    submit,
    // Delete dialog
    deleting,
    deleteError,
    askToDelete,
    closeDelete: () => setDeleting(null),
    confirmDelete,
  };
}
