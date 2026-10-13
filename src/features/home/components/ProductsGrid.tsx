import { getProducts } from "@/lib/services/products";
import ProductCard from "@/features/catalog/components/ProductCard";
import Container from "@/components/ui/Container";

/**
 * ProductsGrid — "Thiết kế đặc trưng".
 * The cleanest kind of responsive: SAME markup, just more columns.
 *   grid-cols-2 (mobile) → md:grid-cols-4 (desktop), matching the other
 *   homepage Product rows.
 * No toggles, no duplicate markup — the grid simply reflows.
 */
export default async function ProductsGrid() {
  const products = await getProducts();

  return (
    <section className="pt-[30px] md:pt-16 pb-section bg-neutral-canvas" aria-label="Thiết kế đặc trưng">
      <Container>
        <h2 className="m-0 mb-[16px] font-serif text-heading-md font-medium leading-[1.3] text-text-primary md:mb-6 md:text-[32px]">
          Thiết kế đặc trưng
        </h2>

        <div className="grid grid-cols-2 gap-[14px] md:grid-cols-4 md:gap-[22px]">
          {products.slice(0, 6).map((product) => (
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
