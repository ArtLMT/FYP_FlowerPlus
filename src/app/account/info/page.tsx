"use client";

import Button from "@/components/ui/Button";
import ModalDialog from "@/components/ui/ModalDialog";
import { useToast } from "@/components/ui/ToastProvider";
import DetailHeader from "@/features/account/components/DetailHeader";
import { useAccount } from "@/features/account/account-context";
import { RequestError, errorText, type ValidationFieldError } from "@/lib/api";
import {
  createAddress,
  deleteAddress,
  getAddresses,
  setDefaultAddress,
  updateAddress,
  type AccountAddress,
  type AddressInput,
} from "@/lib/services/addresses";
import { useCallback, useEffect, useState } from "react";

const maxAddresses = 20;
const emptyAddress: AddressInput = {
  receiverName: "",
  phone: "",
  address: "",
  isDefault: false,
};

const fieldLabels: Record<string, string> = {
  receiverName: "Tên người nhận",
  phone: "Số điện thoại",
  address: "Địa chỉ",
};

function validationMessage(field: ValidationFieldError) {
  const label = fieldLabels[field.field] ?? "Thông tin";
  if (field.rule === "NotBlank") return `${label} là bắt buộc.`;
  if (field.rule === "Pattern") return `${label} không đúng định dạng.`;
  if (field.rule === "Size") return `${label} vượt quá độ dài cho phép.`;
  return `${label} chưa hợp lệ.`;
}

function mapFieldErrors(fields: ValidationFieldError[] = []) {
  const errorsByField = fields.reduce<Record<string, ValidationFieldError[]>>((errors, field) => {
    errors[field.field] = [...(errors[field.field] ?? []), field];
    return errors;
  }, {});

  return Object.fromEntries(Object.entries(errorsByField).map(([name, fieldErrors]) => {
    const hasRequiredError = fieldErrors.some((field) => field.rule === "NotBlank");
    const visibleErrors = hasRequiredError
      ? fieldErrors.filter((field) => field.rule === "NotBlank")
      : fieldErrors;
    return [name, visibleErrors.map(validationMessage)];
  }));
}

function AccountRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex justify-between gap-4 border-t border-neutral-border py-[18px]">
      <span className="font-sans text-body-lg text-text-primary">{label}</span>
      <span className="text-right font-sans text-body-lg text-text-secondary">{value || "—"}</span>
    </div>
  );
}

function AddressFieldError({ name, messages }: { name: string; messages?: string[] }) {
  if (!messages?.length) return null;
  return (
    <div id={`${name}-error`} className="text-sm font-normal text-red-700">
      {messages.map((message) => <p key={message}>{message}</p>)}
    </div>
  );
}

export default function AccountInfoPage() {
  const user = useAccount();
  const [addresses, setAddresses] = useState<AccountAddress[]>([]);
  const [form, setForm] = useState<AddressInput>(emptyAddress);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [busy, setBusy] = useState(false);
  const [listError, setListError] = useState("");
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [actionError, setActionError] = useState("");
  const { showToast } = useToast();

  const loadAddresses = useCallback(async () => {
    setLoadingAddresses(true);
    setListError("");
    try {
      setAddresses(await getAddresses());
    } catch (cause) {
      setListError(errorText(cause));
    } finally {
      setLoadingAddresses(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    getAddresses()
      .then((result) => {
        if (!active) return;
        setAddresses(result);
        setListError("");
      })
      .catch((cause) => {
        if (active) setListError(errorText(cause));
      })
      .finally(() => {
        if (active) setLoadingAddresses(false);
      });
    return () => { active = false; };
  }, []);

  function openCreate() {
    if (formOpen) return;
    setEditingId(null);
    setForm(emptyAddress);
    setFieldErrors({});
    setFormError("");
    setActionError("");
    setFormOpen(true);
  }

  function openEdit(address: AccountAddress) {
    setEditingId(address.id);
    setForm({
      receiverName: address.receiverName,
      phone: address.phone,
      address: address.address,
      isDefault: address.isDefault,
    });
    setFieldErrors({});
    setFormError("");
    setActionError("");
    setFormOpen(true);
  }

  async function saveAddress(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setFormError("");
    setActionError("");
    setFieldErrors({});

    const input: AddressInput = {
      ...form,
      receiverName: form.receiverName.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
    };

    try {
      if (editingId) await updateAddress(editingId, input);
      else await createAddress(input);

      setFormOpen(false);
      setEditingId(null);
      setForm(emptyAddress);
      showToast("success", editingId ? "Đã cập nhật địa chỉ." : "Đã thêm địa chỉ.");
      await loadAddresses();
    } catch (cause) {
      if (cause instanceof RequestError && cause.errorCode === "VALIDATION_FAILED") {
        const errors = mapFieldErrors(cause.details?.fields);
        setFieldErrors(errors);
        if (Object.keys(errors).length === 0) setFormError(errorText(cause));
      } else {
        setFormError(errorText(cause));
      }
      if (cause instanceof RequestError && (cause.errorCode === "ADDRESS_NOT_FOUND" || cause.errorCode === "ADDRESS_LIMIT_REACHED")) {
        await loadAddresses();
      }
    } finally {
      setBusy(false);
    }
  }

  async function removeAddress(id: string) {
    setBusy(true);
    setActionError("");
    try {
      await deleteAddress(id);
      showToast("success", "Đã xóa địa chỉ.");
      await loadAddresses();
    } catch (cause) {
      setActionError(errorText(cause));
      if (cause instanceof RequestError && cause.errorCode === "ADDRESS_NOT_FOUND") {
        await loadAddresses();
      }
    } finally {
      setBusy(false);
    }
  }

  async function makeDefault(id: string) {
    setBusy(true);
    setActionError("");
    try {
      await setDefaultAddress(id);
      showToast("success", "Đã đặt địa chỉ mặc định.");
      await loadAddresses();
    } catch (cause) {
      setActionError(errorText(cause));
      if (cause instanceof RequestError && cause.errorCode === "ADDRESS_NOT_FOUND") {
        await loadAddresses();
      }
    } finally {
      setBusy(false);
    }
  }

  function updateField<K extends keyof AddressInput>(field: K, value: AddressInput[K]) {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: [] }));
    setFormError("");
  }

  const canAddAddress = !loadingAddresses && !listError && addresses.length < maxAddresses;

  return (
    <div className="flex min-h-dvh flex-col bg-neutral-canvas md:min-h-0 md:block md:bg-transparent">
      <DetailHeader title="Thông tin tài khoản" />
      <div className="flex-1 overflow-y-auto px-[22px] pb-8 md:px-0">
        <p className="mt-6 font-sans text-body-sm font-bold tracking-badge text-text-muted">THÔNG TIN NGƯỜI DÙNG</p>
        <AccountRow label="Tên đăng nhập" value={user.username} />
        <AccountRow label="Họ và tên" value={user.fullName} />
        <AccountRow label="Email" value={user.email} />
        <AccountRow label="Số điện thoại" value={user.phone} />

        <div className="mt-8 flex items-center justify-between gap-3">
          <p className="font-sans text-body-sm font-bold tracking-badge text-text-muted">SỔ ĐỊA CHỈ</p>
          {!loadingAddresses && !listError && <span className="text-sm text-text-muted">{addresses.length}/{maxAddresses}</span>}
        </div>

        {actionError && <p role="alert" className="mt-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{actionError}</p>}

        {loadingAddresses && <p className="py-8 text-center text-sm text-text-muted">Đang tải sổ địa chỉ…</p>}
        {!loadingAddresses && listError && <div className="mt-3 rounded-xl border border-neutral-border bg-white p-5 text-center">
          <p role="alert" className="text-sm text-red-700">{listError}</p>
          <Button type="button" onClick={() => void loadAddresses()} className="mt-3 rounded-lg border border-neutral-border px-4 py-2 text-sm font-semibold text-text-secondary" disabled={busy}>Thử tải lại</Button>
        </div>}
        {!loadingAddresses && !listError && addresses.length === 0 && <p className="mt-3 rounded-xl border border-dashed border-neutral-border px-5 py-8 text-center text-sm text-text-muted">Bạn chưa lưu địa chỉ nào.</p>}

        {!loadingAddresses && !listError && addresses.length > 0 && <div className="mt-4 flex flex-col gap-[18px]">
          {addresses.map((address) => (
            <article key={address.id} className="rounded-2xl border border-neutral-border bg-neutral-raised p-[22px]">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-serif text-heading-md font-medium text-text-primary">{address.receiverName}</h2>
                {address.isDefault && <span className="rounded-[7px] bg-tertiary px-3 py-[5px] font-sans text-label font-bold text-primary">MẶC ĐỊNH</span>}
              </div>
              <p className="break-words font-sans text-body-lg text-text-secondary">{address.address}</p>
              <p className="mt-1 font-sans text-body-lg text-text-secondary">SĐT: {address.phone}</p>
              <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-neutral-border pt-4">
                <Button type="button" disabled={busy} onClick={() => openEdit(address)} className="font-semibold text-primary">Sửa</Button>
                <Button type="button" disabled={busy} onClick={() => void removeAddress(address.id)} className="font-semibold text-text-secondary">Xóa</Button>
                {!address.isDefault && <Button type="button" disabled={busy} onClick={() => void makeDefault(address.id)} className="ml-auto font-semibold text-primary underline">Đặt mặc định</Button>}
              </div>
            </article>
          ))}
        </div>}

        {formOpen && <ModalDialog
          title={editingId ? "Sửa địa chỉ" : "Thêm địa chỉ"}
          onClose={() => { if (!busy) setFormOpen(false); }}
          footer={<div className="flex justify-end gap-3">
            <Button type="button" disabled={busy} onClick={() => setFormOpen(false)} className="rounded-lg border border-neutral-border bg-white px-5 py-2.5 text-sm font-semibold text-text-secondary">Hủy</Button>
            <Button type="submit" form="address-form" disabled={busy} className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover">{busy ? "Đang lưu…" : "Lưu"}</Button>
          </div>}
        >
          <form id="address-form" onSubmit={saveAddress} className="flex flex-col gap-3">
            {formError && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{formError}</p>}
            <label className="flex flex-col gap-1 text-sm font-semibold text-text-secondary">
              Tên người nhận
              <input aria-invalid={Boolean(fieldErrors.receiverName?.length)} aria-describedby={fieldErrors.receiverName?.length ? "receiverName-error" : undefined} value={form.receiverName} onChange={(event) => updateField("receiverName", event.target.value)} className={`rounded-lg border bg-white p-3 font-normal outline-none focus:border-primary ${fieldErrors.receiverName?.length ? "border-red-500" : "border-neutral-border"}`} />
              <AddressFieldError name="receiverName" messages={fieldErrors.receiverName} />
            </label>
            <label className="flex flex-col gap-1 text-sm font-semibold text-text-secondary">
              Số điện thoại
              <input aria-invalid={Boolean(fieldErrors.phone?.length)} aria-describedby={fieldErrors.phone?.length ? "phone-error" : undefined} value={form.phone} onChange={(event) => updateField("phone", event.target.value)} className={`rounded-lg border bg-white p-3 font-normal outline-none focus:border-primary ${fieldErrors.phone?.length ? "border-red-500" : "border-neutral-border"}`} />
              <AddressFieldError name="phone" messages={fieldErrors.phone} />
            </label>
            <label className="flex flex-col gap-1 text-sm font-semibold text-text-secondary">
              Địa chỉ
              <textarea aria-invalid={Boolean(fieldErrors.address?.length)} aria-describedby={fieldErrors.address?.length ? "address-error" : undefined} value={form.address} onChange={(event) => updateField("address", event.target.value)} rows={3} className={`rounded-lg border bg-white p-3 font-normal outline-none focus:border-primary ${fieldErrors.address?.length ? "border-red-500" : "border-neutral-border"}`} />
              <AddressFieldError name="address" messages={fieldErrors.address} />
            </label>
            <label className="flex items-center gap-2 text-sm text-text-secondary">
              <input type="checkbox" checked={form.isDefault} onChange={(event) => updateField("isDefault", event.target.checked)} />
              Đặt làm mặc định
            </label>
          </form>
        </ModalDialog>}

        {canAddAddress && !formOpen && <Button type="button" disabled={busy} onClick={openCreate} className="mt-7 w-full rounded-xl bg-primary py-[18px] font-bold text-white hover:bg-primary-hover">THÊM ĐỊA CHỈ MỚI</Button>}
        {!loadingAddresses && !listError && addresses.length >= maxAddresses && <p className="mt-4 text-center text-sm text-text-muted">Bạn đã lưu tối đa 20 địa chỉ.</p>}
      </div>
    </div>
  );
}
