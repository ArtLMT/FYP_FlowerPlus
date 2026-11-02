import ProductImage from "@/components/ui/ProductImage";
import Link from "next/link";
import { availabilityOf, type PublicProductSummary } from "@/lib/services/products";
import PriceBlock from "@/components/ui/PriceBlock";

interface ProductCardProps {
  product: PublicProductSummary;
}

/**
 * ProductCard — standard grid card used in Signature Arrangements and Shop.
 *
 * The whole card is a link to the product detail page, so both the homepage
 * grid and the /shop grid navigate on tap. Out-of-stock products stay listed, marked as such.
 */
export default function ProductCard({ product }: ProductCardProps) {
  const availability = availabilityOf(product);

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
        {/* Product name and category list. */}
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
        {/* Availability badge (in stock / out of stock …). */}
        {/*<span*/}
        {/*  className={`mt-2 self-start rounded-md px-2 py-[2px] font-sans text-label font-bold tracking-badge ${*/}
        {/*    availability.canBuy ? "bg-accent-sage-light text-accent-sage" : "bg-tertiary text-primary"*/}
        {/*  }`}>*/}
        {/*  {availability.title}*/}
        {/*</span>*/}
      </div>
    </Link>
  );
}
