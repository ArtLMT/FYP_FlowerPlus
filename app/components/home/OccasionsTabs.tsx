"use client";

import { useState } from "react";

const TABS = ["TẤT CẢ", "SINH NHẬT", "ĐÁM CƯỚI", "SỰ KIỆN"] as const;
type Tab = (typeof TABS)[number];

export default function OccasionsTabs() {
  const [active, setActive] = useState<Tab>("TẤT CẢ");

  return (
    <section className="pt-[30px] bg-neutral-canvas" aria-label="Bộ lọc bộ sưu tập">
      <div className="px-margin-mobile mb-[14px]">
        <h2 className="font-serif font-medium text-heading-md leading-[1.3] text-text-primary m-0">
          Bộ sưu tập nổi bật
        </h2>
      </div>

      <div className="flex overflow-x-auto gap-3 px-margin-mobile no-scrollbar pb-[6px]">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            aria-pressed={active === tab}
            className={`whitespace-nowrap py-[9px] px-[18px] rounded-full font-bold text-label tracking-badge transition-colors flex-shrink-0 ${
              active === tab
                ? "bg-primary text-white border-none"
                : "border border-neutral-border bg-transparent text-text-secondary hover:bg-neutral-surface"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </section>
  );
}
