import Image from "next/image";
import type { Product } from "@/lib/types";
import PriceBlock from "@/app/components/ui/PriceBlock";

interface ProductCardProps {
  product: Product;
}

/**
 * ProductCard — standard grid card used in Signature Arrangements and Shop.
 */
export default function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="group flex flex-col bg-neutral-surface border border-neutral-border rounded-[4px] p-[14px] hover:border-secondary transition-colors">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden rounded-[4px] bg-neutral-raised mb-4">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 33vw"
          style={{ objectFit: "cover" }}
          className="transition-transform duration-700 group-hover:scale-105"
        />
      </div>

      {/* Info */}
      <div className="text-left">
        <h3 className="font-serif text-heading-md font-medium leading-[1.4] text-text-primary tracking-heading">
          {product.name}
        </h3>
        <p className="font-sans text-body-sm text-text-secondary mb-2 leading-[1.4]">
          {product.materials}
        </p>

        {/* Price block */}
        <div className="flex items-center justify-between w-full mt-4">
          <PriceBlock
            price={product.price}
            originalPrice={product.originalPrice}
            discountPercent={product.discountPercent}
            priceSize="md"
          />
        </div>
      </div>
    </article>
  );
}
