"use client";

import Link from "next/link";
import { useResource } from "@/lib/hooks/use-resource";
import { getCategories } from "@/lib/services/categories";

/** Links to every category; hidden when there are none or they could not be loaded. */
export default function CategoryStrip() {
  const { data: categories = [], error } = useResource(getCategories, "categories");
  if (error || categories.length === 0) return null;
  return (
    <section aria-label="Danh mục hiện có" className="mb-6">
      {/* Small "DANH MỤC HIỆN CÓ" label. */}
      <h2 className="font-sans font-bold text-body-sm text-text-muted mb-2">DANH MỤC HIỆN CÓ</h2>
      {/* Pill links, one per category, to /shop?category=…. */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => <Link
          key={category.id}
          href={`/shop?category=${encodeURIComponent(category.id)}`}
          className="rounded-full border border-neutral-border bg-neutral-surface px-3 py-1 text-body-sm hover:border-primary"
        >{category.name}</Link>)}
      </div>
    </section>
  );
}
