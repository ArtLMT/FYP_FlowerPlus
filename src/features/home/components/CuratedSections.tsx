import { getProducts } from "@/lib/services/products";
import CuratedRow from "./CuratedRow";
import { type Filters, EMPTY_FILTERS, filterProducts } from "@/features/catalog/filters";

/**
 * CuratedSections — the home page's "shop by category" rows.
 *
 * Replaces the old filter-style pills/chips: instead of controls, each row is a
 * curated preview of real products for one category, deep-linking into the
 * pre-filtered /shop. The category list is editorial (a chosen spread across
 * occasion + decoration), not every possible filter value.
 *
 * Server Component: fetches once, filters per row via the shared catalog logic.
 */
const CURATED: { title: string; href: string; filter: Filters }[] = [
  { title: "Hoa sinh nhật", href: "/shop?occasion=Birthdays", filter: { ...EMPTY_FILTERS, occasion: ["Birthdays"] } },
  { title: "Hoa cưới", href: "/shop?occasion=Weddings", filter: { ...EMPTY_FILTERS, occasion: ["Weddings"] } },
  { title: "Bó hoa tươi", href: "/shop?decor=bouquet", filter: { ...EMPTY_FILTERS, decor: ["bouquet"] } },
];

export default async function CuratedSections() {
  const products = await getProducts();

  return (
    <>
      {CURATED.map((c) => (
        <CuratedRow
          key={c.href}
          title={c.title}
          href={c.href}
          products={filterProducts(products, c.filter).slice(0, 4)}
        />
      ))}
    </>
  );
}
