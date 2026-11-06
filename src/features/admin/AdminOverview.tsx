"use client";

import Button from "@/components/ui/Button";
import type { StockShortagesState } from "@/features/admin/hooks/use-stock-shortages";
import { useResource } from "@/lib/hooks/use-resource";
import { listManagementOrders, type OrderStatus, type OrderType } from "@/lib/services/orders";

/** Only the totals are needed, so one row per list is enough. */
async function loadOrderCounts() {
  const [waiting, customRequests] = await Promise.all([
    listManagementOrders({ page: 0, size: 1, status: "AWAITING_CONFIRMATION" }),
    listManagementOrders({ page: 0, size: 1, status: "REQUESTED", type: "CUSTOM" }),
  ]);
  return { waiting: waiting.totalElements, customRequests: customRequests.totalElements };
}

function CountCard({ label, hint, count, onOpen }: { label: string; hint: string; count: number | undefined; onOpen: () => void }) {
  const urgent = count !== undefined && count > 0;
  return <Button type="button" onClick={onOpen} className={`flex min-h-32 flex-col justify-between gap-3 rounded-xl border-[1.5px] bg-white p-4 text-left shadow-sm transition-colors hover:border-primary-deep ${urgent ? "border-primary-deep" : "border-neutral-border"}`}>
    <span className="font-sans text-sm font-bold text-text-primary">{label}</span>
    <span className={`font-serif text-4xl font-semibold ${urgent ? "text-primary-deep" : "text-text-secondary"}`}>{count ?? "—"}</span>
    <span className="font-sans text-xs text-text-secondary">{hint}</span>
  </Button>;
}

/**
 * The first admin section (U7): what staff must act on, each count opening its section. It reads
 * data that already exists; the shell's stock alert above it gives the detail of any shortage.
 */
export default function AdminOverview({ stock, onOpenOrders, onOpenInventory }: {
  stock: StockShortagesState;
  onOpenOrders: (filter: { status: OrderStatus; type?: OrderType }) => void;
  onOpenInventory: () => void;
}) {
  const counts = useResource(loadOrderCounts, "overview-counts");

  return <div className="space-y-4">
    {counts.error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
      {counts.error.message}{" "}
      <Button type="button" onClick={counts.reload} className="font-semibold underline">Thử lại</Button>
    </p>}
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <CountCard
        label="Đơn chờ xác nhận"
        hint="Mở danh sách đơn cần xác nhận"
        count={counts.data?.waiting}
        onOpen={() => onOpenOrders({ status: "AWAITING_CONFIRMATION" })}
      />
      <CountCard
        label="Yêu cầu thiết kế chờ xử lý"
        hint="Cần duyệt hoặc đề xuất thay đổi"
        count={counts.data?.customRequests}
        onOpen={() => onOpenOrders({ status: "REQUESTED", type: "CUSTOM" })}
      />
      <CountCard
        label="Nguyên liệu đang thiếu"
        hint="Không đủ cho đơn đang chờ"
        count={stock.data?.shortMaterials.length}
        onOpen={onOpenInventory}
      />
      <CountCard
        label="Nguyên liệu sắp thiếu"
        hint="Đủ hôm nay, thiếu vào ngày mai"
        count={stock.data?.atRiskMaterials.length}
        onOpen={onOpenInventory}
      />
    </div>
  </div>;
}
