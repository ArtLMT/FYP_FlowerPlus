import { formatVND } from "@/lib/utils";

interface PriceBlockProps {
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  layout?: "row" | "column";
  priceSize?: "sm" | "md" | "lg";
}

/**
 * PriceBlock — displays current price, optional crossed-out original price,
 * and optional discount badge. Used in both ProductCard and FeaturedCard.
 */
export default function PriceBlock({
  price,
  originalPrice,
  discountPercent,
  layout = "column",
  priceSize = "md",
}: PriceBlockProps) {
  const currentPriceClass =
    priceSize === "md" ? "text-body-sm" : priceSize === "lg" ? "text-body" : "text-body-sm";
  const originalPriceClass = priceSize === "md" ? "text-body-sm" : "text-label";

  return (
    <div className={`flex ${layout === "column" ? "flex-col gap-1" : "flex-row items-center gap-2"}`}>
      {originalPrice && (
        <span className={`text-text-muted line-through font-sans ${originalPriceClass}`}>
          {formatVND(originalPrice)}
        </span>
      )}
      <div className="flex items-center gap-2">
        <span className={`text-primary font-bold font-sans ${currentPriceClass}`}>
          {formatVND(price)}
        </span>
        {discountPercent && (
          <span className="bg-accent-sage-light text-[#3D5236] text-label px-2 py-0.5 rounded-full font-bold uppercase tracking-badge">
            <span className="sr-only">{discountPercent} percent off</span>
            <span aria-hidden="true">-{discountPercent}%</span>
          </span>
        )}
      </div>
    </div>
  );
}
