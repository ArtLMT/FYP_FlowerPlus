import { formatVND } from "@/lib/utils";

interface PriceBlockProps {
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  priceSize?: "sm" | "md";
  /**
   * Keep the old-price line's height even when there is no sale, so the prices of sale and
   * full-price cards line up across a grid row.
   */
  reserveOriginalLine?: boolean;
}

/**
 * PriceBlock — the price on product cards (decision 2026-11-13, layout B).
 *
 * On sale: the crossed-out old price with a small "-N%" badge on the first line, and the price
 * the customer pays, larger, on its own line below. Nothing sits beside the big price, so it
 * never runs past a phone-width card. Used in ProductCard and FeaturedCard.
 */
export default function PriceBlock({
  price,
  originalPrice,
  discountPercent,
  priceSize = "md",
  reserveOriginalLine = false,
}: PriceBlockProps) {
  const currentPriceClass = priceSize === "sm"
    ? "text-body-lg md:text-heading-sm"
    : "text-[20px] md:text-[22px]";
  const onSale = originalPrice !== undefined && originalPrice > price;

  return (
    <div className="flex flex-col gap-0.5">
      {/* Old price and discount badge, or an empty line of the same height. */}
      {onSale ? (
        <div className="flex min-h-5 flex-wrap items-center gap-x-1.5 gap-y-0.5">
          <span className="font-sans text-body-sm leading-5 text-text-muted line-through">
            <span className="sr-only">Giá gốc </span>{formatVND(originalPrice)}
          </span>
          {discountPercent !== undefined && discountPercent > 0 && (
            <span className="rounded-full bg-accent-sage-light px-1.5 font-sans text-label font-bold leading-[18px] text-[#3D5236]">
              <span className="sr-only">Giảm {discountPercent}%</span>
              <span aria-hidden="true">-{discountPercent}%</span>
            </span>
          )}
        </div>
      ) : reserveOriginalLine && <div className="min-h-5" aria-hidden="true" />}
      {/* The price the customer pays. */}
      <span className={`font-sans font-bold leading-tight text-primary ${currentPriceClass}`}>
        {onSale && <span className="sr-only">Giá bán </span>}{formatVND(price)}
      </span>
    </div>
  );
}
