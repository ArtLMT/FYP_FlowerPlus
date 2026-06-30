import { getFeaturedCollections } from "@/lib/services/products";
import FeaturedCarousel from "./FeaturedCarousel";

/**
 * FeaturedCollections — horizontal snap carousel showing sale items.
 * Server Component — fetches data and passes it to the interactive Client Component.
 */
export default async function FeaturedCollections() {
  const items = await getFeaturedCollections();

  return (
    <section
      className="pb-12 bg-neutral-canvas overflow-hidden"
      aria-label="Featured sale items"
    >
      <FeaturedCarousel items={items} />
    </section>
  );
}
