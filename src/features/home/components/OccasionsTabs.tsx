"use client";

import { useState } from "react";
import Container from "@/components/ui/Container";

const TABS = ["TẤT CẢ", "SINH NHẬT", "ĐÁM CƯỚI", "SỰ KIỆN"] as const;
type Tab = (typeof TABS)[number];

/**
 * OccasionsTabs — "Bộ sưu tập nổi bật" heading + filter pills.
 * Together with FeaturedCollections (the grid below) this forms one section.
 *
 * Mobile: heading, then pills on a scrollable row beneath it.
 * Desktop: heading left, pills right, on a single row (md:flex-row).
 */
export default function OccasionsTabs() {
  const [active, setActive] = useState<Tab>("TẤT CẢ");

  return (
    <section className="pt-[30px] md:pt-16 bg-neutral-canvas" aria-label="Bộ lọc bộ sưu tập">
      <Container>
        <div className="flex flex-col gap-[14px] md:flex-row md:items-center md:justify-between md:gap-4">
          <h2 className="font-serif font-medium text-heading-md md:text-[36px] leading-[1.3] text-text-primary m-0">
            Bộ sưu tập nổi bật
          </h2>

          <div className="flex overflow-x-auto gap-3 no-scrollbar pb-[6px] md:pb-0 md:overflow-visible -mx-5 px-5 md:mx-0 md:px-0">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActive(tab)}
                aria-pressed={active === tab}
                className={`whitespace-nowrap py-[9px] px-[18px] md:px-5 rounded-full font-bold text-label tracking-badge transition-colors flex-shrink-0 ${
                  active === tab
                    ? "bg-primary text-white border-none"
                    : "border border-neutral-border bg-transparent text-text-secondary hover:bg-neutral-surface"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
