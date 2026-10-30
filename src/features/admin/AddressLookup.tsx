"use client";

import Button from "@/components/ui/Button";
import InfoLine from "@/features/admin/InfoLine";
import { useAddressLookup } from "@/features/admin/hooks/use-address-lookup";

/** Address workspace: UUID search form first, then the matching saved-address card. */
export default function AddressLookup() {
  const { addressId, setAddressId, address, loading, error, canLookup, lookup } = useAddressLookup();

  return <section className="rounded-2xl border border-neutral-border bg-white p-4 shadow-sm sm:p-6">
    <h2 className="mb-4 font-serif text-xl font-semibold text-text-primary">Find a saved address</h2>
    {/* Address UUID search controls. */}
    <form onSubmit={(event) => void lookup(event)} className="flex flex-col gap-3 sm:flex-row">
      <label className="sr-only" htmlFor="address-id">Mã địa chỉ</label>
      <input id="address-id" value={addressId} onChange={(event) => setAddressId(event.target.value)} placeholder="Nhập mã địa chỉ (UUID)" className="min-w-0 flex-1 rounded-xl border border-neutral-border bg-neutral-canvas px-4 py-3 text-sm outline-none focus:border-primary" />
      <Button disabled={!canLookup} className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed">{loading ? "Đang tìm…" : "Tra cứu"}</Button>
    </form>
    {error && <p role="alert" className="mt-4 text-sm text-primary-deep">{error}</p>}
    {/* Read-only result card shown after a successful lookup. */}
    {address && <article className="mt-5 rounded-xl border border-neutral-border bg-neutral-canvas p-5">
      <div className="mb-3 flex flex-wrap items-center gap-2"><h3 className="font-serif text-xl font-semibold">{address.receiverName}</h3>{address.isDefault && <span className="rounded-full bg-accent-sage-light px-3 py-1 text-xs font-bold text-text-primary">Mặc định</span>}</div>
      <div className="space-y-2"><InfoLine label="Điện thoại" value={address.phone} /><InfoLine label="Địa chỉ" value={address.address} /><InfoLine label="Mã" value={address.id} /></div>
    </article>}
  </section>;
}
