import { getCategoryShowcases } from "@/lib/services/products";
import CuratedRow from "./CuratedRow";

/**
 * CuratedSections — the home page's "shop by category" rows.
 *
 * Instead of filter controls, each row previews real Active products for one
 * category and deep-links into the matching /shop filter.
 */
export default async function CuratedSections() {
  const showcases = await getCategoryShowcases();

  return (
    <>
      {/* One CuratedRow per category showcase. */}
      {showcases.map(({ category, products }) => (
        <CuratedRow
          key={category.id}
          title={category.name}
          href={`/shop?category=${encodeURIComponent(category.id)}`}
          products={products}
        />
      ))}
    </>
  );
}
