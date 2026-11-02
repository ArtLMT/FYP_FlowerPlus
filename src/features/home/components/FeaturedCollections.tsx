import Link from "next/link";
import { getProducts } from "@/lib/services/products";
import ProductCard from "@/features/catalog/components/ProductCard";
import Container from "@/components/ui/Container";

/**
 * A small preview of the newest Active Products returned by the backend.
 */
/**
 * "Bộ sưu tập nổi bật" home section.
 * Heading + "XEM TẤT CẢ" link first, then a 2-column (mobile) / 4-column (desktop) product grid.
 */
export default async function FeaturedCollections() {
  const products = await getProducts(4);

  if (products.length === 0) return null;

  return (
    <section className="pt-[30px] pb-12 md:pt-16 bg-neutral-canvas" aria-label="Bộ sưu tập nổi bật">
      <Container>
        {/* Section heading and "XEM TẤT CẢ" link to /shop. */}
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h2 className="m-0 font-serif text-heading-md font-medium leading-[1.3] text-text-primary md:text-[32px]">
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

      <Container>
        {/* Product-card grid. */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-[14px] md:gap-[22px]">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </Container>
    </section>
  );
}
