import ProductImage from "@/components/ui/ProductImage";
import Link from "next/link";
import type { PublicProductSummary } from "@/lib/types";
import PriceBlock from "@/components/ui/PriceBlock";

interface ProductCardProps {
  product: PublicProductSummary;
}

/**
 * ProductCard — standard grid card used in Signature Arrangements and Shop.
 *
 * The whole card is a link to the product detail page, so both the homepage
 * grid and the /shop grid navigate on tap.
 */
export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/product/${product.id}`}
      aria-label={product.name}
      className="group flex h-full flex-col rounded-[4px] border border-neutral-border bg-neutral-surface p-[14px] transition-colors hover:border-secondary">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden rounded-[4px] bg-neutral-raised mb-4">
        <ProductImage
          src={product.mainImageUrl}
          alt={product.name}
          sizes="(max-width: 768px) 50vw, 33vw"
          className="transition-transform duration-700 group-hover:scale-105"
        />
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col text-left">
        <h3 className="line-clamp-2 min-h-[2.8em] font-serif text-heading-md font-medium leading-[1.4] tracking-heading text-text-primary">
          {product.name}
        </h3>
        <p className="mb-2 min-h-[1.4em] line-clamp-1 font-sans text-body-sm leading-[1.4] text-text-secondary">
          {product.categories.map((category) => category.name).join(" · ")}
        </p>

        {/* Price block */}
        <div className="mt-auto flex w-full items-center justify-between pt-4">
          <PriceBlock
            price={product.basePrice}
            priceSize="md"
          />
        </div>
      </div>
    </Link>
  );
}
