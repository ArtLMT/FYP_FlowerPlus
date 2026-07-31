import type { Product, Occasion, DecorationType } from "@/lib/types";

/**
 * Catalog filter config + logic — the single source shared by the Shop filter
 * panel AND the home "mini-filter" shortcuts. The URL query is the contract
 * between the two pages: home links to /shop?occasion=…&decor=…, Shop reads it
 * back. Neither page needs to know about the other — only this module.
 */

export type FilterKey = "occasion" | "decor" | "flower" | "price";
export type Filters = Record<FilterKey, string[]>;

export const EMPTY_FILTERS: Filters = { occasion: [], decor: [], flower: [], price: [] };

/** Static option lists (key = stored/URL value, label = VN display). */
export const OCCASIONS: { key: Occasion; label: string }[] = [
  { key: "Birthdays", label: "Sinh nhật" },
  { key: "Weddings", label: "Đám cưới" },
  { key: "Everyday", label: "Thường ngày" },
  { key: "Sympathy", label: "Chia buồn" },
];

export const DECORATIONS: { key: DecorationType; label: string; icon: string }[] = [
  { key: "bouquet", label: "Bó hoa", icon: "local_florist" },
  { key: "basket", label: "Giỏ hoa", icon: "shopping_basket" },
  { key: "box", label: "Hộp hoa", icon: "inventory_2" },
  { key: "vase", label: "Bình hoa", icon: "emoji_nature" },
  { key: "stand", label: "Kệ hoa", icon: "yard" },
];

export const PRICE_BUCKETS: { key: string; label: string; test: (p: number) => boolean }[] = [
  { key: "lt400", label: "Dưới 400.000đ", test: (p) => p < 400_000 },
  { key: "400-600", label: "400.000đ – 600.000đ", test: (p) => p >= 400_000 && p < 600_000 },
  { key: "600-800", label: "600.000đ – 800.000đ", test: (p) => p >= 600_000 && p < 800_000 },
  { key: "gt800", label: "Trên 800.000đ", test: (p) => p >= 800_000 },
];

/** Flower-type options are derived from the catalog (no hardcoded list to drift). */
export function flowerOptions(products: Product[]): { key: string; label: string }[] {
  const set = new Set<string>();
  products.forEach((p) => p.flowerTypes.forEach((f) => set.add(f)));
  return [...set].sort((a, b) => a.localeCompare(b, "vi")).map((f) => ({ key: f, label: f }));
}

/** Apply all groups: OR within a group, AND across groups. */
export function filterProducts(products: Product[], f: Filters): Product[] {
  return products.filter((p) => {
    if (f.occasion.length && !(p.occasion && f.occasion.includes(p.occasion))) return false;
    if (f.decor.length && !f.decor.includes(p.decorationType)) return false;
    if (f.flower.length && !p.flowerTypes.some((ft) => f.flower.includes(ft))) return false;
    if (f.price.length && !PRICE_BUCKETS.some((b) => f.price.includes(b.key) && b.test(p.price))) return false;
    return true;
  });
}

export function activeCount(f: Filters): number {
  return f.occasion.length + f.decor.length + f.flower.length + f.price.length;
}

/* ── URL <-> Filters ─────────────────────────────── */

export function filtersToQuery(f: Filters): string {
  const params = new URLSearchParams();
  (Object.keys(f) as FilterKey[]).forEach((k) => {
    if (f[k].length) params.set(k, f[k].join(","));
  });
  return params.toString();
}

export function filtersFromParams(sp: Record<string, string | string[] | undefined>): Filters {
  const get = (k: FilterKey) => {
    const v = sp[k];
    const s = Array.isArray(v) ? v.join(",") : v;
    return s ? s.split(",").filter(Boolean) : [];
  };
  return { occasion: get("occasion"), decor: get("decor"), flower: get("flower"), price: get("price") };
}
