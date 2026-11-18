"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { useResource } from "@/lib/hooks/use-resource";
import { asApiError } from "@/lib/api";
import { assignManagedVoucher, createManagedVoucher, listManagedVouchers, setManagedVoucherActive, updateManagedVoucher, type ManagedVoucher } from "@/lib/services/vouchers";
import { instantToShopWallTime, shopWallTimeToInstant, voucherLastValidShopDate } from "@/lib/utils";

export default function VoucherManager() {
  const resource = useResource(listManagedVouchers, "promotion:managed-vouchers");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<{ voucher: ManagedVoucher; discountType: string; discountValue: string; minimumOrderAmount: string; activeFrom: string; expiresOn: string; maxRedemptions: string; audience: string } | null>(null);
  const [form, setForm] = useState({ code: "", discountType: "FIXED", discountValue: "", minimumOrderAmount: "0", activeFrom: "", expiresOn: "", maxRedemptions: "", audience: "PUBLIC" });
  async function create(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    try {
      await createManagedVoucher({ ...form, code: form.code.trim().toUpperCase(), discountValue: Number(form.discountValue), minimumOrderAmount: Number(form.minimumOrderAmount), activeFrom: form.activeFrom ? shopWallTimeToInstant(form.activeFrom) : null, maxRedemptions: Number(form.maxRedemptions) });
      setForm({ ...form, code: "", discountValue: "", minimumOrderAmount: "0", activeFrom: "", expiresOn: "", maxRedemptions: "" }); resource.reload(); setMessage("Đã tạo mã giảm giá ở trạng thái chưa kích hoạt.");
    } catch (cause) { setError(asApiError(cause).message); } finally { setBusy(false); }
  }
  async function toggle(voucher: ManagedVoucher) {
    setBusy(true); setError(""); setMessage("");
    try { await setManagedVoucherActive(voucher.id, voucher.version, voucher.status !== "ACTIVE"); resource.reload(); }
    catch (cause) { setError(asApiError(cause).message); }
    finally { setBusy(false); }
  }
  async function assign(voucher: ManagedVoucher, email: string) {
    setBusy(true); setError(""); setMessage("");
    try { const result = await assignManagedVoucher(voucher.id, email); setMessage(result.matched ? `Đã gán mã cho ${result.email}.` : "Không tìm thấy tài khoản Customer đủ điều kiện cho email này."); resource.reload(); }
    catch (cause) { setError(asApiError(cause).message); }
    finally { setBusy(false); }
  }
  async function saveEdit(event: React.FormEvent) {
    event.preventDefault(); if (!editing) return;
    setBusy(true); setError(""); setMessage("");
    try {
      await updateManagedVoucher(editing.voucher.id, {
        version: editing.voucher.version, discountType: editing.discountType,
        discountValue: Number(editing.discountValue), minimumOrderAmount: Number(editing.minimumOrderAmount),
        activeFrom: shopWallTimeToInstant(editing.activeFrom), expiresOn: editing.expiresOn,
        maxRedemptions: Number(editing.maxRedemptions), audience: editing.audience,
      });
      setEditing(null); resource.reload(); setMessage("Đã cập nhật voucher.");
    } catch (cause) { setError(asApiError(cause).message); } finally { setBusy(false); }
  }
  function editVoucher(voucher: ManagedVoucher) {
    setEditing({ voucher, discountType: voucher.discountType, discountValue: String(voucher.discountValue), minimumOrderAmount: String(voucher.minimumOrderAmount), activeFrom: instantToShopWallTime(voucher.activeFrom), expiresOn: voucherLastValidShopDate(voucher.expiresAt), maxRedemptions: String(voucher.maxRedemptions), audience: voucher.audience });
  }
  const fields = [
    ["code", "Mã voucher", "text"], ["discountValue", "Giá trị giảm", "number"], ["minimumOrderAmount", "Đơn tối thiểu", "number"], ["activeFrom", "Bắt đầu (giờ Việt Nam; để trống = ngay)", "datetime-local"], ["expiresOn", "Ngày hết hạn", "date"], ["maxRedemptions", "Giới hạn lượt", "number"],
  ] as const;
  return <div className="space-y-6">
    <form onSubmit={create} className="grid gap-3 rounded-2xl border border-neutral-border bg-white p-5 shadow-sm sm:grid-cols-2 xl:grid-cols-3">
      <h2 className="sm:col-span-2 xl:col-span-3 font-serif text-2xl">Tạo voucher</h2>
      {fields.map(([key, label, type]) => <label key={key} className="flex flex-col gap-1 text-sm font-semibold text-text-secondary">{label}<input required={!(["activeFrom"].includes(key))} type={type} min={type === "number" ? (key === "maxRedemptions" ? "1" : "0") : undefined} step={type === "number" ? "1" : undefined} value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} className="rounded-lg border border-neutral-border px-3 py-2" /></label>)}
      <label className="flex flex-col gap-1 text-sm font-semibold text-text-secondary">Loại giảm<select value={form.discountType} onChange={(event) => setForm({ ...form, discountType: event.target.value })} className="rounded-lg border border-neutral-border px-3 py-2"><option value="FIXED">Số tiền</option><option value="PERCENTAGE">Phần trăm</option></select></label>
      <label className="flex flex-col gap-1 text-sm font-semibold text-text-secondary">Đối tượng<select value={form.audience} onChange={(event) => setForm({ ...form, audience: event.target.value })} className="rounded-lg border border-neutral-border px-3 py-2"><option value="PUBLIC">Công khai</option><option value="ASSIGNED">Được gán</option></select></label>
      <div className="flex items-end"><Button disabled={busy} className="min-h-11 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white">Tạo voucher</Button></div>
    </form>
    {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}{message && <p role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-800">{message}</p>}
    {resource.error && <p role="alert" className="text-primary">{resource.error.message}</p>}
    <div className="space-y-3">{resource.data?.content.map((voucher) => <article key={voucher.id} className="rounded-2xl border border-neutral-border bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="m-0 text-lg font-bold">{voucher.code}</h3><p className="m-0 mt-1 text-sm text-text-muted">{voucher.discountType === "PERCENTAGE" ? `${voucher.discountValue}%` : `${voucher.discountValue.toLocaleString("vi-VN")} ₫`} · {voucher.state} · {voucher.unreleasedRedemptions}/{voucher.maxRedemptions} lượt đang giữ</p></div><div className="flex gap-2"><Button disabled={busy} onClick={() => editVoucher(voucher)} className="rounded-lg border border-neutral-border px-4 py-2 text-sm font-semibold">Sửa</Button><Button disabled={busy || voucher.state === "EXPIRED"} onClick={() => void toggle(voucher)} className="rounded-lg border border-neutral-border px-4 py-2 text-sm font-semibold">{voucher.status === "ACTIVE" ? "Tắt" : "Kích hoạt"}</Button></div></div>
      {editing?.voucher.id === voucher.id && <form onSubmit={(event) => void saveEdit(event)} className="mt-4 grid gap-3 rounded-xl bg-neutral-canvas p-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-xs font-semibold">Loại<select value={editing.discountType} onChange={(event) => setEditing({ ...editing, discountType: event.target.value })} className="rounded border px-2 py-2"><option value="FIXED">Số tiền</option><option value="PERCENTAGE">Phần trăm</option></select></label>
        {([ ["discountValue", "Giá trị giảm", "number"], ["minimumOrderAmount", "Đơn tối thiểu", "number"], ["activeFrom", "Bắt đầu (giờ Việt Nam)", "datetime-local"], ["expiresOn", "Ngày hết hạn", "date"], ["maxRedemptions", "Giới hạn lượt", "number"] ] as const).map(([key, label, type]) => <label key={key} className="flex flex-col gap-1 text-xs font-semibold">{label}<input required type={type} min={type === "number" ? (key === "maxRedemptions" ? "1" : "0") : undefined} step={type === "number" ? "1" : undefined} value={editing[key]} onChange={(event) => setEditing({ ...editing, [key]: event.target.value })} className="rounded border px-2 py-2" /></label>)}
        <label className="flex flex-col gap-1 text-xs font-semibold">Đối tượng<select value={editing.audience} onChange={(event) => setEditing({ ...editing, audience: event.target.value })} className="rounded border px-2 py-2"><option value="PUBLIC">Công khai</option><option value="ASSIGNED">Được gán</option></select></label>
        <div className="flex items-end gap-2"><Button disabled={busy} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">Lưu</Button><Button type="button" onClick={() => setEditing(null)} className="rounded-lg border border-neutral-border px-4 py-2 text-sm font-semibold">Hủy</Button></div>
      </form>}
      {voucher.audience === "ASSIGNED" && <form className="mt-4 flex gap-2" onSubmit={(event) => { event.preventDefault(); const email = new FormData(event.currentTarget).get("email"); if (typeof email === "string" && email.trim()) void assign(voucher, email.trim()); }}><input name="email" type="email" required placeholder="Email Customer" className="min-w-0 flex-1 rounded-lg border border-neutral-border px-3 py-2"/><Button disabled={busy} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">Gán</Button></form>}
    </article>)}</div>
  </div>;
}
