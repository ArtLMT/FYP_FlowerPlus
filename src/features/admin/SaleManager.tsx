"use client";

import { useFeedbackToast } from "@/lib/hooks/use-feedback-toast";
import { useState } from "react";
import Button from "@/components/ui/Button";
import { useSaleManager } from "@/features/admin/hooks/use-sale-manager";
import { formatMoney } from "@/features/admin/product-labels";
import type { Sale, SaleDiscountType } from "@/lib/services/sales";
import { SkeletonRows } from "@/components/ui/Skeleton";

const stateLabels = { UPCOMING: "Sắp diễn ra", RUNNING: "Đang chạy", FINISHED: "Đã kết thúc", ENDED: "Đã dừng sớm" } as const;

function localInput(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

function Form({ sale, products, busy, onCancel, onSave }: {
  sale?: Sale;
  products: ReturnType<typeof useSaleManager>["products"];
  busy: boolean;
  onCancel: () => void;
  onSave: (input: { productId?: string; discountType: SaleDiscountType; discountValue: number; startsAt: string; endsAt: string }, sale?: Sale) => void;
}) {
  const [productId, setProductId] = useState(sale?.productId ?? "");
  const [discountType, setDiscountType] = useState<SaleDiscountType>(sale?.discountType ?? "PERCENTAGE");
  const [discountValue, setDiscountValue] = useState(String(sale?.discountValue ?? ""));
  const [startsAt, setStartsAt] = useState(localInput(sale?.startsAt));
  const [endsAt, setEndsAt] = useState(localInput(sale?.endsAt));

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!startsAt || !endsAt || (!sale && !productId)) return;
    onSave({
      productId: sale ? undefined : productId,
      discountType,
      discountValue: Number(discountValue),
      startsAt: new Date(startsAt).toISOString(),
      endsAt: new Date(endsAt).toISOString(),
    }, sale);
  }

  return <form onSubmit={submit} className="grid gap-3 rounded-xl border border-neutral-border bg-neutral-surface p-4 md:grid-cols-2">
    {!sale && <label className="grid gap-1 text-sm font-semibold text-text-secondary md:col-span-2">Sản phẩm
      <select required value={productId} onChange={(event) => setProductId(event.target.value)} className="min-h-11 rounded-lg border border-neutral-border bg-white px-3 text-text-primary">
        <option value="">Chọn sản phẩm đang bán</option>{products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
      </select>
    </label>}
    <label className="grid gap-1 text-sm font-semibold text-text-secondary">Loại giảm giá
      <select value={discountType} disabled={sale?.state === "RUNNING"} onChange={(event) => setDiscountType(event.target.value as SaleDiscountType)} className="min-h-11 rounded-lg border border-neutral-border bg-white px-3 text-text-primary">
        <option value="PERCENTAGE">Phần trăm</option><option value="FIXED">Số tiền cố định</option>
      </select>
    </label>
    <label className="grid gap-1 text-sm font-semibold text-text-secondary">Mức giảm
      <input required type="number" min="1" step="1" value={discountValue} disabled={sale?.state === "RUNNING"} onChange={(event) => setDiscountValue(event.target.value)} className="min-h-11 rounded-lg border border-neutral-border bg-white px-3 text-text-primary" />
    </label>
    <label className="grid gap-1 text-sm font-semibold text-text-secondary">Bắt đầu
      <input required type="datetime-local" value={startsAt} disabled={sale?.state === "RUNNING"} onChange={(event) => setStartsAt(event.target.value)} className="min-h-11 rounded-lg border border-neutral-border bg-white px-3 text-text-primary" />
    </label>
    <label className="grid gap-1 text-sm font-semibold text-text-secondary">Kết thúc
      <input required type="datetime-local" value={endsAt} onChange={(event) => setEndsAt(event.target.value)} className="min-h-11 rounded-lg border border-neutral-border bg-white px-3 text-text-primary" />
    </label>
    <div className="flex gap-2 md:col-span-2"><Button type="submit" disabled={busy || (!sale && products.length === 0)} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">{busy ? "Đang lưu…" : sale ? "Lưu thay đổi" : "Tạo chương trình"}</Button><Button type="button" onClick={onCancel} className="rounded-lg border border-neutral-border px-4 py-2 text-sm font-semibold">Đóng</Button></div>
  </form>;
}

/** Staff/Admin sale schedule screen. Sale rules and current price are always confirmed by the backend. */
export default function SaleManager() {
  const manager = useSaleManager();
  useFeedbackToast("error", manager.error);
  useFeedbackToast("success", manager.success);
  const [formSale, setFormSale] = useState<Sale | null>(null);
  const [creating, setCreating] = useState(false);

  return <section className="space-y-4 rounded-2xl border border-neutral-border bg-white p-4 shadow-sm sm:p-6">
    <header className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="m-0 font-serif text-2xl text-text-primary">Chương trình giảm giá</h2><p className="mb-0 mt-1 text-sm text-text-secondary">Lịch giảm giá tự áp dụng khi sản phẩm đang được mở bán.</p></div><Button type="button" onClick={() => { setCreating(true); setFormSale(null); }} className="min-h-11 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white">Tạo chương trình</Button></header>
    {manager.loadError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{manager.loadError}</p>}
    {(creating || formSale) && <Form key={formSale?.id ?? "new"} sale={formSale ?? undefined} products={manager.products} busy={manager.busy} onCancel={() => { setCreating(false); setFormSale(null); }} onSave={(input, sale) => void manager.save(input, sale).then((saved) => { if (saved) { setCreating(false); setFormSale(null); } })} />}
    {manager.productsLoading && <p className="text-sm text-text-muted">Đang tải sản phẩm…</p>}
    {manager.loading ? <SkeletonRows label="Đang tải lịch giảm giá…" /> : manager.sales.length === 0 ? <p className="rounded-xl bg-neutral-surface p-6 text-center text-sm text-text-muted">Chưa có chương trình giảm giá.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead><tr className="border-b border-neutral-border text-text-muted"><th className="p-3">Sản phẩm</th><th className="p-3">Ưu đãi</th><th className="p-3">Thời gian</th><th className="p-3">Trạng thái</th><th className="p-3">Giá hiện tại</th><th className="p-3">Thao tác</th></tr></thead><tbody>{manager.sales.map((sale) => <tr key={sale.id} className="border-b border-neutral-border last:border-0"><td className="p-3 font-semibold text-text-primary">{sale.productName}</td><td className="p-3">{sale.discountType === "PERCENTAGE" ? `${sale.discountValue}%` : `${formatMoney(sale.discountValue)}₫`}</td><td className="p-3">{new Date(sale.startsAt).toLocaleString("vi-VN")} – {new Date(sale.endsAt).toLocaleString("vi-VN")}</td><td className="p-3">{stateLabels[sale.state]}</td><td className="p-3">{sale.currentSalePrice === null ? "—" : `${formatMoney(sale.currentSalePrice)}₫`}</td><td className="p-3"><div className="flex gap-2">{(sale.state === "UPCOMING" || sale.state === "RUNNING") && <><Button type="button" disabled={manager.busy} onClick={() => { setCreating(false); setFormSale(sale); }} className="rounded-lg border border-neutral-border px-3 py-1.5 text-sm font-semibold">Sửa</Button><Button type="button" disabled={manager.busy} onClick={() => { if (window.confirm(`Kết thúc chương trình giảm giá cho ${sale.productName}?`)) void manager.end(sale); }} className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-semibold text-red-700">Kết thúc</Button></>}</div></td></tr>)}</tbody></table></div>}
  </section>;
}
