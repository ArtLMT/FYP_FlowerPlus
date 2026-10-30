import { useMemo, useState } from "react";
import { useResource } from "@/lib/hooks/use-resource";
import { getStockShortages, type OrderStock } from "@/lib/services/inventory";

/**
 * Data/state layer for the stock alert in the Admin shell (`StockAlert.tsx`) and the Stock column of
 * the Orders table. Read on page load and again after any stock or Order change, or on request.
 */
export function useStockShortages(enabled: boolean) {
  const resource = useResource(getStockShortages, enabled ? "stock-shortages" : null);
  const [collapsed, setCollapsed] = useState(false);
  const [resolved, setResolved] = useState(false);
  const [previousShortCount, setPreviousShortCount] = useState<number | null>(null);

  const data = resource.data;
  const shortCount = data?.shortMaterials.length ?? null;

  // "Just resolved" shows once, when a read finds nothing short right after one that did.
  if (shortCount !== null && shortCount !== previousShortCount) {
    setPreviousShortCount(shortCount);
    setResolved(shortCount === 0 && previousShortCount !== null && previousShortCount > 0);
  }

  const stockByOrder = useMemo(
    () => new Map<string, OrderStock>((data?.orders ?? []).map((order) => [order.orderId, order])),
    [data],
  );

  return {
    data,
    /** Only a failure with nothing loaded yet; a later failure keeps showing the last answer. */
    failed: resource.error !== null && data === undefined,
    checking: resource.loading,
    reload: resource.reload,
    shortCount: shortCount ?? 0,
    stockByOrder,
    collapsed,
    setCollapsed,
    resolved,
    dismissResolved: () => setResolved(false),
  };
}

export type StockShortagesState = ReturnType<typeof useStockShortages>;
