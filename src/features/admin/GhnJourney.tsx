"use client";

import Button from "@/components/ui/Button";
import { useAsyncAction } from "@/lib/hooks/use-async-action";
import { useResource } from "@/lib/hooks/use-resource";
import { getManagementTracking, syncManagementTracking } from "@/lib/services/orders";
import { SHIPMENT_STAGE_LABELS, SHIPMENT_STAGE_STYLES, ghnStatusLabel } from "@/lib/shipment";
import { formatShopDateTime } from "@/lib/utils";

/**
 * GHN's journey, drawn inside the "Đang giao" entry of the status history: everything GHN reports
 * happens while the Order is Delivering, so it reads as the detail of that one step rather than as
 * a second, competing history. Staff see GHN's own wording; the stage badge is the summary.
 *
 * Loads itself: a GHN callback lands without the order page knowing, and "Đồng bộ" refreshes only
 * this part. Tracking never moves the Order's own status.
 */
export default function GhnJourney({ orderId }: { orderId: string }) {
  const tracking = useResource(() => getManagementTracking(orderId), orderId);
  const sync = useAsyncAction();
  const data = tracking.data;

  async function onSync() {
    await sync.run(async () => {
      const fresh = await syncManagementTracking(orderId);
      tracking.setData(() => fresh);
    });
  }

  return <div className="mt-2 rounded-lg border border-neutral-border bg-neutral-canvas/60 p-3">
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">GHN · {data?.ghnOrderCode ?? "…"}</span>
      {data?.stage && <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${SHIPMENT_STAGE_STYLES[data.stage]}`}>
        {SHIPMENT_STAGE_LABELS[data.stage]}
      </span>}
      <Button type="button" onClick={onSync} disabled={sync.busy}
              className="ml-auto text-xs font-semibold text-primary-deep">
        {sync.busy ? "Đang đồng bộ…" : "Đồng bộ"}
      </Button>
    </div>

    {sync.error && <p className="mt-2 text-xs text-red-700">{sync.error}</p>}
    {tracking.error && !data && <p className="mt-2 text-xs text-red-700">{tracking.error.message}</p>}
    {tracking.loading && !data && <p className="mt-2 text-xs text-text-muted">Đang tải hành trình GHN…</p>}
    {data?.stale && <p className="mt-2 text-xs text-text-muted">GHN chưa gửi cập nhật nào. Bấm “Đồng bộ” để hỏi GHN ngay.</p>}
    {data?.expectedDeliveryAt && <p className="mt-2 text-xs text-text-secondary">GHN dự kiến giao: {formatShopDateTime(data.expectedDeliveryAt)}</p>}

    {data && data.events.length > 0 && <ol className="mt-3 space-y-2 border-l border-neutral-border pl-3">
      {data.events.map((event) => <li key={`${event.type}-${event.at}`} className="relative">
        <span className="absolute -left-[16.5px] top-1.5 size-1.5 rounded-full bg-text-muted" aria-hidden />
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className="text-sm text-text-primary">{ghnStatusLabel(event.ghnStatus)}</span>
          <span className="text-xs text-text-muted">{formatShopDateTime(event.at)}</span>
        </div>
        {event.reason && <p className="text-xs text-red-700">{event.reason}{event.reasonCode && ` (${event.reasonCode})`}</p>}
      </li>)}
    </ol>}
  </div>;
}
