"use client";

import Link from "next/link";
import Button from "@/components/ui/Button";
import ModalDialog from "@/components/ui/ModalDialog";
import DetailHeader from "@/features/account/components/DetailHeader";
import { useAccount } from "@/features/account/account-context";
import { useAddressBook } from "@/features/account/hooks/use-address-book";
import type { AddressInput } from "@/lib/services/addresses";

/** One "label ……… value" row in the user-information list. */
function AccountRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex justify-between gap-4 border-t border-neutral-border py-[18px]">
      <span className="font-sans text-body-lg text-text-primary">{label}</span>
      <span className="text-right font-sans text-body-lg text-text-secondary">{value || "—"}</span>
    </div>
  );
}

/** One labelled input/textarea in the address modal, with its validation messages underneath. */
function AddressField({
  name,
  label,
  value,
  messages,
  multiline = false,
  onChange,
}: {
  name: Exclude<keyof AddressInput, "isDefault">;
  label: string;
  value: string;
  messages?: string[];
  multiline?: boolean;
  onChange: (value: string) => void;
}) {
  const invalid = Boolean(messages?.length);
  const inputProps = {
    "aria-invalid": invalid,
    "aria-describedby": invalid ? `${name}-error` : undefined,
    value,
    className: `rounded-lg border bg-white p-3 font-normal outline-none focus:border-primary ${invalid ? "border-red-500" : "border-neutral-border"}`,
  };

  return (
    <label className="flex flex-col gap-1 text-sm font-semibold text-text-secondary">
      {label}
      {multiline
        ? <textarea {...inputProps} onChange={(event) => onChange(event.target.value)} rows={3} />
        : <input {...inputProps} onChange={(event) => onChange(event.target.value)} />}
      {invalid && (
        <div id={`${name}-error`} className="text-sm font-normal text-red-700">
          {messages?.map((message) => <p key={message}>{message}</p>)}
        </div>
      )}
    </label>
  );
}

/**
 * Account info — /account/info.
 * UI map: mobile back-bar → user-information rows → password-reset card → address-book heading
 * → address cards (or loading/error/empty state) → add/edit address modal → "THÊM ĐỊA CHỈ MỚI".
 * Address-book state and API calls live in `features/account/hooks/use-address-book.ts`.
 */
export default function AccountInfoPage() {
  const user = useAccount();
  const book = useAddressBook();

  return (
    <div className="flex min-h-dvh flex-col bg-neutral-canvas md:min-h-0 md:block md:bg-transparent">
      {/* Mobile-only back-bar; desktop uses the account layout title. */}
      <DetailHeader title="Thông tin tài khoản" />
      <div className="flex-1 overflow-y-auto px-[22px] pb-8 md:px-0">
        {/* Read-only user information. */}
        <p className="mt-6 font-sans text-body-sm font-bold tracking-badge text-text-muted">THÔNG TIN NGƯỜI DÙNG</p>
        <AccountRow label="Tên đăng nhập" value={user.username} />
        <AccountRow label="Họ và tên" value={user.fullName} />
        <AccountRow label="Email" value={user.email} />
        <AccountRow label="Số điện thoại" value={user.phone} />

        {/* Security card with link to the password-reset screen. */}
        <section className="mt-8 rounded-2xl border border-neutral-border bg-neutral-raised p-5 sm:p-6">
          <p className="font-sans text-body-sm font-bold tracking-badge text-text-muted">BẢO MẬT TÀI KHOẢN</p>
          <h2 className="mt-3 font-serif text-heading-md font-medium text-text-primary">Đặt lại mật khẩu</h2>
          <p className="mt-2 max-w-2xl font-sans text-sm leading-relaxed text-text-secondary">
            Xác nhận bằng mã gửi đến email tài khoản. Sau khi đặt lại, bạn cần đăng nhập lại trên thiết bị này và các thiết bị khác.
          </p>
          <Link
            href="/account/info/password-reset"
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-5 py-3 font-sans text-sm font-bold text-white no-underline transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Đặt lại mật khẩu
          </Link>
        </section>

        {/* Address-book heading and "N/20" usage count. */}
        <div className="mt-8 flex items-center justify-between gap-3">
          <p className="font-sans text-body-sm font-bold tracking-badge text-text-muted">SỔ ĐỊA CHỈ</p>
          {book.usage && <span className="text-sm text-text-muted">{book.usage}</span>}
        </div>

        {/* Error from the last edit/delete/set-default action. */}
        {book.actionError && <p role="alert" className="mt-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{book.actionError}</p>}

        {/* Loading, error-with-retry, and empty states for the address list. */}
        {book.listState === "loading" && <p className="py-8 text-center text-sm text-text-muted">Đang tải sổ địa chỉ…</p>}
        {book.listState === "error" && <div className="mt-3 rounded-xl border border-neutral-border bg-white p-5 text-center">
          <p role="alert" className="text-sm text-red-700">{book.listError}</p>
          <Button type="button" onClick={book.reloadList} className="mt-3 rounded-lg border border-neutral-border px-4 py-2 text-sm font-semibold text-text-secondary" disabled={book.busy}>Thử tải lại</Button>
        </div>}
        {book.listState === "empty" && <p className="mt-3 rounded-xl border border-dashed border-neutral-border px-5 py-8 text-center text-sm text-text-muted">Bạn chưa lưu địa chỉ nào.</p>}

        {/* Address cards: receiver, default badge, address, phone, and Edit/Delete/Set-default actions. */}
        {book.listState === "ready" && <div className="mt-4 flex flex-col gap-[18px]">
          {book.addresses.map((address) => (
            <article key={address.id} className="rounded-2xl border border-neutral-border bg-neutral-raised p-[22px]">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-serif text-heading-md font-medium text-text-primary">{address.receiverName}</h2>
                {address.isDefault && <span className="rounded-[7px] bg-tertiary px-3 py-[5px] font-sans text-label font-bold text-primary">MẶC ĐỊNH</span>}
              </div>
              <p className="break-words font-sans text-body-lg text-text-secondary">{address.address}</p>
              <p className="mt-1 font-sans text-body-lg text-text-secondary">SĐT: {address.phone}</p>
              <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-neutral-border pt-4">
                <Button type="button" disabled={book.busy} onClick={() => book.openEdit(address)} className="font-semibold text-primary">Sửa</Button>
                <Button type="button" disabled={book.busy} onClick={() => void book.remove(address.id)} className="font-semibold text-text-secondary">Xóa</Button>
                {!address.isDefault && <Button type="button" disabled={book.busy} onClick={() => void book.makeDefault(address.id)} className="ml-auto font-semibold text-primary underline">Đặt mặc định</Button>}
              </div>
            </article>
          ))}
        </div>}

        {/* Add/Edit address modal; Cancel/Save buttons are in its footer. */}
        {book.formOpen && <ModalDialog
          title={book.editing ? "Sửa địa chỉ" : "Thêm địa chỉ"}
          onClose={book.closeForm}
          footer={<div className="flex justify-end gap-3">
            <Button type="button" disabled={book.busy} onClick={book.closeForm} className="rounded-lg border border-neutral-border bg-white px-5 py-2.5 text-sm font-semibold text-text-secondary">Hủy</Button>
            <Button type="submit" form="address-form" disabled={book.busy} className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover">{book.busy ? "Đang lưu…" : "Lưu"}</Button>
          </div>}
        >
          <form id="address-form" onSubmit={(event) => void book.save(event)} className="flex flex-col gap-3">
            {book.formError && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{book.formError}</p>}
            <AddressField name="receiverName" label="Tên người nhận" value={book.form.receiverName} messages={book.fieldErrors.receiverName} onChange={(value) => book.updateField("receiverName", value)} />
            <AddressField name="phone" label="Số điện thoại" value={book.form.phone} messages={book.fieldErrors.phone} onChange={(value) => book.updateField("phone", value)} />
            <AddressField name="address" label="Địa chỉ" value={book.form.address} messages={book.fieldErrors.address} multiline onChange={(value) => book.updateField("address", value)} />
            <label className="flex items-center gap-2 text-sm text-text-secondary">
              <input type="checkbox" checked={book.form.isDefault} onChange={(event) => book.updateField("isDefault", event.target.checked)} />
              Đặt làm mặc định
            </label>
          </form>
        </ModalDialog>}

        {/* Add-address button, or the 20-address limit notice. */}
        {book.canAddAddress && !book.formOpen && <Button type="button" disabled={book.busy} onClick={book.openCreate} className="mt-7 w-full rounded-xl bg-primary py-[18px] font-bold text-white hover:bg-primary-hover">THÊM ĐỊA CHỈ MỚI</Button>}
        {book.atLimit && <p className="mt-4 text-center text-sm text-text-muted">Bạn đã lưu tối đa 20 địa chỉ.</p>}
      </div>
    </div>
  );
}
