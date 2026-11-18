"use client";

import type { OrderTracking, ShipmentStage } from "@/lib/services/orders";
import { SHIPMENT_STAGE_LABELS, SHIPMENT_STAGE_STYLES } from "@/lib/shipment";
import { formatShopDateTime } from "@/lib/utils";

/**
 * Where the parcel is now, in the status card at the top of the order page. The customer sees the
 * stage, not GHN's raw status: "Đang vận chuyển" is the useful part, and GHN's warehouse wording
 * (sorting, storing) is not. Nothing renders until GHN has the parcel.
 */
export function DeliveryTracking({ tracking }: { tracking: OrderTracking | undefined }) {
  if (!tracking?.booked || !tracking.stage) return null;

  return <div className="mt-4 rounded-lg border border-neutral-border bg-neutral-canvas p-4">
    <div className="flex flex-wrap items-center gap-2">
      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${SHIPMENT_STAGE_STYLES[tracking.stage]}`}>
        {SHIPMENT_STAGE_LABELS[tracking.stage]}
      </span>
      {tracking.statusAt && <span className="text-xs text-text-muted">Cập nhật {formatShopDateTime(tracking.statusAt)}</span>}
    </div>
    {tracking.expectedDeliveryAt && <p className="mt-2 text-body-sm text-text-secondary">
      Dự kiến giao: {formatShopDateTime(tracking.expectedDeliveryAt)}
    </p>}
    {tracking.ghnOrderCode && <p className="mt-1 text-xs text-text-muted">Mã vận đơn GHN: {tracking.ghnOrderCode}</p>}
  </div>;
}

/**
 * GHN's journey inside the "Đang giao" step of the order history, newest first. GHN reports a
 * dozen warehouse moves; the customer gets one line per stage change, timed when that stage began,
 * so "Đang vận chuyển" appears once instead of once per warehouse scan. Unrecognised statuses are
 * left out rather than shown as "Không xác định".
 */
export function DeliveryJourney({ tracking }: { tracking: OrderTracking | undefined }) {
  const steps = stageChanges(tracking);
  if (steps.length === 0) return null;

  return <ol className="m-0 mt-2 list-none border-l border-dashed border-neutral-border p-0 pl-3">
    {steps.map((step) => <li key={`${step.stage}-${step.at}`} className="pb-2 last:pb-0">
      <p className="m-0 font-sans text-body-sm text-text-secondary">
        {SHIPMENT_STAGE_LABELS[step.stage]}
        <span className="text-text-muted"> · {formatShopDateTime(step.at)}</span>
      </p>
      {step.reason && <p className="m-0 font-sans text-body-sm text-red-700">{step.reason}</p>}
    </li>)}
  </ol>;
}

function stageChanges(tracking: OrderTracking | undefined) {
  if (!tracking?.booked) return [];
  const oldestFirst = [...tracking.events].reverse();
  const changes: { stage: ShipmentStage; at: string; reason: string | null }[] = [];
  for (const event of oldestFirst) {
    if (event.stage === "UNKNOWN") continue;
    if (changes.at(-1)?.stage === event.stage) continue;
    changes.push({ stage: event.stage, at: event.at, reason: event.reason });
  }
  return changes.reverse();
}
