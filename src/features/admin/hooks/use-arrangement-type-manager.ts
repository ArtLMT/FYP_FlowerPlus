import { useState, type FormEvent } from "react";
import { asApiError, type FieldErrors } from "@/lib/api";
import { useResource } from "@/lib/hooks/use-resource";
import {
  listArrangementTypes,
  saveArrangementType,
  setArrangementTypeActive,
  type ArrangementType,
} from "@/lib/services/arrangement-types";

type Feedback = { kind: "success" | "error"; text: string };

/**
 * Admin arrangement types (T-ORD-13): the list (Active first), the create/edit dialog and the
 * deactivate/reactivate confirmation. A stale version closes the dialog and re-reads the list.
 */
export function useArrangementTypeManager() {
  const list = useResource(listArrangementTypes, "arrangement-types");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<ArrangementType | null>(null);
  const [name, setName] = useState("");
  const [labourFee, setLabourFee] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState<ArrangementType | null>(null);

  function openEditor(type: ArrangementType | null) {
    setEditing(type);
    setName(type?.name ?? "");
    setLabourFee(type ? String(type.labourFee) : "");
    setFieldErrors({});
    setFeedback(null);
    setEditorOpen(true);
  }

  function stale(text: string) {
    setEditorOpen(false);
    setToggling(null);
    setFeedback({ kind: "error", text });
    list.reload();
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setFieldErrors({});
    setFeedback(null);
    try {
      await saveArrangementType(editing, name, Number(labourFee));
      setEditorOpen(false);
      setFeedback({ kind: "success", text: editing ? "Đã cập nhật kiểu cắm." : "Đã tạo kiểu cắm." });
      list.reload();
    } catch (cause) {
      const error = asApiError(cause);
      if (error.is("CONCURRENT_MODIFICATION", "ARRANGEMENT_TYPE_NOT_FOUND")) return stale(error.message);
      setFeedback({ kind: "error", text: error.message });
      setFieldErrors(error.fieldErrors);
    } finally {
      setSaving(false);
    }
  }

  async function confirmToggle() {
    if (!toggling) return;
    const activate = toggling.status !== "ACTIVE";
    setSaving(true);
    setFeedback(null);
    try {
      await setArrangementTypeActive(toggling, activate);
      setFeedback({ kind: "success", text: activate ? `Đã mở lại ${toggling.name}.` : `Đã ngừng ${toggling.name}.` });
      setToggling(null);
      list.reload();
    } catch (cause) {
      stale(asApiError(cause).message);
    } finally {
      setSaving(false);
    }
  }

  return {
    types: list.data ?? [],
    loading: list.loading && list.data === undefined,
    listError: list.error?.message ?? "",
    reload: list.reload,
    feedback,
    editorOpen,
    editing,
    name,
    setName,
    labourFee,
    setLabourFee,
    fieldErrors,
    saving,
    openEditor,
    closeEditor: () => setEditorOpen(false),
    submit,
    toggling,
    askToToggle: (type: ArrangementType) => {
      setFeedback(null);
      setToggling(type);
    },
    closeToggle: () => setToggling(null),
    confirmToggle,
  };
}
