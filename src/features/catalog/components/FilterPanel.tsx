"use client";

import type { PublicProductSummary } from "@/lib/types";
import {
  type Filters,
  type FilterKey,
  PRICE_BUCKETS,
  categoryOptions,
} from "@/features/catalog/filters";

/**
 * FilterPanel — the grouped checkbox filter UI. Presentational: it renders the
 * groups and calls onToggle; the parent (ShopBrowser) owns the state + URL sync.
 * Reused as-is in the desktop sidebar and the mobile filter drawer.
 */

type Option = { key: string; label: string };

function Group({
  title,
  group,
  options,
  filters,
  onToggle,
}: {
  title: string;
  group: FilterKey;
  options: readonly Option[];
  filters: Filters;
  onToggle: (group: FilterKey, value: string) => void;
}) {
  return (
    <div className="py-5 border-b border-neutral-border last:border-b-0">
      <h3 className="font-sans font-bold text-label uppercase tracking-badge text-text-muted m-0 mb-3">
        {title}
      </h3>
      <div className="flex flex-col gap-[10px]">
        {options.map((o) => {
          const checked = filters[group].includes(o.key);
          return (
            <label key={o.key} className="group flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggle(group, o.key)}
                className="sr-only"
              />
              <span
                className={`flex-none w-[18px] h-[18px] rounded-[5px] border flex items-center justify-center transition-colors ${
                  checked ? "bg-primary border-primary text-white" : "border-secondary bg-transparent"
                }`}
              >
                {checked && (
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                    check
                  </span>
                )}
              </span>
              <span
                className={`font-sans text-body transition-colors ${
                  checked ? "text-text-primary" : "text-text-secondary group-hover:text-text-primary"
                }`}
              >
                {o.label}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

export default function FilterPanel({
  products,
  filters,
  onToggle,
}: {
  products: PublicProductSummary[];
  filters: Filters;
  onToggle: (group: FilterKey, value: string) => void;
}) {
  const categories = categoryOptions(products);

  return (
    <div className="bg-neutral-surface border border-neutral-border rounded-2xl px-5">
      <Group title="Danh mục" group="category" options={categories} filters={filters} onToggle={onToggle} />
      <Group title="Khoảng giá" group="price" options={PRICE_BUCKETS} filters={filters} onToggle={onToggle} />
    </div>
  );
}
