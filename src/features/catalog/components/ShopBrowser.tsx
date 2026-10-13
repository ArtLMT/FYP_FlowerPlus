"use client";
import Button from "@/components/ui/Button";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { PublicProductSummary } from "@/lib/types";
import ProductCard from "@/features/catalog/components/ProductCard";
import FilterPanel from "@/features/catalog/components/FilterPanel";
import {
  type Filters,
  type FilterKey,
  EMPTY_FILTERS,
  filterProducts,
  searchProducts,
  filtersToQuery,
  activeCount,
} from "@/features/catalog/filters";

/**
 * ShopBrowser — the /shop filter engine (owns ALL catalog filtering).
 *
 *   • Desktop → sticky left filter sidebar + results grid.
 *   • Mobile  → a "Bộ lọc" button opens a bottom-sheet drawer with the same panel.
 *
 * Initial filter state comes from the URL (so home category links land
 * pre-filtered); every change is synced back to
 * the URL via router.replace, making any filtered view shareable/bookmarkable.
 */
export default function ShopBrowser({
  products,
  initial,
  query = "",
}: {
  products: PublicProductSummary[];
  initial: Filters;
  query?: string;
}) {
  const router = useRouter();
  const [filters, setFilters] = useState<Filters>(initial);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const visible = useMemo(
    () => filterProducts(searchProducts(products, query), filters),
    [products, filters, query]
  );
  const count = activeCount(filters);

  /** Build /shop?… preserving the current search term alongside the filters. */
  const urlFor = (f: Filters) => {
    const params = new URLSearchParams(filtersToQuery(f));
    if (query) params.set("q", query);
    const qs = params.toString();
    return qs ? `/shop?${qs}` : "/shop";
  };

  const apply = (next: Filters) => {
    setFilters(next);
    router.replace(urlFor(next), { scroll: false });
  };

  /** Drop the search term but keep the active filters. */
  const clearQuery = () => {
    const qs = filtersToQuery(filters);
    router.push(qs ? `/shop?${qs}` : "/shop");
  };

  const toggle = (group: FilterKey, value: string) => {
    const cur = filters[group];
    const nextGroup = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value];
    apply({ ...filters, [group]: nextGroup });
  };

  const clear = () => apply(EMPTY_FILTERS);

  return (
    <div className="md:grid md:grid-cols-[240px_1fr] md:gap-8 md:items-start">
      {/* Desktop filter sidebar */}
      <aside className="hidden md:block md:sticky md:top-24">
        <FilterPanel products={products} filters={filters} onToggle={toggle} />
      </aside>

      {/* Results */}
      <div className="min-w-0">
        {/* Active search term — clearable, keeps filters */}
        {query && (
          <div className="mb-3 flex items-center gap-2">
            <span className="font-sans text-body-sm text-text-muted">Kết quả cho</span>
            <Button
              onClick={clearQuery}
              className="inline-flex items-center gap-1 rounded-full bg-neutral-surface border border-neutral-border px-3 py-1 font-sans font-bold text-label text-primary hover:border-primary transition-colors"
              aria-label={`Xóa tìm kiếm "${query}"`}
            >
              “{query}”
              <span className="material-symbols-outlined" style={{ fontSize: 15 }}>close</span>
            </Button>
          </div>
        )}

        {/* Toolbar: count + (mobile) filter button + (desktop) clear */}
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <p className="font-sans text-body-sm text-text-muted m-0">{visible.length} sản phẩm</p>

          <Button
            onClick={() => setDrawerOpen(true)}
            className="md:hidden inline-flex items-center gap-2 rounded-full border border-neutral-border px-4 py-2 font-sans font-bold text-label tracking-badge text-text-primary"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>tune</span>
            Bộ lọc{count > 0 && ` (${count})`}
          </Button>

          {count > 0 && (
            <Button
              onClick={clear}
              className="hidden md:inline-flex items-center gap-1 font-sans text-body-sm text-primary hover:underline"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
              Xóa lọc ({count})
            </Button>
          )}
        </div>

        {visible.length === 0 ? (
          <p className="text-center py-16 font-serif italic text-heading-sm text-text-muted">
            {query ? `Không tìm thấy kết quả cho “${query}”.` : "Không có sản phẩm nào khớp bộ lọc."}
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-[14px] md:gap-[22px]">
            {visible.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>

      {/* Mobile filter drawer */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Bộ lọc">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
          <div className="absolute bottom-0 left-0 w-full max-h-[85dvh] flex flex-col bg-neutral-canvas rounded-t-3xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-border">
              <h2 className="font-serif font-medium text-heading-md text-primary m-0">Bộ lọc</h2>
              <Button
                onClick={() => setDrawerOpen(false)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-text-secondary hover:bg-neutral-surface"
                aria-label="Đóng"
              >
                <span className="material-symbols-outlined">close</span>
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar px-5">
              <FilterPanel products={products} filters={filters} onToggle={toggle} />
            </div>

            <div className="flex gap-3 px-5 py-4 border-t border-neutral-border">
              <Button
                onClick={clear}
                className="flex-none rounded-full border-[1.5px] border-secondary px-5 py-3 font-sans font-bold text-body-sm tracking-button text-primary"
              >
                Xóa
              </Button>
              <Button
                onClick={() => setDrawerOpen(false)}
                className="flex-1 rounded-full bg-primary text-white py-3 font-sans font-bold text-body-sm tracking-button hover:bg-primary-hover transition-colors"
              >
                Xem {visible.length} kết quả
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
