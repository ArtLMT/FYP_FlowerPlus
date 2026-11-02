import Link from "next/link";
import Container from "@/components/ui/Container";
import ProductCard from "@/features/catalog/components/ProductCard";
import type { PublicProductSummary } from "@/lib/services/products";

/**
 * CuratedRow — a "shop by category" section: heading + a few real products +
 * a "XEM TẤT CẢ" deep-link into the pre-filtered /shop.
 *
 * This is the home page's discovery pattern — content, not controls. The user
 * sees actual arrangements and taps through; the filtering itself lives on /shop.
 *
 * Mobile: a horizontal snap-scroll (cards peek the next one).
 * Desktop: a static 4-column grid.
 */
export default function CuratedRow({
  title,
  href,
  products,
}: {
  title: string;
  href: string;
  products: PublicProductSummary[];
}) {
  if (products.length === 0) return null;

  return (
    <section className="pt-[30px] md:pt-14 bg-neutral-canvas" aria-label={title}>
      <Container>
        {/* Row heading (category name) and "XEM TẤT CẢ" link to the filtered /shop. */}
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h2 className="font-serif font-medium text-heading-md md:text-[32px] leading-[1.3] text-text-primary m-0">
            {title}
          </h2>
          <Link
            href={href}
            className="flex-none inline-flex items-center gap-1 font-sans text-label font-bold tracking-badge text-primary no-underline hover:underline"
          >
            XEM TẤT CẢ
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_right</span>
          </Link>
        </div>

        {/* Mobile: horizontal snap-scroll · Desktop: 4-col grid */}
        <div className="flex gap-[14px] overflow-x-auto no-scrollbar snap-x -mx-5 px-5 md:mx-0 md:px-0 md:grid md:grid-cols-4 md:gap-[22px] md:overflow-visible">
          {products.map((p) => (
            <div key={p.id} className="w-[calc((100%_-_14px)/2)] flex-shrink-0 snap-start md:w-auto">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
