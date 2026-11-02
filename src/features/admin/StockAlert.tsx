"use client";

import Button from "@/components/ui/Button";
import type { StockShortagesState } from "@/features/admin/hooks/use-stock-shortages";
import { MATERIAL_TYPE_LABELS, MATERIAL_UNIT_LABELS } from "@/features/admin/material-labels";
import type { StockShortages } from "@/lib/services/inventory";
import type { MaterialUnit } from "@/lib/services/materials";
import { formatShopDateTime } from "@/lib/utils";

type ShortMaterial = StockShortages["shortMaterials"][number];

/** 2.5 → "2,5 mét". Quantities have at most two decimals (METRE). */
export const formatAmount = (quantity: number, unit: MaterialUnit) =>
  `${Math.abs(Number(quantity)).toLocaleString("vi-VN", { maximumFractionDigits: 2 })} ${MATERIAL_UNIT_LABELS[unit].toLowerCase()}`;

/** −5 cành, with a real minus sign. */
const formatNegative = (quantity: number, unit: MaterialUnit) => `−${formatAmount(quantity, unit)}`;

/** Orders have no short code yet; the start of the UUID identifies one on screen. */
export const shortOrderId = (orderId: string) => `#${orderId.slice(0, 8)}`;

const checkedTime = (instant: string) => formatShopDateTime(instant).slice(-5);

const WarningIcon = ({ size = 20 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>;
const ClockIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>;
const CheckIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>;

const PILL = "inline-flex min-h-10 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-4 text-[13px] font-bold";
const PRIMARY_PILL = `${PILL} bg-primary text-white hover:bg-primary-hover`;
const ORDER_CHIP = "rounded-full border border-neutral-border px-2.5 py-0.5 text-xs font-bold text-primary-deep hover:border-primary";

/**
 * The stock alert at the top of every Admin section. Only one state shows at a time:
 * nothing (all good) · green tick once after the last shortage clears · amber when stock expiring
 * tonight makes tomorrow short · red when waiting Orders need more than usable stock · a plain
 * "could not check" line, so a failed read never looks like "all good".
 */
export default function StockAlert({
  stock,
  onReceive,
  onOpenOrder,
}: {
  stock: StockShortagesState;
  onReceive: (materialId: string) => void;
  onOpenOrder: (orderId: string) => void;
}) {
  if (stock.failed) {
    return <section role="alert" className="flex flex-wrap items-center gap-3 rounded-2xl border border-dashed border-secondary bg-white py-2.5 pl-4 pr-3">
      <span className="min-w-0 flex-1 text-sm text-text-secondary">Không kiểm tra được tồn kho.</span>
      <Button type="button" disabled={stock.checking} onClick={stock.reload} className={`${PILL} border border-neutral-border bg-white text-primary-deep`}>Thử lại</Button>
    </section>;
  }

  const data = stock.data;
  if (!data) return null;

  const short = data.shortMaterials;
  const atRisk = data.atRiskMaterials;

  return <div className="space-y-3">
    {short.length === 1 && <SingleShortage material={short[0]} checkedAt={data.checkedAt} stock={stock} onReceive={onReceive} onOpenOrder={onOpenOrder} />}
    {short.length > 1 && (stock.collapsed
      ? <CollapsedShortages materials={short} onExpand={() => stock.setCollapsed(false)} />
      : <ShortageTable materials={short} data={data} stock={stock} onReceive={onReceive} onOpenOrder={onOpenOrder} />)}

    {atRisk.map((material) => <section key={material.materialId} aria-label="Nguyên liệu sắp thiếu" className="flex flex-wrap items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 py-2.5 pl-4 pr-3 text-amber-900">
      <ClockIcon />
      <p className="min-w-0 flex-1 basis-72 text-sm"><strong>{material.materialName}</strong> đủ cho các đơn hôm nay, nhưng {formatAmount(material.expiringToday, material.unitOfMeasure)} hết hạn tối nay. Ngày mai sẽ thiếu <strong>{formatAmount(material.leftTomorrow, material.unitOfMeasure)}</strong>.</p>
      <Button type="button" onClick={() => onReceive(material.materialId)} className={`${PILL} border border-amber-200 bg-white text-amber-900`}>Nhập hàng</Button>
    </section>)}

    {stock.resolved && <section aria-live="polite" className="flex flex-wrap items-center gap-3 rounded-2xl border border-accent-sage-light bg-accent-sage-light/40 py-1.5 pl-4 pr-1.5 text-text-primary">
      <span className="text-accent-sage"><CheckIcon /></span>
      <span className="min-w-0 flex-1 text-sm">Tồn kho đã đủ cho mọi đơn đang chờ.</span>
      <Button type="button" aria-label="Đóng" onClick={stock.dismissResolved} className="grid size-10 place-items-center rounded-full hover:bg-white/60">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
      </Button>
    </section>}
  </div>;
}

function RefreshButton({ stock }: { stock: StockShortagesState }) {
  return <Button type="button" aria-label="Kiểm tra lại tồn kho" disabled={stock.checking} onClick={stock.reload} className="grid size-11 place-items-center rounded-full border border-red-200 bg-white text-text-secondary hover:border-red-300">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={stock.checking ? "animate-spin" : ""}><path d="M21 12a9 9 0 1 1-3-6.7L21 8" /><path d="M21 3v5h-5" /></svg>
  </Button>;
}

function blockedOrderCount(materials: ShortMaterial[]) {
  return new Set(materials.flatMap((material) => material.blockedOrders.map((order) => order.orderId))).size;
}

/** A Deactivated material cannot receive stock, so its Orders need a decision instead. */
function MaterialAction({ material, onReceive, onOpenOrder }: { material: ShortMaterial; onReceive: (materialId: string) => void; onOpenOrder: (orderId: string) => void }) {
  if (material.materialStatus === "ACTIVE") {
    return <Button type="button" onClick={() => onReceive(material.materialId)} className={PRIMARY_PILL}>Nhập hàng</Button>;
  }
  const first = material.blockedOrders[0];
  return first ? <Button type="button" onClick={() => onOpenOrder(first.orderId)} className={`${PILL} border border-neutral-border bg-white text-primary-deep`}>Xem đơn</Button> : null;
}

function SingleShortage({ material, checkedAt, stock, onReceive, onOpenOrder }: {
  material: ShortMaterial;
  checkedAt: string;
  stock: StockShortagesState;
  onReceive: (materialId: string) => void;
  onOpenOrder: (orderId: string) => void;
}) {
  return <section aria-labelledby="stock-alert-title" className="flex flex-wrap items-center gap-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 sm:px-5">
    <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-xl bg-red-700 text-white"><WarningIcon /></span>
    <div className="min-w-0 flex-1 basis-72">
      <h2 id="stock-alert-title" className="text-base font-extrabold text-red-700">{material.materialName} đang thiếu {formatAmount(material.left, material.unitOfMeasure)}</h2>
      <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[13px] text-text-secondary">
        {material.materialStatus !== "ACTIVE" && <span className="rounded-full bg-neutral-raised px-2 py-0.5 text-xs font-bold">Đã ngừng</span>}
        Chặn
        {material.blockedOrders.map((order) => <button key={order.orderId} type="button" onClick={() => onOpenOrder(order.orderId)} className={ORDER_CHIP}>{shortOrderId(order.orderId)}</button>)}
        · Kiểm tra lúc {checkedTime(checkedAt)}.
      </p>
    </div>
    <div className="flex gap-2"><RefreshButton stock={stock} /><MaterialAction material={material} onReceive={onReceive} onOpenOrder={onOpenOrder} /></div>
  </section>;
}

function CollapsedShortages({ materials, onExpand }: { materials: ShortMaterial[]; onExpand: () => void }) {
  return <section aria-label="Nguyên liệu đang thiếu" className="flex flex-wrap items-center gap-3 rounded-2xl border border-red-200 bg-red-50 py-2.5 pl-4 pr-3">
    <span className="text-red-700"><WarningIcon size={18} /></span>
    <strong className="text-sm text-red-700">{materials.length} thiếu</strong>
    <span className="min-w-0 flex-1 basis-72 text-sm text-text-primary">
      {materials.map((material, index) => <span key={material.materialId}>{index > 0 && " · "}{material.materialName} <b className="text-red-700">{formatNegative(material.left, material.unitOfMeasure)}</b></span>)}
    </span>
    <Button type="button" aria-expanded="false" aria-controls="stock-alert-table" onClick={onExpand} className={`${PILL} border border-red-200 bg-white text-text-secondary`}>Xem chi tiết</Button>
  </section>;
}

function ShortageTable({ materials, data, stock, onReceive, onOpenOrder }: {
  materials: ShortMaterial[];
  data: StockShortages;
  stock: StockShortagesState;
  onReceive: (materialId: string) => void;
  onOpenOrder: (orderId: string) => void;
}) {
  const TH = "border-b border-red-200 bg-red-50/40 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-text-secondary";
  const TD = "border-b border-red-100 px-4 py-3.5 align-middle";
  return <section aria-labelledby="stock-alert-title" className="overflow-hidden rounded-2xl border border-red-200 bg-white shadow-sm">
    <div className="flex flex-wrap items-center gap-4 border-b border-red-200 bg-red-50 px-4 py-4 sm:px-5">
      <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-xl bg-red-700 text-white"><WarningIcon /></span>
      <div className="min-w-0 flex-1 basis-72">
        <h2 id="stock-alert-title" className="text-base font-extrabold text-red-700">{materials.length} nguyên liệu đang thiếu cho các đơn chờ chuẩn bị</h2>
        <p className="mt-0.5 text-[13px] text-text-secondary">{blockedOrderCount(materials)} đơn chưa thể chuẩn bị cho đến khi nhập thêm hàng. Kiểm tra lúc {checkedTime(data.checkedAt)}.</p>
      </div>
      <div className="flex gap-2">
        <RefreshButton stock={stock} />
        <Button type="button" aria-expanded="true" aria-controls="stock-alert-table" onClick={() => stock.setCollapsed(true)} className={`${PILL} min-h-11 border border-red-200 bg-white text-text-secondary`}>Thu gọn</Button>
      </div>
    </div>

    {/* Phone: one card per material. */}
    <ul className="md:hidden">
      {materials.map((material) => <li key={material.materialId} className="flex flex-col gap-2.5 border-b border-red-100 p-4 last:border-b-0">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <p className="font-bold text-text-primary">{material.materialName}</p>
            <p className="mt-0.5 text-[13px] text-text-secondary">Dùng được {formatAmount(material.usable, material.unitOfMeasure)} · Cần {formatAmount(material.needed, material.unitOfMeasure)}</p>
          </div>
          <span className="shrink-0 rounded-md bg-red-50 px-2 py-0.5 text-sm font-bold tabular-nums text-red-700">{formatNegative(material.left, material.unitOfMeasure)}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {material.materialStatus !== "ACTIVE" && <span className="rounded-full bg-neutral-raised px-2 py-0.5 text-xs font-bold text-text-secondary">Đã ngừng</span>}
          {material.blockedOrders.map((order) => <button key={order.orderId} type="button" onClick={() => onOpenOrder(order.orderId)} className={ORDER_CHIP}>{shortOrderId(order.orderId)}</button>)}
        </div>
        <div className="grid [&>button]:min-h-11"><MaterialAction material={material} onReceive={onReceive} onOpenOrder={onOpenOrder} /></div>
      </li>)}
    </ul>

    <div id="stock-alert-table" className="hidden overflow-x-auto md:block">
      <table className="w-full min-w-[880px] border-collapse text-left text-sm">
        <thead>
          <tr>
            <th scope="col" className={TH}>Nguyên liệu</th>
            <th scope="col" className={`${TH} text-right`}>Dùng được</th>
            <th scope="col" className={`${TH} text-right`}>Cần cho đơn</th>
            <th scope="col" className={`${TH} text-right`}>Còn lại sau đơn</th>
            <th scope="col" className={TH}>Đơn bị chặn</th>
            <th scope="col" className={TH}><span className="sr-only">Thao tác</span></th>
          </tr>
        </thead>
        <tbody className="[&>tr:last-child>td]:border-b-0">
          {materials.map((material) => <tr key={material.materialId}>
            <td className={TD}>
              <p className="font-bold text-text-primary">{material.materialName}</p>
              <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-text-secondary">
                {MATERIAL_TYPE_LABELS[material.materialType]}
                {material.materialStatus !== "ACTIVE" && <span className="rounded-full bg-neutral-raised px-2 py-0.5 font-bold">Đã ngừng</span>}
              </p>
            </td>
            <td className={`${TD} text-right tabular-nums`}>{formatAmount(material.usable, material.unitOfMeasure)}</td>
            <td className={`${TD} text-right tabular-nums`}>{formatAmount(material.needed, material.unitOfMeasure)}</td>
            <td className={`${TD} text-right`}><span className="inline-block rounded-md bg-red-50 px-2 py-0.5 font-bold tabular-nums text-red-700">{formatNegative(material.left, material.unitOfMeasure)}</span></td>
            <td className={TD}>
              <div className="flex flex-wrap gap-1.5">
                {material.blockedOrders.map((order) => <button key={order.orderId} type="button" onClick={() => onOpenOrder(order.orderId)} className={ORDER_CHIP}>{shortOrderId(order.orderId)} · {formatNegative(order.shortBy, material.unitOfMeasure)}</button>)}
              </div>
            </td>
            <td className={`${TD} text-right`}><MaterialAction material={material} onReceive={onReceive} onOpenOrder={onOpenOrder} /></td>
          </tr>)}
        </tbody>
      </table>
    </div>
    <p className="border-t border-red-100 px-4 py-3 text-xs text-text-secondary sm:px-5">Còn lại sau đơn = tồn kho dùng được hiện tại − lượng cần cho các đơn chờ chuẩn bị. Nguyên liệu sắp hết hạn được cảnh báo riêng (màu vàng).</p>
  </section>;
}
