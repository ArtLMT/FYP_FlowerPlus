"use client";

import Button from "@/components/ui/Button";
import FilterPanel from "@/features/catalog/components/FilterPanel";
import ProductCard from "@/features/catalog/components/ProductCard";
import type { Filters } from "@/features/catalog/filters";
import { useShopFilters } from "@/features/catalog/hooks/use-shop-filters";
import type { PublicProductSummary } from "@/lib/services/products";

/**
 * ShopBrowser — the /shop results with their filters.
 *
 *   • Desktop → sticky left filter sidebar + results grid.
 *   • Mobile  → a "Bộ lọc" button opens a bottom-sheet drawer with the same panel.
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
  const shop = useShopFilters(products, initial, query);
  const { filters, visible, toggle, clear, clearQuery, drawerOpen } = shop;
  const count = shop.activeCount;

  return (
    <div className="md:grid md:grid-cols-[240px_1fr] md:gap-8 md:items-start">
      {/* Desktop filter sidebar */}
      <aside className="hidden md:block md:sticky md:top-24">
        <FilterPanel categories={shop.categories} filters={filters} onToggle={toggle} />
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
            onClick={shop.openDrawer}
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

        {/* Empty-result message, or the product-card grid. */}
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
          <div className="absolute inset-0 bg-black/40" onClick={shop.closeDrawer} />
          <div className="absolute bottom-0 left-0 w-full max-h-[85dvh] flex flex-col bg-neutral-canvas rounded-t-3xl">
            {/* Drawer title bar and close button. */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-border">
              <h2 className="font-serif font-medium text-heading-md text-primary m-0">Bộ lọc</h2>
              <Button
                onClick={shop.closeDrawer}
                className="w-9 h-9 rounded-full flex items-center justify-center text-text-secondary hover:bg-neutral-surface"
                aria-label="Đóng"
              >
                <span className="material-symbols-outlined">close</span>
              </Button>
            </div>

            {/* Scrollable filter groups (same FilterPanel as desktop). */}
            <div className="flex-1 overflow-y-auto no-scrollbar px-5">
              <FilterPanel categories={shop.categories} filters={filters} onToggle={toggle} />
            </div>

            {/* Drawer footer: Clear and "Xem N kết quả" buttons. */}
            <div className="flex gap-3 px-5 py-4 border-t border-neutral-border">
              <Button
                onClick={clear}
                className="flex-none rounded-full border-[1.5px] border-secondary px-5 py-3 font-sans font-bold text-body-sm tracking-button text-primary"
              >
                Xóa
              </Button>
              <Button
                onClick={shop.closeDrawer}
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
