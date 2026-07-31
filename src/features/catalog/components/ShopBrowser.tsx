"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/types";
import ProductCard from "@/features/catalog/components/ProductCard";
import FilterPanel from "@/features/catalog/components/FilterPanel";
import {
  type Filters,
  type FilterKey,
  EMPTY_FILTERS,
  filterProducts,
  filtersToQuery,
  activeCount,
} from "@/features/catalog/filters";

/**
 * ShopBrowser — the /shop filter engine (owns ALL catalog filtering).
 *
 *   • Desktop → sticky left filter sidebar + results grid.
 *   • Mobile  → a "Bộ lọc" button opens a bottom-sheet drawer with the same panel.
 *
 * Initial filter state comes from the URL (so home shortcuts like
 * /shop?occasion=Birthdays land pre-filtered); every change is synced back to
 * the URL via router.replace, making any filtered view shareable/bookmarkable.
 */
export default function ShopBrowser({
  products,
  initial,
}: {
  products: Product[];
  initial: Filters;
}) {
  const router = useRouter();
  const [filters, setFilters] = useState<Filters>(initial);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const visible = useMemo(() => filterProducts(products, filters), [products, filters]);
  const count = activeCount(filters);

  const apply = (next: Filters) => {
    setFilters(next);
    const qs = filtersToQuery(next);
    router.replace(qs ? `/shop?${qs}` : "/shop", { scroll: false });
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
        {/* Toolbar: count + (mobile) filter button + (desktop) clear */}
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <p className="font-sans text-body-sm text-text-muted m-0">{visible.length} sản phẩm</p>

          <button
            onClick={() => setDrawerOpen(true)}
            className="md:hidden inline-flex items-center gap-2 rounded-full border border-neutral-border px-4 py-2 font-sans font-bold text-label tracking-badge text-text-primary"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>tune</span>
            Bộ lọc{count > 0 && ` (${count})`}
          </button>

          {count > 0 && (
            <button
              onClick={clear}
              className="hidden md:inline-flex items-center gap-1 font-sans text-body-sm text-primary hover:underline"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
              Xóa lọc ({count})
            </button>
          )}
        </div>

        {visible.length === 0 ? (
          <p className="text-center py-16 font-serif italic text-heading-sm text-text-muted">
            Không có sản phẩm nào khớp bộ lọc.
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
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-text-secondary hover:bg-neutral-surface"
                aria-label="Đóng"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar px-5">
              <FilterPanel products={products} filters={filters} onToggle={toggle} />
            </div>

            <div className="flex gap-3 px-5 py-4 border-t border-neutral-border">
              <button
                onClick={clear}
                className="flex-none rounded-full border-[1.5px] border-secondary px-5 py-3 font-sans font-bold text-body-sm tracking-button text-primary"
              >
                Xóa
              </button>
              <button
                onClick={() => setDrawerOpen(false)}
                className="flex-1 rounded-full bg-primary text-white py-3 font-sans font-bold text-body-sm tracking-button hover:bg-primary-hover transition-colors"
              >
                Xem {visible.length} kết quả
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
