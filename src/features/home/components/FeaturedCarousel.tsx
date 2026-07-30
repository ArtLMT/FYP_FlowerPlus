"use client";

import { useRef } from "react";
import type { FeaturedItem } from "@/lib/types";
import FeaturedCard from "@/features/catalog/components/FeaturedCard";

interface FeaturedCarouselProps {
  items: FeaturedItem[];
}

/**
 * FeaturedCarousel — the MOBILE presentation of featured items: a horizontal
 * snap-scroll strip. Each card is wrapped in a fixed-width flex item here
 * (the card itself is width-agnostic).
 *
 * On desktop this whole component is hidden (see FeaturedCollections); the
 * desktop grid is used instead.
 */
export default function FeaturedCarousel({ items }: FeaturedCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative">
      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar gap-4 px-margin-mobile"
      >
        {items.map((item) => (
          <div key={item.id} className="flex-none w-[calc(50%-8px)] snap-start">
            <FeaturedCard item={item} />
          </div>
        ))}
      </div>
    </div>
  );
}
