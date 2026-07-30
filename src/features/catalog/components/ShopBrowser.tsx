"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";
import ProductCard from "@/features/catalog/components/ProductCard";

/**
 * ShopBrowser — occasion filter pills + product grid.
 * Client Component: the active filter is UI state. Filtering is a pure
 * client-side pass over the products passed in from the server page.
 *
 * Reuses the same ProductCard as the homepage grid, and the same filter-pill
 * styling as OccasionsTabs.
 */

// key matches Product["occasion"]; "all" shows everything.
const FILTERS = [
  { key: "all", label: "TẤT CẢ" },
  { key: "Birthdays", label: "SINH NHẬT" },
  { key: "Weddings", label: "ĐÁM CƯỚI" },
  { key: "Everyday", label: "THƯỜNG NGÀY" },
] as const;

export default function ShopBrowser({ products }: { products: Product[] }) {
  const [filter, setFilter] = useState<string>("all");

  const visible = filter === "all" ? products : products.filter((p) => p.occasion === filter);

  return (
    <>
      {/* Filter pills */}
      <div className="flex overflow-x-auto gap-3 no-scrollbar pb-1 mb-6 -mx-5 px-5 md:mx-0 md:px-0">
        {FILTERS.map((f) => {
          const on = f.key === filter;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              aria-pressed={on}
              className={`whitespace-nowrap flex-shrink-0 py-[9px] px-[18px] rounded-full font-bold text-label tracking-badge transition-colors ${
                on
                  ? "bg-primary text-white border-none"
                  : "border border-neutral-border bg-transparent text-text-secondary hover:bg-neutral-surface"
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Grid — same ProductCard + columns as the homepage */}
      {visible.length === 0 ? (
        <p className="text-center py-16 font-serif italic text-heading-sm text-text-muted">
          Không có sản phẩm nào trong mục này.
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-[14px] md:gap-[22px]">
          {visible.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </>
  );
}
