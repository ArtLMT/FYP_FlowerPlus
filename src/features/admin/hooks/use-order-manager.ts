import { useState } from "react";
import { asApiError } from "@/lib/api";
import { useResource } from "@/lib/hooks/use-resource";
import {
  advanceManagementOrder,
  cancelManagementOrder,
  getManagementOrder,
  listManagementOrders,
  type ManagementOrder,
  type OrderStatus,
} from "@/lib/services/orders";

const PAGE_SIZE = 15;

type Feedback = { kind: "success" | "error"; text: string };

/**
 * Data/state layer for `OrderManager.tsx`: list paging/filtering, selected detail, and mutations.
 * Keep visual markup in `OrderManager.tsx`; change API paths and response shapes in
 * `src/lib/services/orders.ts`.
 */
export function useOrderManager({ openRequest = null, onStockChanged }: {
  /** An Order to open, e.g. from the stock alert; a new object opens it again. */
  openRequest?: { orderId: string } | null;
  /** Told after an advance or cancel, which can change what stock waiting Orders need. */
  onStockChanged?: () => void;
} = {}) {
  const [pageNumber, setPageNumber] = useState(0);
  const [status, setStatusValue] = useState<OrderStatus | "">("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [handledRequest, setHandledRequest] = useState<{ orderId: string } | null>(null);

  if (openRequest && openRequest !== handledRequest) {
    setHandledRequest(openRequest);
    setFeedback(null);
    setSelectedId(openRequest.orderId);
  }

  const list = useResource(
    () => listManagementOrders({ page: pageNumber, size: PAGE_SIZE, status: status || undefined }),
    `${pageNumber}|${status}`,
  );
  const detail = useResource(
    () => getManagementOrder(selectedId as string),
    selectedId,
  );

  function selectOrder(id: string) {
    setFeedback(null);
    setSelectedId(id);
  }

  function setStatus(next: OrderStatus | "") {
    setStatusValue(next);
    setPageNumber(0);
  }

  async function mutate(action: () => Promise<ManagementOrder>, success: string) {
    setSaving(true);
    setFeedback(null);
    try {
      const updated = await action();
      detail.setData(() => updated);
      list.reload();
      setFeedback({ kind: "success", text: success });
      return true;
    } catch (cause) {
      setFeedback({ kind: "error", text: asApiError(cause).message });
      detail.reload();
      list.reload();
      return false;
    } finally {
      setSaving(false);
      onStockChanged?.();
    }
  }

  const page = list.data;
  const currentPage = page?.page ?? pageNumber;

  return {
    page,
    loading: list.loading && !list.data,
    listError: list.error?.message ?? "",
    reload: list.reload,
    status,
    setStatus,
    selectedId,
    selectOrder,
    closeOrder: () => setSelectedId(null),
    order: detail.data,
    orderLoading: detail.loading,
    orderError: detail.error?.message ?? "",
    saving,
    feedback,
    // The status on screen goes with each action, so a second click or another staff member's change
    // is refused instead of moving the Order twice (BR-STATUS-12); mutate() then reloads it.
    advance: () => {
      const shown = detail.data;
      return shown
        ? mutate(() => advanceManagementOrder(shown.id, shown.status), "Đã chuyển đơn hàng sang bước tiếp theo.")
        : Promise.resolve(false);
    },
    cancel: (note: string) => {
      const shown = detail.data;
      return shown
        ? mutate(() => cancelManagementOrder(shown.id, note, shown.status), "Đã hủy đơn hàng.")
        : Promise.resolve(false);
    },
    hasPrevious: currentPage > 0,
    hasNext: page !== undefined && currentPage + 1 < page.totalPages,
    previous: () => setPageNumber(currentPage - 1),
    next: () => setPageNumber(currentPage + 1),
  };
}
