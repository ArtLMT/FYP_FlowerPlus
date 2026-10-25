import Button from "@/components/ui/Button";
import ProductImage from "@/components/ui/ProductImage";
import { getSaleItems } from "@/lib/services/products";
import { formatVND } from "@/lib/utils";
import Container from "@/components/ui/Container";

/**
 * SaleSection — responsive.
 *
 * Mobile: full-width banner, then a horizontal scroll strip of vertical cards.
 * Desktop: 2-column split — banner (1.15fr) beside a 2×2 grid of horizontal
 *          cards (image left, info right). The mobile strip and the desktop
 *          grid use different card markup, so they're toggled, not reflowed.
 */
export default async function SaleSection() {
  const items = await getSaleItems();

  return (
    <section className="pt-[26px] md:pt-16">
      <Container>
        {/* Heading row */}
        <div className="flex items-baseline justify-between mb-[14px] md:mb-6">
          <h2 className="font-serif font-medium text-heading-md md:text-[36px] m-0">
            Đang giảm giá
          </h2>
          <a
            href="#"
            className="font-sans font-bold text-label md:text-[13px] tracking-badge text-primary no-underline"
          >
            Xem tất cả →
          </a>
        </div>

        {/* Banner + desktop product grid */}
        <div className="md:grid md:grid-cols-[1.15fr_2fr] md:gap-6">
          {/* Sale banner */}
          <div className="relative overflow-hidden bg-primary rounded-2xl md:rounded-[20px] mb-[18px] md:mb-0 px-[22px] pt-[22px] pb-[24px] md:px-9 md:py-10 md:flex md:flex-col md:justify-center">
            <p className="font-sans font-bold text-[11px] md:text-[12px] tracking-[0.16em] text-[#ffe1da] mb-2 md:mb-3 m-0">
              ƯU ĐÃI MÙA HÈ
            </p>
            <p className="font-serif font-medium text-[38px] md:text-[56px] leading-none text-neutral-canvas mb-[6px] md:mb-3 m-0">
              Giảm đến 30%
            </p>
            <p className="font-sans text-body md:text-[15px] text-[#ffeae5] mb-[18px] md:mb-7 m-0">
              Cho các bộ sưu tập hoa theo mùa.
            </p>
            <Button className="self-start bg-neutral-canvas text-primary border-none rounded-lg md:rounded-[10px] py-3 px-[22px] md:px-[26px] font-sans font-bold text-label md:text-[12px] tracking-button cursor-pointer hover:opacity-90 transition-opacity">
              MUA NGAY
            </Button>
          </div>

          {/* Desktop: 2×2 horizontal cards */}
          <div className="hidden md:grid grid-cols-2 gap-5">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 bg-neutral-surface border border-neutral-border rounded-2xl p-[14px]"
              >
                {/* Card image with discount badge. */}
                <div className="relative flex-none w-[108px] h-[108px] rounded-xl overflow-hidden bg-neutral-raised">
                  <ProductImage src={item.imageUrl} alt={item.name} sizes="108px" />
                  <span className="absolute top-2 left-2 px-[9px] py-1 rounded-[7px] font-sans font-bold text-[10px] bg-primary text-white">
                    -{item.discountPercent}%
                  </span>
                </div>
                {/* Card name, materials, sale price, and original price. */}
                <div className="flex flex-col justify-center">
                  <h3 className="font-serif font-medium text-[19px] leading-[1.15] mb-1 m-0">
                    {item.name}
                  </h3>
                  <p className="font-sans text-[12px] text-text-muted mb-[10px] m-0">
                    {item.materials}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="font-sans font-bold text-[16px] text-primary">
                      {formatVND(item.price)}
                    </span>
                    <span className="font-sans text-[12px] text-text-muted line-through">
                      {formatVND(item.originalPrice)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>

      {/* Mobile: horizontal scroll strip of vertical cards */}
      <div className="md:hidden flex gap-[14px] overflow-x-auto px-margin-mobile pb-1 no-scrollbar">
        {items.map((item) => (
          <div key={item.id} className="flex-none w-[152px]">
            <div className="relative h-[122px] rounded-[14px] bg-neutral-surface overflow-hidden mb-[10px]">
              <ProductImage src={item.imageUrl} alt={item.name} sizes="152px" />
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
