import Image from "next/image";
import type { FeaturedItem } from "@/lib/types";
import PriceBlock from "@/app/components/ui/PriceBlock";

interface FeaturedCardProps {
  item: FeaturedItem;
}

/**
 * FeaturedCard — compact card for the horizontal snap carousel.
 * Width is managed by the parent container (`w-[calc(50%-8px)]`).
 */
export default function FeaturedCard({ item }: FeaturedCardProps) {
  return (
    <div className="flex-none w-[calc(50%-8px)] snap-start group flex flex-col bg-neutral-surface border border-neutral-border rounded-[4px] p-3 hover:border-secondary transition-colors">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden rounded-[4px] bg-neutral-raised mb-3">
        <Image
          src={item.imageUrl}
          alt={item.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          style={{ objectFit: "cover" }}
          className="transition-transform duration-700 group-hover:scale-105"
        />
      </div>

      {/* Info */}
      <div className="text-left">
        <h3 className="font-serif text-heading-sm font-medium leading-[1.3] text-text-primary tracking-heading">
          {item.name}
        </h3>
        <p className="font-sans text-label text-text-secondary mb-2 leading-[1.4]">
          {item.materials}
        </p>

        {/* Pricing */}
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
