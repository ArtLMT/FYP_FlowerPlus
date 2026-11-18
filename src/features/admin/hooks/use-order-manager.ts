import { useState } from "react";
import { asApiError } from "@/lib/api";
import { useResource } from "@/lib/hooks/use-resource";
import {
  advanceManagementOrder,
  cancelManagementOrder,
  getManagementOrder,
  listManagementOrders,
  type CourierInput,
  type ManagementOrder,
  type OrderStatus,
  type OrderType,
} from "@/lib/services/orders";
import { approveCustomOrder, proposeChanges, type ProposalInput } from "@/lib/services/custom-orders";

const PAGE_SIZE = 15;

type Feedback = { kind: "success" | "error"; text: string };

/**
 * Data/state layer for `OrderManager.tsx`: list paging/filtering, selected detail, and mutations.
 * Keep visual markup in `OrderManager.tsx`; change API paths and response shapes in
 * `src/lib/services/orders.ts`.
 */
export function useOrderManager({ selectedId, onSelect, initialFilter, onStockChanged }: {
  /** The Order open in detail, or null for the list. The admin shell keeps it in the URL (`?order=`). */
  selectedId: string | null;
  /** Opens an Order, or goes back to the list with null. */
  onSelect: (orderId: string | null) => void;
  initialFilter?: { status?: OrderStatus; type?: OrderType };
  /** Told after an advance or cancel, which can change what stock waiting Orders need. */
  onStockChanged?: () => void;
}) {
  const [pageNumber, setPageNumber] = useState(0);
  const [status, setStatusValue] = useState<OrderStatus | "">(initialFilter?.status ?? "");
  const [type, setTypeValue] = useState<OrderType | "">(initialFilter?.type ?? "");
  const [sort, setSortValue] = useState<"createdAt" | "deliveryWish">("createdAt");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [shownId, setShownId] = useState(selectedId);

  // Another Order (or the list) was opened, also by the browser's Back/Forward: drop the old message.
  if (selectedId !== shownId) {
    setShownId(selectedId);
    setFeedback(null);
  }

  const list = useResource(
    () => listManagementOrders({ page: pageNumber, size: PAGE_SIZE, status: status || undefined, type: type || undefined, sort }),
    `${pageNumber}|${status}|${type}|${sort}`,
  );
  const detail = useResource(
    () => getManagementOrder(selectedId as string),
    selectedId,
  );

  function selectOrder(id: string) {
    onSelect(id);
  }

  function setStatus(next: OrderStatus | "") {
    setStatusValue(next);
    setPageNumber(0);
  }

  function setType(next: OrderType | "") {
    setTypeValue(next);
    setPageNumber(0);
  }

  function setSort(next: "createdAt" | "deliveryWish") {
    setSortValue(next);
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
  // useResource keeps the last answer while the next one loads: show it only if it is this Order.
  const order = detail.data?.id === selectedId ? detail.data : undefined;

  return {
    page,
    loading: list.loading && !list.data,
    listError: list.error?.message ?? "",
    reload: list.reload,
    status,
    setStatus,
    type,
    setType,
    sort,
    setSort,
    selectedId,
    selectOrder,
    closeOrder: () => onSelect(null),
    order,
    orderLoading: detail.loading,
    orderError: detail.error?.message ?? "",
    reloadOrder: detail.reload,
    saving,
    feedback,
    // The status on screen goes with each action, so a second click or another staff member's change
    // is refused instead of moving the Order twice (BR-STATUS-12); mutate() then reloads it.
    advance: (courier?: CourierInput) => {
      const shown = order;
      return shown
        ? mutate(() => advanceManagementOrder(shown.id, shown.status, courier), "Đã chuyển đơn hàng sang bước tiếp theo.")
        : Promise.resolve(false);
    },
    cancel: (note: string) => {
      const shown = order;
      return shown
        ? mutate(() => cancelManagementOrder(shown.id, note, shown.status), "Đã hủy đơn hàng.")
        : Promise.resolve(false);
    },
    propose: (basedOnTermsNo: number, input: ProposalInput) => {
      const shown = order;
      return shown
        ? mutate(() => proposeChanges(shown.id, shown.status, basedOnTermsNo, input), "Đã gửi đề xuất cho khách hàng.")
        : Promise.resolve(false);
    },
    approve: (termsNo: number) => {
      const shown = order;
      return shown
        ? mutate(() => approveCustomOrder(shown.id, shown.status, termsNo), "Đã duyệt đơn thiết kế riêng.")
        : Promise.resolve(false);
    },
    hasPrevious: currentPage > 0,
    hasNext: page !== undefined && currentPage + 1 < page.totalPages,
    previous: () => setPageNumber(currentPage - 1),
    next: () => setPageNumber(currentPage + 1),
  };
}
