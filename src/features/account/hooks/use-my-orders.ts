import { useState } from "react";
import { useResource } from "@/lib/hooks/use-resource";
import { listMyOrders, type CustomerOrderStatus } from "@/lib/services/orders";

const PAGE_SIZE = 10;

/** The signed-in account's orders, newest first, one page at a time; a filter starts again at page 1. */
export function useMyOrders() {
  const [filter, setFilterState] = useState<CustomerOrderStatus | "ALL">("ALL");
  const [page, setPage] = useState(0);
  const status = filter === "ALL" ? undefined : filter;
  const list = useResource(
    () => listMyOrders({ page, size: PAGE_SIZE, status }),
    `${filter}:${page}`,
  );

  function setFilter(next: CustomerOrderStatus | "ALL") {
    setFilterState(next);
    setPage(0);
  }

  return {
    filter,
    setFilter,
    page: list.data,
    loading: list.loading,
    error: list.error?.message ?? null,
    reload: list.reload,
    previous: () => setPage((current) => Math.max(current - 1, 0)),
    next: () => setPage((current) => current + 1),
  };
}
