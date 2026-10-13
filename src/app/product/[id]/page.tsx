import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import ProductDetailView from "@/features/catalog/components/ProductDetailView";
import { getProduct, getProducts } from "@/lib/services/products";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  const categoryIds = new Set(product.categories.map((category) => category.id));
  const related = (await getProducts())
    .filter((candidate) => candidate.id !== product.id
      && candidate.categories.some((category) => categoryIds.has(category.id)))
    .slice(0, 3);

  return (
    <div className="min-h-dvh bg-neutral-canvas">
      <Header />
      <ProductDetailView product={product} related={related} />
    </div>
  );
}
