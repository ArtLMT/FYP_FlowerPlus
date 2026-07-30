import { getFeaturedCollections } from "@/lib/services/products";
import FeaturedCarousel from "./FeaturedCarousel";
import FeaturedCard from "@/features/catalog/components/FeaturedCard";
import Container from "@/components/ui/Container";

/**
 * FeaturedCollections — the featured items, presented two ways:
 *   • Mobile  (md:hidden)     → FeaturedCarousel (horizontal scroll)
 *   • Desktop (hidden md:grid) → 4-column static grid
 *
 * Server Component: fetches once, hands the same data to both presentations.
 */
export default async function FeaturedCollections() {
  const items = await getFeaturedCollections();

  return (
    <section className="pt-[14px] pb-12 md:pt-8 bg-neutral-canvas" aria-label="Bộ sưu tập nổi bật">
      {/* Mobile carousel */}
      <div className="md:hidden">
        <FeaturedCarousel items={items} />
      </div>

      {/* Desktop grid */}
      <Container className="hidden md:block">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-[22px]">
          {items.map((item) => (
            <FeaturedCard key={item.id} item={item} />
          ))}
        </div>
      </Container>
    </section>
  );
}
