import Image from "next/image";
import { getSaleItems } from "@/lib/services/products";
import { formatVND } from "@/lib/utils";

export default async function SaleSection() {
  const items = await getSaleItems();

  return (
    <section className="pt-[26px]">
      {/* Heading row */}
      <div className="flex items-baseline justify-between px-margin-mobile mb-[14px]">
        <h2 className="font-serif font-medium text-heading-md m-0">Đang giảm giá</h2>
        <a
          href="#"
          className="font-sans font-bold text-label tracking-badge text-primary no-underline"
        >
          Xem tất cả →
        </a>
      </div>

      {/* Sale banner */}
      <div className="relative overflow-hidden bg-primary rounded-2xl mx-margin-mobile mb-[18px] px-[22px] pt-[22px] pb-[24px]">
        <p className="font-sans font-bold text-[11px] tracking-[0.16em] text-[#ffe1da] mb-2 m-0">
          ƯU ĐÃI MÙA HÈ
        </p>
        <p className="font-serif font-medium text-[38px] leading-none text-neutral-canvas mb-[6px] m-0">
          Giảm đến 30%
        </p>
        <p className="font-sans text-body text-[#ffeae5] mb-[18px] m-0">
          Cho các bộ sưu tập hoa theo mùa.
        </p>
        <button className="bg-neutral-canvas text-primary border-none rounded-lg py-3 px-[22px] font-sans font-bold text-label tracking-button cursor-pointer hover:opacity-90 transition-opacity">
          MUA NGAY
        </button>
      </div>

      {/* Sale product strip */}
      <div className="flex gap-[14px] overflow-x-auto px-margin-mobile pb-1 no-scrollbar">
        {items.map((item) => (
          <div key={item.id} className="flex-none w-[152px]">
            <div className="relative h-[122px] rounded-[14px] bg-neutral-surface overflow-hidden mb-[10px]">
              <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                sizes="152px"
                style={{ objectFit: "cover" }}
              />
              <span className="absolute top-[9px] left-[9px] px-[9px] py-1 rounded-[7px] font-sans font-bold text-[10px] tracking-[0.04em] bg-primary text-white">
                -{item.discountPercent}%
              </span>
            </div>
            <h3 className="font-serif font-medium text-heading-sm leading-[1.15] mb-1 m-0">
              {item.name}
            </h3>
            <p className="font-sans text-[12px] text-text-muted mb-[7px] m-0">{item.materials}</p>
            <div className="flex items-center gap-2">
              <span className="font-sans font-bold text-[15px] text-primary">
                {formatVND(item.price)}
              </span>
              <span className="font-sans text-[12px] text-text-muted line-through">
                {formatVND(item.originalPrice)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
