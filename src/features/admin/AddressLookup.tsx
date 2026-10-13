"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { RequestError, errorText } from "@/lib/api";
import { getAdminAddress, type AdminAddress } from "@/lib/services/admin";

function addressError(error: unknown) {
  if (error instanceof RequestError) {
    if (error.status === 401) return "Vui lòng đăng nhập để tiếp tục.";
    if (error.status === 403) return "Tài khoản của bạn không có quyền xem nội dung này.";
    if (error.errorCode === "ADDRESS_NOT_FOUND") return "Không tìm thấy địa chỉ với mã này.";
  }
  return errorText(error);
}

function Field({ label, value }: { label: string; value: string }) {
  return <p className="text-sm text-text-secondary"><span className="font-semibold text-text-primary">{label}: </span>{value}</p>;
}

export default function AddressLookup() {
  const [addressId, setAddressId] = useState("");
  const [address, setAddress] = useState<AdminAddress | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function lookup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const id = addressId.trim();
    if (!id) return;
    setLoading(true);
    setAddress(null);
    setError("");
    try {
      setAddress(await getAdminAddress(id));
    } catch (reason) {
      setError(addressError(reason));
    } finally {
      setLoading(false);
    }
  }

  return <section className="rounded-2xl border border-neutral-border bg-white p-4 shadow-sm sm:p-6">
    <h2 className="mb-4 font-serif text-xl font-semibold text-text-primary">Find a saved address</h2>
    <form onSubmit={lookup} className="flex flex-col gap-3 sm:flex-row">
      <label className="sr-only" htmlFor="address-id">Mã địa chỉ</label>
      <input id="address-id" value={addressId} onChange={(event) => setAddressId(event.target.value)} placeholder="Nhập mã địa chỉ (UUID)" className="min-w-0 flex-1 rounded-xl border border-neutral-border bg-neutral-canvas px-4 py-3 text-sm outline-none focus:border-primary" />
      <Button disabled={loading || !addressId.trim()} className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed">{loading ? "Đang tìm…" : "Tra cứu"}</Button>
    </form>
    {error && <p role="alert" className="mt-4 text-sm text-primary-deep">{error}</p>}
    {address && <article className="mt-5 rounded-xl border border-neutral-border bg-neutral-canvas p-5">
      <div className="mb-3 flex flex-wrap items-center gap-2"><h3 className="font-serif text-xl font-semibold">{address.receiverName}</h3>{address.isDefault && <span className="rounded-full bg-accent-sage-light px-3 py-1 text-xs font-bold text-text-primary">Mặc định</span>}</div>
      <div className="space-y-2"><Field label="Điện thoại" value={address.phone} /><Field label="Địa chỉ" value={address.address} /><Field label="Mã" value={address.id} /></div>
    </article>}
  </section>;
}
