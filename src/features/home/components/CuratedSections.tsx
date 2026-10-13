import { getProducts } from "@/lib/services/products";
import CuratedRow from "./CuratedRow";

/**
 * CuratedSections — the home page's "shop by category" rows.
 *
 * Replaces the old filter-style pills/chips: instead of controls, each row is a
 * preview of real Active products for categories returned by the backend,
 * deep-linking into the matching /shop filter.
 *
 * Server Component: fetches once, filters per row via the shared catalog logic.
 */
export default async function CuratedSections() {
  const products = await getProducts();
  const categories = new Map<string, string>();
  products.forEach((product) => product.categories.forEach((category) => categories.set(category.id, category.name)));
  const curated = [...categories].slice(0, 3);

  return (
    <>
      {curated.map(([categoryId, categoryName]) => (
        <CuratedRow
          key={categoryId}
          title={categoryName}
          href={`/shop?category=${encodeURIComponent(categoryId)}`}
          products={products.filter((product) =>
            product.categories.some((category) => category.id === categoryId)).slice(0, 4)}
        />
      ))}
    </>
  );
}
