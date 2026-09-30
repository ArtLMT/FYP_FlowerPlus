"use client";

import { use, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, notFound } from "next/navigation";
import { formatVND } from "@/lib/utils";
import { useCart } from "@/features/cart/cart-provider";
import Header from "@/components/layout/Header";
import { products } from "@/lib/mock-data";
import { DECORATIONS, OCCASIONS } from "@/features/catalog/filters";
import type { Product, StockStatus } from "@/lib/types";

/**
 * Product detail — /product/[id]
 *
 * Client Component. Looks the product up in the mock catalog by the route param
 * (Next 16: `params` is a Promise, read with React's `use`). Gallery, detail
 * rows and "related" are all derived from the product's structured fields, so
 * there's no per-product PDP copy to drift. Interface state (thumbnail, qty,
 * accordions) plus the real "add to cart" wired to the shared cart store.
 *
 * TODO(api): swap the `products.find` for a real fetch by id.
 */

const DECOR_LABEL = Object.fromEntries(DECORATIONS.map((d) => [d.key, d.label]));
const OCCASION_LABEL = Object.fromEntries(OCCASIONS.map((o) => [o.key, o.label]));
const STOCK_LABEL: Record<StockStatus, string> = {
  "IN STOCK": "Còn hàng",
  "LOW STOCK": "Sắp hết hàng",
  "OUT OF STOCK": "Hết hàng",
};

/** Spec rows shown in the "Chi tiết" accordion, derived from the product. */
function detailRows(product: Product): { k: string; v: string }[] {
  return [
    { k: "Chất liệu", v: product.materials },
    { k: "Kiểu dáng", v: DECOR_LABEL[product.decorationType] ?? product.decorationType },
    ...(product.occasion ? [{ k: "Dịp", v: OCCASION_LABEL[product.occasion] ?? product.occasion }] : []),
    { k: "Tình trạng", v: STOCK_LABEL[product.stock] },
    { k: "Độ bền", v: "5–7 ngày nếu chăm đúng cách" },
  ];
}

/** Up to 3 suggestions: same occasion first, then padded with other products. */
function relatedTo(product: Product): Product[] {
  const sameOccasion = products.filter(
    (p) => p.id !== product.id && p.occasion === product.occasion
  );
  const others = products.filter((p) => p.id !== product.id && p.occasion !== product.occasion);
  return [...sameOccasion, ...others].slice(0, 3);
}

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const product = products.find((p) => p.id === id);
  if (!product) notFound();

  const router = useRouter();
  const { add } = useCart();
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [returnsOpen, setReturnsOpen] = useState(false);
  const [added, setAdded] = useState(false);

  const images = product.images?.length ? product.images : [product.imageUrl];
  const rows = detailRows(product);
  const related = relatedTo(product);
  const soldOut = product.stock === "OUT OF STOCK";

  const handleAdd = () => {
    add(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyNow = () => {
    add(product, quantity);
    router.push("/checkout/delivery");
  };

  return (
    <div className="min-h-dvh bg-neutral-canvas">
      <Header />
      {/* Desktop: constrained container. Mobile: full-bleed. */}
      <div className="md:max-w-[1120px] md:mx-auto md:px-8 md:py-10">
        {/* Top: gallery + info (2-col on desktop) */}
        <div className="md:grid md:grid-cols-2 md:gap-12 md:items-start">
          {/* ── LEFT: gallery (sticky on desktop, below the header) ── */}
          <div className="md:sticky md:top-[90px] md:self-start">
            <div className="relative h-[320px] md:h-auto md:aspect-square bg-neutral-raised md:rounded-2xl md:overflow-hidden">
              <Image
                src={images[activeImage]}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 520px"
                style={{ objectFit: "cover" }}
              />
              <button
                className="absolute top-[18px] right-[18px] w-10 h-10 rounded-full bg-black/30 flex items-center justify-center text-white"
                aria-label="Chia sẻ"
              >
                <span className="material-symbols-outlined">share</span>
              </button>
            </div>

            {/* Thumbnails (only when there's more than one shot) */}
            {images.length > 1 && (
              <div className="flex gap-3 px-[18px] md:px-0 pt-4">
                {images.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`relative w-[70px] h-[70px] md:w-20 md:h-20 rounded-[10px] overflow-hidden ${
                      i === activeImage ? "border-2 border-primary" : "border border-neutral-border"
                    }`}
                    aria-label={`Ảnh ${i + 1}`}
                    aria-pressed={i === activeImage}
                  >
                    <Image src={src} alt="" fill sizes="80px" style={{ objectFit: "cover" }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT: info + accordions ── */}
          <div>
            <div className="px-[18px] md:px-0 pt-[18px] md:pt-0">
              <h1 className="font-serif font-medium text-[34px] md:text-[44px] leading-[1.05] text-primary m-0">
                {product.name}
              </h1>
              <p className="font-sans text-body md:text-body-lg text-text-muted mt-2 m-0">
                {product.materials}
              </p>

              <div className="flex items-center gap-3 mt-[14px]">
                {product.originalPrice && (
                  <span className="font-sans text-[16px] text-text-muted line-through">
                    {formatVND(product.originalPrice)}
                  </span>
                )}
                <span className="font-sans font-bold text-[26px] md:text-[32px] text-primary">
                  {formatVND(product.price)}
                </span>
                {product.discountPercent && (
                  <span className="px-[10px] py-1 rounded-lg font-sans font-bold text-[12px] bg-accent-sage-light text-[#3D5236]">
                    -{product.discountPercent}%
                  </span>
                )}
              </div>

              {/* Quantity */}
              <div className="flex items-center justify-between md:justify-start md:gap-6 border-[1.5px] border-neutral-border rounded-full px-2 py-[6px] mt-5 md:w-fit">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-[38px] h-[38px] rounded-full flex items-center justify-center text-text-secondary hover:bg-neutral-surface transition-colors"
                  aria-label="Giảm số lượng"
                >
                  <span className="material-symbols-outlined">remove</span>
                </button>
                <span className="font-sans font-bold text-[17px] text-text-primary">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-[38px] h-[38px] rounded-full flex items-center justify-center text-text-secondary hover:bg-neutral-surface transition-colors"
                  aria-label="Tăng số lượng"
                >
                  <span className="material-symbols-outlined">add</span>
                </button>
              </div>

              {/* Buttons */}
              <div className="grid grid-cols-2 gap-[14px] mt-4">
                <button
                  onClick={handleAdd}
                  disabled={soldOut}
                  className="bg-transparent text-primary border-[1.5px] border-primary rounded-full py-[17px] font-sans font-bold text-body-sm tracking-button hover:bg-neutral-surface transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {added ? "ĐÃ THÊM ✓" : "THÊM VÀO GIỎ"}
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={soldOut}
                  className="bg-primary text-white border-[1.5px] border-primary rounded-full py-[17px] text-center font-sans font-bold text-body-sm tracking-button hover:bg-primary-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {soldOut ? "HẾT HÀNG" : "MUA NGAY"}
                </button>
              </div>
            </div>

            {/* Details accordion */}
            <div className="mt-[22px] md:mt-8 border-t border-neutral-border">
              <button
                onClick={() => setDetailsOpen((o) => !o)}
                className="w-full flex items-center justify-between px-[18px] md:px-0 py-5"
                aria-expanded={detailsOpen}
              >
                <span className="font-serif font-medium text-heading-md text-text-primary">Chi tiết</span>
                <span className={`material-symbols-outlined transition-transform ${detailsOpen ? "rotate-180" : ""}`}>
                  expand_more
                </span>
              </button>
              {detailsOpen && (
                <div className="px-[18px] md:px-0 pb-[18px]">
                  {rows.map((d) => (
                    <div key={d.k} className="flex items-center justify-between py-[14px] border-b border-neutral-border">
                      <span className="font-sans text-body text-text-muted">{d.k}</span>
                      <span className="font-sans font-bold text-body text-primary">{d.v}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Delivery & Returns accordion */}
            <div className="border-t border-neutral-border">
              <button
                onClick={() => setReturnsOpen((o) => !o)}
                className="w-full flex items-center justify-between px-[18px] md:px-0 py-5"
                aria-expanded={returnsOpen}
              >
                <span className="font-serif font-medium text-heading-md text-text-primary">
                  Giao hàng &amp; Đổi trả
                </span>
                <span className={`material-symbols-outlined transition-transform ${returnsOpen ? "rotate-180" : ""}`}>
                  expand_more
                </span>
              </button>
              {returnsOpen && (
                <div className="px-[18px] md:px-0 pb-5">
                  <p className="font-sans text-body leading-[1.6] text-text-secondary m-0">
                    Giao trong ngày cho đơn đặt trước 14:00. Hoa cắt tươi được bảo đảm trong 7 ngày —
                    nếu hoa đến tay không hoàn hảo, chúng tôi đổi mới miễn phí.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recommendations — full width below, grid on desktop */}
        <div className="border-t border-neutral-border pt-6 md:pt-12 md:mt-10 pb-8">
          <h2 className="font-serif font-medium text-heading-md md:text-[32px] mx-[18px] md:mx-0 mb-4 md:mb-6">
            Có thể bạn cũng thích
          </h2>
          <div className="flex md:grid md:grid-cols-3 gap-[14px] md:gap-6 overflow-x-auto md:overflow-visible no-scrollbar px-[18px] md:px-0">
            {related.map((p) => (
              <Link
                key={p.id}
                href={`/product/${p.id}`}
                className="flex-none w-[198px] md:w-auto bg-neutral-surface border border-neutral-border rounded-2xl overflow-hidden hover:border-secondary transition-colors"
              >
                <div className="relative h-[168px] md:h-[220px] bg-neutral-raised">
                  <Image src={p.imageUrl} alt={p.name} fill sizes="(max-width: 768px) 198px, 33vw" style={{ objectFit: "cover" }} />
                </div>
                <div className="px-[15px] md:px-5 pt-[14px] pb-4 md:pb-5">
                  <div className="font-serif font-medium text-[21px] mb-1">{p.name}</div>
                  <div className="font-sans text-body-sm text-text-muted leading-[1.4] mb-3 min-h-[36px]">
                    {p.materials}
                  </div>
                  {p.originalPrice && (
                    <div className="font-sans text-body-sm text-text-muted line-through">
                      {formatVND(p.originalPrice)}
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-[3px]">
                    <span className="font-sans font-bold text-[17px] text-primary">
                      {formatVND(p.price)}
                    </span>
                    {p.discountPercent && (
                      <span className="px-2 py-[3px] rounded-[7px] font-sans font-bold text-label bg-accent-sage-light text-[#3D5236]">
                        -{p.discountPercent}%
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
