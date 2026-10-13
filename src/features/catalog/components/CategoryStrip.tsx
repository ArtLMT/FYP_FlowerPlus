"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCategories, type Category } from "@/lib/services/categories";

export default function CategoryStrip() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [failed, setFailed] = useState(false);
  useEffect(() => { getCategories().then(setCategories).catch(() => setFailed(true)); }, []);
  if (failed || categories.length === 0) return null;
  return (
    <section aria-label="Danh mục hiện có" className="mb-6">
      <h2 className="font-sans font-bold text-body-sm text-text-muted mb-2">DANH MỤC HIỆN CÓ</h2>
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
