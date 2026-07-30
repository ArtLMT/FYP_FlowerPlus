"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { formatVND } from "@/lib/utils";
import { useCart } from "@/features/cart/cart-provider";
import Header from "@/components/layout/Header";
import type { Product } from "@/lib/types";

/**
 * Product detail — /product
 *
 * Client Component. Interface state (thumbnail, quantity, accordions) plus the
 * real "add to cart" wired to the shared cart store.
 *
 * TODO(api): load this product (and `related`) by id — this will become
 *            /product/[id] with a real fetch.
 */

const PRODUCT = {
  id: "pdp-nhung-dem",
  name: "Nhung Đêm",
  materials: "Hồng đỏ thẫm, Bạch đàn, Ruscus",
  price: 1200000,
  originalPrice: 1540000,
  discountPercent: 22,
  images: [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCSmkSgMDgNa_sr1692th8VHhzWjJcPzbq5aqrhkiFTAqBeOYrD_GLVUzLIJcaD0_t_enhC0N0oTus5Zcqve-i5kPJ2i_kpruq18MlKlu5-lUxW9YUi9gTxp2XePM3c1zNi4mKdrjHkpwogX34HJFKQfTfZ1wL_W_zUvd9lUAEy0ugypQjvMTIw56SUBw7Y_CA2lgJGoAJNMUYDp7mCUOVOxZpsR2ER83lifNQsf8-zRum06W4wlWdFSxMOgByn6YQA-WiQYbLPsME",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCYDmsLMWFACA0R51yv4dgXbYDLJMZLk-iuqO7N5fG4AC9Dw2zZRBkwiS4I9kxb7R6PKrLE-YY32ZzEsE9wJybuGPWrSq649z9PGhdNxtyooI8g0aJJatQVmp44E2h2_u2s2inUz4-4noqpY2zeu-k9x0H1XXt0ubxphBE5fqezLqUn2NwFW59BO8s4NRJqjnMQUPs62eRF8rH3T9k00qBuB9ORwONK1ECh6qbXB_aTIthzw6SRmtZk4jNiCK0wBVk8VQXikwERgBM",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBJdxt2vU0MXJHzIqkT6_Vx0sV2bht99bOm7GL7RogbnW6PrD-CIjsk76EjJpNQdGA2OVO0gAvyDRd1GGtPR24EU2ymPb4YhbQWLve_f6eDnXGhHK8_o7FtavC1WNsQ9QSotD0fHGZCTPmmVXB7jfLhNN1eTU48YVLAzN9_aEdDbjKs99sLg-FalNOUyHOgK4T7hHLBBJ88nGd5VghInGelaifmU0BlGyJgvKjNp3H_UhLBCQhvuRL5yVGGSbymeGI5_l6seOmZSzo",
  ],
};

const DETAIL_ROWS = [
  { k: "Số cành", v: "12 hồng đỏ thẫm" },
  { k: "Bao gồm", v: "Bạch đàn, Ruscus" },
  { k: "Bình hoa", v: "Không kèm theo" },
  { k: "Độ bền", v: "5–7 ngày nếu chăm đúng cách" },
];

const RELATED = [
  { id: "r1", name: "Sương Mai", sub: "Hải quỳ, Bạch đàn, Bông", price: 450000, was: 600000, discount: 25, bg: "#d8c0bb" },
  { id: "r2", name: "Giờ Vàng", sub: "Hướng dương, Cúc La Mã", price: 520000, was: 650000, discount: 20, bg: "#cab39d" },
  { id: "r3", name: "Bình Minh San Hô", sub: "Hồng san hô, Mao lương", price: 680000, was: 850000, discount: 20, bg: "#bf9b91" },
];

// The catalog Product this PDP represents, for the cart store.
const asProduct = (): Product => ({
  id: PRODUCT.id,
  name: PRODUCT.name,
  materials: PRODUCT.materials,
  price: PRODUCT.price,
  originalPrice: PRODUCT.originalPrice,
  discountPercent: PRODUCT.discountPercent,
  imageUrl: PRODUCT.images[0],
  stock: "IN STOCK",
});

export default function ProductPage() {
  const router = useRouter();
  const { add } = useCart();
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [returnsOpen, setReturnsOpen] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    add(asProduct(), quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyNow = () => {
    add(asProduct(), quantity);
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
                src={PRODUCT.images[activeImage]}
                alt={PRODUCT.name}
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

            {/* Thumbnails */}
            <div className="flex gap-3 px-[18px] md:px-0 pt-4">
              {PRODUCT.images.map((src, i) => (
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
          </div>

          {/* ── RIGHT: info + accordions ── */}
          <div>
            <div className="px-[18px] md:px-0 pt-[18px] md:pt-0">
              <h1 className="font-serif font-medium text-[34px] md:text-[44px] leading-[1.05] text-primary m-0">
                {PRODUCT.name}
              </h1>
              <p className="font-sans text-body md:text-body-lg text-text-muted mt-2 m-0">
                {PRODUCT.materials}
              </p>

              <div className="flex items-center gap-3 mt-[14px]">
                <span className="font-sans text-[16px] text-text-muted line-through">
                  {formatVND(PRODUCT.originalPrice)}
                </span>
                <span className="font-sans font-bold text-[26px] md:text-[32px] text-primary">
                  {formatVND(PRODUCT.price)}
                </span>
                <span className="px-[10px] py-1 rounded-lg font-sans font-bold text-[12px] bg-accent-sage-light text-[#3D5236]">
                  -{PRODUCT.discountPercent}%
                </span>
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
                  className="bg-transparent text-primary border-[1.5px] border-primary rounded-full py-[17px] font-sans font-bold text-body-sm tracking-button hover:bg-neutral-surface transition-colors"
                >
                  {added ? "ĐÃ THÊM ✓" : "THÊM VÀO GIỎ"}
                </button>
                <button
                  onClick={handleBuyNow}
                  className="bg-primary text-white border-[1.5px] border-primary rounded-full py-[17px] text-center font-sans font-bold text-body-sm tracking-button hover:bg-primary-hover transition-colors"
                >
                  MUA NGAY
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
                  {DETAIL_ROWS.map((d) => (
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
            {RELATED.map((p) => (
              <div
                key={p.id}
                className="flex-none w-[198px] md:w-auto bg-neutral-surface border border-neutral-border rounded-2xl overflow-hidden"
              >
                <div className="h-[168px] md:h-[220px]" style={{ backgroundColor: p.bg }} />
                <div className="px-[15px] md:px-5 pt-[14px] pb-4 md:pb-5">
                  <div className="font-serif font-medium text-[21px] mb-1">{p.name}</div>
                  <div className="font-sans text-body-sm text-text-muted leading-[1.4] mb-3 min-h-[36px]">
                    {p.sub}
                  </div>
                  <div className="font-sans text-body-sm text-text-muted line-through">
                    {formatVND(p.was)}
                  </div>
                  <div className="flex items-center gap-2 mt-[3px]">
                    <span className="font-sans font-bold text-[17px] text-primary">
                      {formatVND(p.price)}
                    </span>
                    <span className="px-2 py-[3px] rounded-[7px] font-sans font-bold text-label bg-accent-sage-light text-[#3D5236]">
                      -{p.discount}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
