import Link from "next/link";
import { getFeaturedCollections } from "@/lib/services/products";
import FeaturedCarousel from "./FeaturedCarousel";
import FeaturedCard from "@/features/catalog/components/FeaturedCard";
import Container from "@/components/ui/Container";

/**
 * FeaturedCollections — the featured items, presented two ways:
 *   • Mobile  (md:hidden)     → FeaturedCarousel (horizontal scroll)
 *   • Desktop (hidden md:grid) → 4-column static grid
 *
 * Owns the "Bộ sưu tập nổi bật" heading (previously supplied by OccasionsTabs,
 * now removed). Server Component: fetches once, hands the same data to both
 * presentations.
 */
export default async function FeaturedCollections() {
  const items = await getFeaturedCollections();

  return (
    <section className="pt-[30px] pb-12 md:pt-16 bg-neutral-canvas" aria-label="Bộ sưu tập nổi bật">
      <Container>
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h2 className="font-serif font-medium text-heading-md md:text-[36px] leading-[1.3] text-text-primary m-0">
            Bộ sưu tập nổi bật
          </h2>
          <Link
            href="/shop"
            className="flex-none inline-flex items-center gap-1 font-sans text-label font-bold tracking-badge text-primary no-underline hover:underline"
          >
            XEM TẤT CẢ
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_right</span>
          </Link>
        </div>
      </Container>

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
