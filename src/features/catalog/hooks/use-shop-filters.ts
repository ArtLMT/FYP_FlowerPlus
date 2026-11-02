import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { PublicProductSummary } from "@/lib/services/products";
import {
  activeCount,
  categoryOptions,
  EMPTY_FILTERS,
  filterProducts,
  filtersToQuery,
  searchProducts,
  type FilterKey,
  type Filters,
} from "@/features/catalog/filters";

/**
 * The /shop filter engine. Initial filters come from the URL (so home category links land
 * pre-filtered) and every change is written back with router.replace, so any filtered view is
 * shareable. The search term `query` is kept alongside the filters.
 */
export function useShopFilters(products: PublicProductSummary[], initial: Filters, query: string) {
  const router = useRouter();
  const [filters, setFilters] = useState<Filters>(initial);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const visible = useMemo(
    () => filterProducts(searchProducts(products, query), filters),
    [products, filters, query],
  );
  const categories = useMemo(() => categoryOptions(products), [products]);

  /** Build /shop?… preserving the current search term alongside the filters. */
  const urlFor = (next: Filters) => {
    const params = new URLSearchParams(filtersToQuery(next));
    if (query) params.set("q", query);
    const qs = params.toString();
    return qs ? `/shop?${qs}` : "/shop";
  };

  const apply = (next: Filters) => {
    setFilters(next);
    router.replace(urlFor(next), { scroll: false });
  };

  const toggle = (group: FilterKey, value: string) => {
    const current = filters[group];
    const nextGroup = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    apply({ ...filters, [group]: nextGroup });
  };

  /** Drop the search term but keep the active filters. */
  const clearQuery = () => {
    const qs = filtersToQuery(filters);
    router.push(qs ? `/shop?${qs}` : "/shop");
  };

  return {
    filters,
    categories,
    visible,
    activeCount: activeCount(filters),
    toggle,
    clear: () => apply(EMPTY_FILTERS),
    clearQuery,
    drawerOpen,
    openDrawer: () => setDrawerOpen(true),
    closeDrawer: () => setDrawerOpen(false),
  };
}
