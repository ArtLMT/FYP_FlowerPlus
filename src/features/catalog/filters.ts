import type { PublicProductSummary } from "@/lib/services/products";

/**
 * Catalog filter config + logic — the single source shared by the Shop filter
 * panel and the category rows on the home page. The URL query is the contract
 * between the two pages: home links to /shop?category=…, and Shop reads it back.
 */

export type FilterKey = "arrangement" | "category" | "price";
export type Filters = Record<FilterKey, string[]>;

export type FilterOption = { key: string; label: string };

export const EMPTY_FILTERS: Filters = { arrangement: [], category: [], price: [] };

/** The filter key and section for products whose arrangement style is not set yet. */
export const NO_ARRANGEMENT: FilterOption = { key: "none", label: "Khác" };

export const PRICE_BUCKETS: (FilterOption & { test: (p: number) => boolean })[] = [
  { key: "lt400", label: "Dưới 400.000đ", test: (p) => p < 400_000 },
  { key: "400-600", label: "400.000đ – 600.000đ", test: (p) => p >= 400_000 && p < 600_000 },
  { key: "600-800", label: "600.000đ – 800.000đ", test: (p) => p >= 600_000 && p < 800_000 },
  { key: "gt800", label: "Trên 800.000đ", test: (p) => p >= 800_000 },
];

/** Category options are derived from the public Product responses. */
export function categoryOptions(products: PublicProductSummary[]): FilterOption[] {
  const categories = new Map<string, string>();
  products.forEach((product) => product.categories.forEach((category) => categories.set(category.id, category.name)));
  return [...categories]
    .map(([key, label]) => ({ key, label }))
    .sort((left, right) => left.label.localeCompare(right.label, "vi"));
}

/** Which arrangement style a product falls under; "none" when it has none yet. */
export function arrangementKey(product: PublicProductSummary): string {
  return product.arrangementType?.id ?? NO_ARRANGEMENT.key;
}

/**
 * Arrangement styles that have products, A–Z, with "Khác" last when some product has none
 * (BR-PROD-22). Derived from the products, like categories, so an empty style is never offered.
 */
export function arrangementOptions(products: PublicProductSummary[]): FilterOption[] {
  const styles = new Map<string, string>();
  let withoutStyle = false;
  products.forEach((product) => {
    if (product.arrangementType) styles.set(product.arrangementType.id, product.arrangementType.name);
    else withoutStyle = true;
  });
  const options = [...styles]
    .map(([key, label]) => ({ key, label }))
    .sort((left, right) => left.label.localeCompare(right.label, "vi"));
  return withoutStyle ? [...options, NO_ARRANGEMENT] : options;
}

/** The products split into one section per arrangement style, in `arrangementOptions` order. */
export function sectionsByArrangement(products: PublicProductSummary[]) {
  return arrangementOptions(products).map((option) => ({
    ...option,
    products: products.filter((product) => arrangementKey(product) === option.key),
  }));
}

/** Free-text search over the public name, category labels and arrangement style. */
export function searchProducts(products: PublicProductSummary[], q: string): PublicProductSummary[] {
  const needle = q.trim().toLowerCase();
  if (!needle) return products;
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(needle) ||
      p.categories.some((category) => category.name.toLowerCase().includes(needle)) ||
      Boolean(p.arrangementType?.name.toLowerCase().includes(needle))
  );
}

/** Apply all groups: OR within a group, AND across groups. */
export function filterProducts(products: PublicProductSummary[], f: Filters): PublicProductSummary[] {
  return products.filter((p) => {
    if (f.arrangement.length && !f.arrangement.includes(arrangementKey(p))) return false;
    if (f.category.length && !p.categories.some((category) => f.category.includes(category.id))) return false;
    if (f.price.length && !PRICE_BUCKETS.some((bucket) => f.price.includes(bucket.key) && bucket.test(p.basePrice))) return false;
    return true;
  });
}

export function activeCount(f: Filters): number {
  return f.arrangement.length + f.category.length + f.price.length;
}

/* URL <-> Filters */

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
  return { arrangement: get("arrangement"), category: get("category"), price: get("price") };
}
