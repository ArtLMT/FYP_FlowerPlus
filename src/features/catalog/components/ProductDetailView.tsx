"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import ProductImage from "@/components/ui/ProductImage";
import ProductCard from "@/features/catalog/components/ProductCard";
import { useAddToCart } from "@/features/catalog/hooks/use-add-to-cart";
import type { ProductDetail, PublicProductSummary, PublicProductType } from "@/lib/services/products";
import { formatVND } from "@/lib/utils";

const TYPE_LABEL: Record<PublicProductType, string> = {
  PRE_ORDER: "Hoa đặt trước",
  PRE_MADE: "Sản phẩm làm sẵn",
};

/**
 * Product detail screen.
 *
 * UI map:
 * - Left column (sticky on desktop): main image, then the thumbnail picker.
 * - Right column: type/category chips → name/description → price → availability card
 *   → Add to cart / Buy now buttons → "Chi tiết" spec list.
 * - Bottom: "Có thể bạn cũng thích" related-product grid.
 * - Add-to-cart behaviour lives in `hooks/use-add-to-cart.ts`.
 */
export default function ProductDetailView({
  product,
  related,
}: {
  product: ProductDetail;
  related: PublicProductSummary[];
}) {
  const [activeImage, setActiveImage] = useState(0);
  const { adding, addToCart } = useAddToCart(product.id);
  const { availability, images } = product;
  const visibleImage = images[Math.min(activeImage, Math.max(0, images.length - 1))];
  const categoryNames = product.categories.map((category) => category.name).join(" · ");

  return (
    <main className="md:max-w-[1120px] md:mx-auto md:px-8 md:py-10">
      {/* Two-column layout on desktop; stacked on mobile. */}
      <div className="md:grid md:grid-cols-2 md:gap-12 md:items-start">
        {/* Image gallery column. */}
        <div className="md:sticky md:top-[90px] md:self-start">
          {/* Main (selected) image. */}
          <div className="relative h-[320px] bg-neutral-raised md:h-auto md:aspect-square md:overflow-hidden md:rounded-2xl">
            <ProductImage
              src={visibleImage?.contentUrl}
              alt={product.name}
              priority
              sizes="(max-width: 768px) 100vw, 520px"
            />
          </div>

          {/* Thumbnail buttons; only shown when there is more than one image. */}
          {images.length > 1 && (
            <div className="flex gap-3 px-[18px] pt-4 md:px-0">
              {images.map((image, index) => (
                <Button
                  key={image.id}
                  onClick={() => setActiveImage(index)}
                  className={`relative h-[70px] w-[70px] overflow-hidden rounded-[10px] md:h-20 md:w-20 ${
                    index === activeImage ? "border-2 border-primary" : "border border-neutral-border"
                  }`}
                  aria-label={`Ảnh ${index + 1}`}
                  aria-pressed={index === activeImage}
                >
                  <ProductImage src={image.contentUrl} alt="" sizes="80px" />
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Product information column. */}
        <div className="px-[18px] pb-8 pt-[18px] md:px-0 md:pt-0">
          {/* Product-type chip and category chips. */}
          <div className="mb-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-accent-sage-light px-3 py-1 font-sans text-xs font-bold text-[#3D5236]">
              {TYPE_LABEL[product.type]}
            </span>
            {product.categories.map((category) => (
              <span key={category.id} className="rounded-full border border-neutral-border px-3 py-1 font-sans text-xs text-text-secondary">
                {category.name}
              </span>
            ))}
          </div>

          {/* Product name and description. */}
          <h1 className="m-0 font-serif text-[34px] font-medium leading-[1.05] text-primary md:text-[44px]">
            {product.name}
          </h1>
          <p className="mt-3 font-sans text-body leading-[1.7] text-text-secondary md:text-body-lg">
            {product.description}
          </p>

          {/* Listed price. */}
          <div className="mt-5">
            <span className="block font-sans text-xs font-bold uppercase tracking-badge text-text-muted">Giá niêm yết</span>
            <span className="font-sans text-[26px] font-bold text-primary md:text-[32px]">
              {formatVND(product.basePrice)}
            </span>
          </div>

          {/* Availability card (title + explanation). */}
          <div className="mt-6 rounded-2xl border border-neutral-border bg-neutral-surface p-4">
            <p className="m-0 font-sans text-sm font-bold text-text-primary">{availability.title}</p>
            <p className="mb-0 mt-1 font-sans text-sm leading-relaxed text-text-muted">{availability.detail}</p>
          </div>

          {/* "THÊM VÀO GIỎ" and "MUA NGAY" buttons; disabled when the product cannot be bought. */}
          <div className="mt-4 grid grid-cols-2 gap-[14px]">
            <Button
              onClick={() => void addToCart(false)}
              disabled={!availability.canBuy || adding}
              className="rounded-full border-[1.5px] border-primary py-[17px] font-sans text-body-sm font-bold tracking-button text-primary hover:bg-neutral-surface"
            >
              THÊM VÀO GIỎ
            </Button>
            <Button
              onClick={() => void addToCart(true)}
              disabled={!availability.canBuy || adding}
              className="rounded-full bg-primary py-[17px] font-sans text-body-sm font-bold tracking-button text-white hover:bg-primary-hover"
            >
              MUA NGAY
            </Button>
          </div>

          {/* "Chi tiết" spec list: product type and categories. */}
          <section className="mt-8 border-t border-neutral-border pt-5" aria-labelledby="product-details-heading">
            <h2 id="product-details-heading" className="font-serif text-heading-md font-medium text-text-primary">Chi tiết</h2>
            <dl className="mt-3">
              <div className="flex items-center justify-between border-b border-neutral-border py-[14px]">
                <dt className="font-sans text-body text-text-muted">Loại sản phẩm</dt>
                <dd className="font-sans text-body font-bold text-primary">{TYPE_LABEL[product.type]}</dd>
              </div>
              <div className="flex items-center justify-between border-b border-neutral-border py-[14px]">
                <dt className="font-sans text-body text-text-muted">Danh mục</dt>
                <dd className="max-w-[65%] text-right font-sans text-body font-bold text-primary">{categoryNames}</dd>
              </div>
            </dl>
          </section>
        </div>
      </div>

      {/* Related-products grid at the bottom of the page. */}
      {related.length > 0 && (
        <section className="border-t border-neutral-border px-[18px] pb-8 pt-6 md:mt-10 md:px-0 md:pt-12" aria-labelledby="related-products-heading">
          <h2 id="related-products-heading" className="mb-4 font-serif text-heading-md font-medium md:mb-6 md:text-[32px]">
            Có thể bạn cũng thích
          </h2>
          <div className="grid grid-cols-2 gap-[14px] md:grid-cols-3 md:gap-6">
            {related.map((candidate) => <ProductCard key={candidate.id} product={candidate} />)}
          </div>
        </section>
      )}
    </main>
  );
}
