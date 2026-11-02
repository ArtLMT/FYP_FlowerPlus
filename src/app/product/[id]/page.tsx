import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import ProductDetailView from "@/features/catalog/components/ProductDetailView";
import { getProduct, getRelatedProducts } from "@/lib/services/products";

/**
 * Product detail page — /product/[id].
 * Loads the product and its related products, then renders the storefront Header and the
 * detail view. The gallery, info panel, add-to-cart controls, and related row live in
 * `features/catalog/components/ProductDetailView.tsx`.
 */
export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();
  const related = await getRelatedProducts(product);

  return (
    <div className="min-h-dvh bg-neutral-canvas">
      <Header />
      {/* Gallery, product info, add-to-cart, and related products. */}
      <ProductDetailView product={product} related={related} />
    </div>
  );
}
