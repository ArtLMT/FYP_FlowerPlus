import ProductImage from "@/components/ui/ProductImage";
import type { FeaturedItem } from "@/lib/types";
import PriceBlock from "@/components/ui/PriceBlock";

interface FeaturedCardProps {
  item: FeaturedItem;
}

/**
 * FeaturedCard — used in BOTH the mobile carousel and the desktop grid.
 *
 * It is width-agnostic (w-full): the PARENT decides the width — the carousel
 * wraps it in a fixed-width flex item, the grid drops it straight into a cell.
 * That's why one card serves two very different layouts.
 */
export default function FeaturedCard({ item }: FeaturedCardProps) {
  return (
    <div className="w-full group flex flex-col bg-neutral-surface border border-neutral-border rounded-2xl overflow-hidden hover:border-secondary transition-colors">
      {/* Image */}
      <div className="relative aspect-square md:aspect-[4/3] overflow-hidden bg-neutral-raised">
        <ProductImage
          src={item.imageUrl}
          alt={item.name}
          sizes="(max-width: 768px) 50vw, 25vw"
          className="transition-transform duration-700 group-hover:scale-105"
        />
      </div>

      {/* Info */}
      <div className="text-left p-[14px] md:p-[18px]">
        <h3 className="font-serif text-heading-sm md:text-[20px] font-medium leading-[1.15] text-text-primary tracking-heading mb-1">
          {item.name}
        </h3>
        <p className="font-sans text-label md:text-[13px] text-text-secondary mb-2 md:mb-3 leading-[1.4]">
          {item.materials}
        </p>

        <PriceBlock
          price={item.price}
          originalPrice={item.originalPrice}
          discountPercent={item.discountPercent}
          priceSize="sm"
        />
      </div>
    </div>
  );
}
