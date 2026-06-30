"use client";

import { useRef } from "react";
import type { FeaturedItem } from "@/lib/types";
import FeaturedCard from "@/app/components/ui/FeaturedCard";

interface FeaturedCarouselProps {
  items: FeaturedItem[];
}

/**
 * FeaturedCarousel — Interactive client component for horizontal scrolling.
 * Provides desktop scroll buttons alongside native swipe/scroll behavior.
 */
export default function FeaturedCarousel({ items }: FeaturedCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -300 : 300;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="relative group/carousel">
      <div 
        ref={scrollContainerRef}
        className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar gap-4 px-margin-mobile"
      >
        {items.map((item) => (
          <FeaturedCard key={item.id} item={item} />
        ))}
      </div>

      {/* Desktop Scroll Buttons (hidden on mobile, shown on hover on desktop) */}
      <button 
        onClick={() => scroll("left")}
        className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 bg-neutral-canvas/80 backdrop-blur-sm border border-neutral-border text-text-primary p-2 rounded-full opacity-0 group-hover/carousel:opacity-100 transition-opacity shadow-sm hover:bg-neutral-surface"
        aria-label="Scroll left"
      >
        <span className="material-symbols-outlined text-sm">chevron_left</span>
      </button>
      <button 
        onClick={() => scroll("right")}
        className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 bg-neutral-canvas/80 backdrop-blur-sm border border-neutral-border text-text-primary p-2 rounded-full opacity-0 group-hover/carousel:opacity-100 transition-opacity shadow-sm hover:bg-neutral-surface"
        aria-label="Scroll right"
      >
        <span className="material-symbols-outlined text-sm">chevron_right</span>
      </button>
    </div>
  );
}
