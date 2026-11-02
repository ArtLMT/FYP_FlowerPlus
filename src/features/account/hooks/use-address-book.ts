import { useState, type FormEvent } from "react";
import { asApiError, type FieldErrors } from "@/lib/api";
import { useAsyncAction } from "@/lib/hooks/use-async-action";
import { useResource } from "@/lib/hooks/use-resource";
import {
  deleteAddress,
  getAddresses,
  MAX_ADDRESSES,
  saveAddress,
  setDefaultAddress,
  type AccountAddress,
  type AddressInput,
} from "@/lib/services/addresses";
import { useToast } from "@/components/ui/ToastProvider";

const EMPTY_FORM: AddressInput = { receiverName: "", phone: "", address: "", isDefault: false };

export type AddressListState = "loading" | "error" | "empty" | "ready";

/**
 * The customer's address book on /account/info: the list, the add/edit dialog and the per-address
 * actions. The backend owns validation, ownership, ordering and which address is the default; after
 * every change the list is re-read so it shows exactly what the server stored.
 */
export function useAddressBook() {
  const { showToast } = useToast();
  const list = useResource(getAddresses, "addresses");
  const listAction = useAsyncAction();
  const [form, setForm] = useState<AddressInput>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const addresses = list.data ?? [];
  const busy = saving || listAction.busy;
  const listState: AddressListState = list.loading ? "loading"
    : list.error ? "error"
      : addresses.length === 0 ? "empty"
        : "ready";

  function openForm(id: string | null, values: AddressInput) {
    setEditingId(id);
    setForm(values);
    setFieldErrors({});
    setFormError("");
    listAction.setError(null);
    setFormOpen(true);
  }

  function openCreate() {
    if (!formOpen) openForm(null, EMPTY_FORM);
  }

  function openEdit({ id, receiverName, phone, address, isDefault }: AccountAddress) {
    openForm(id, { receiverName, phone, address, isDefault });
  }

  function closeForm() {
    if (!busy) setFormOpen(false);
  }

  function updateField<K extends keyof AddressInput>(field: K, value: AddressInput[K]) {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: [] }));
    setFormError("");
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setFormError("");
    setFieldErrors({});
    listAction.setError(null);
    try {
      await saveAddress(editingId, form);
      setFormOpen(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
      showToast("success", editingId ? "Đã cập nhật địa chỉ." : "Đã thêm địa chỉ.");
      list.reload();
    } catch (cause) {
      const error = asApiError(cause);
      setFieldErrors(error.fieldErrors);
      setFormError(error.fieldMessages.length ? "" : error.message);
      if (error.is("ADDRESS_NOT_FOUND", "ADDRESS_LIMIT_REACHED")) list.reload();
    } finally {
      setSaving(false);
    }
  }

  const changeAddress = (request: () => Promise<unknown>, success: string) => listAction.run(
    async () => {
      await request();
      showToast("success", success);
      list.reload();
    },
    (error) => {
      if (error.is("ADDRESS_NOT_FOUND")) list.reload();
    },
  );

  return {
    addresses,
    listState,
    listError: list.error?.message ?? "",
    reloadList: list.reload,
    /** "3/20" — shown once the list has loaded. */
    usage: listState === "loading" || listState === "error" ? null : `${addresses.length}/${MAX_ADDRESSES}`,
    canAddAddress: (listState === "empty" || listState === "ready") && addresses.length < MAX_ADDRESSES,
    atLimit: listState === "ready" && addresses.length >= MAX_ADDRESSES,
    actionError: listAction.error ?? "",
    busy,
    remove: (id: string) => changeAddress(() => deleteAddress(id), "Đã xóa địa chỉ."),
    makeDefault: (id: string) => changeAddress(() => setDefaultAddress(id), "Đã đặt địa chỉ mặc định."),
    formOpen,
    editing: editingId !== null,
    form,
    formError,
    fieldErrors,
    openCreate,
    openEdit,
    closeForm,
    updateField,
    save,
  };
}
