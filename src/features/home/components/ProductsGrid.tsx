import { getProducts } from "@/lib/services/products";
import ProductCard from "@/features/catalog/components/ProductCard";
import Container from "@/components/ui/Container";

/**
 * ProductsGrid — "Thiết kế đặc trưng".
 * The cleanest kind of responsive: SAME markup, just more columns.
 *   grid-cols-2 (mobile) → md:grid-cols-3 (desktop)
 * No toggles, no duplicate markup — the grid simply reflows.
 */
export default async function ProductsGrid() {
  const products = await getProducts();

  return (
    <section className="pt-[30px] md:pt-16 pb-section bg-neutral-canvas" aria-label="Thiết kế đặc trưng">
      <Container>
        <h2 className="font-serif font-medium text-heading-md md:text-[36px] leading-[1.4] text-text-primary mb-[16px] md:mb-6 m-0">
          Thiết kế đặc trưng
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-[14px] md:gap-[22px]">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="pt-[22px] md:pt-8 text-center">
          <a
            href="/shop"
            className="font-sans text-label font-bold tracking-badge text-primary no-underline hover:underline"
          >
            XEM THÊM
          </a>
        </div>
      </Container>
    </section>
  );
}
