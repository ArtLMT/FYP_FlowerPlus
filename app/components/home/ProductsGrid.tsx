import { getProducts } from "@/lib/services/products";
import ProductCard from "@/app/components/ui/ProductCard";

export default async function ProductsGrid() {
  const products = await getProducts();

  return (
    <section
      className="px-margin-mobile pt-[30px] pb-section bg-neutral-canvas"
      aria-label="Thiết kế đặc trưng"
    >
      <h2 className="font-serif font-medium text-heading-md leading-[1.4] text-text-primary mb-[16px] m-0">
        Thiết kế đặc trưng
      </h2>

      <div className="grid grid-cols-2 gap-[14px]">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <div className="pt-[22px] text-center">
        <a
          href="/shop"
          className="font-sans text-label font-bold tracking-badge text-primary no-underline hover:underline"
        >
          XEM THÊM
        </a>
      </div>
    </section>
  );
}
