"use client";

import Link from "next/link";
import Image from "next/image";
import { formatVND } from "@/lib/utils";
import { useCart } from "@/features/cart/cart-provider";

/**
 * Cart — /cart
 *
 * Now a consumer of the shared cart store: the same items the PDP adds to and
 * checkout reads. Checkbox / stepper / delete all mutate the store.
 *
 * TODO(logic): apply a voucher; checkout only the selected items.
 */

const DISCOUNT = 200000; // TODO(logic): from an applied voucher
const DELIVERY = 150000; // TODO(logic): from the delivery service

function SummaryRow({ label, value, deep }: { label: string; value: string; deep?: boolean }) {
  const color = deep ? "text-primary-deep" : "text-text-secondary";
  return (
    <div className="flex items-center justify-between">
      <span className={`font-sans text-body ${color}`}>{label}</span>
      <span className={`font-sans text-body ${color}`}>{value}</span>
    </div>
  );
}

export default function CartPage() {
  const { items, setQty, toggle, remove, selectedCount, subtotal } = useCart();

  const discount = selectedCount ? DISCOUNT : 0;
  const delivery = selectedCount ? DELIVERY : 0;
  const total = subtotal - discount + delivery;

  return (
    <div className="min-h-dvh bg-neutral-canvas pb-32">
      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center px-3 py-4 bg-neutral-canvas border-b border-neutral-border">
        <Link
          href="/"
          className="w-10 h-10 rounded-full flex items-center justify-center text-text-secondary hover:bg-neutral-surface transition-colors"
          aria-label="Quay lại"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <h1 className="font-serif font-medium text-[30px] text-primary leading-none m-0">
          Giỏ hàng
        </h1>
      </header>

      {items.length === 0 ? (
        <div className="text-center py-24 px-6">
          <p className="font-serif italic text-heading-sm text-text-muted m-0">
            Giỏ hàng của bạn đang trống.
          </p>
          <Link
            href="/shop"
            className="inline-block mt-6 bg-primary text-white rounded-full py-3 px-8 font-sans font-bold text-body-sm tracking-button hover:bg-primary-hover transition-colors"
          >
            TIẾP TỤC MUA SẮM
          </Link>
        </div>
      ) : (
        <>
          {/* Item list */}
          <div className="flex flex-col gap-4">
            {items.map(({ product, qty, selected }) => (
              <div
                key={product.id}
                className="relative flex items-start gap-[9px] bg-neutral-surface border border-neutral-border p-4"
              >
                {/* Select checkbox */}
                <button
                  onClick={() => toggle(product.id)}
                  aria-pressed={selected}
                  aria-label={selected ? "Bỏ chọn" : "Chọn"}
                  className="self-center flex-none"
                >
                  <span
                    className={`w-[22px] h-[22px] rounded-[4px] flex items-center justify-center border ${
                      selected ? "bg-primary border-primary text-white" : "bg-transparent border-secondary"
                    }`}
                  >
                    {selected && (
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>check</span>
                    )}
                  </span>
                </button>

                {/* Image */}
                <div className="relative w-20 h-24 flex-none rounded-lg overflow-hidden bg-neutral-raised">
                  <Image src={product.imageUrl} alt={product.name} fill sizes="80px" style={{ objectFit: "cover" }} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 self-stretch flex flex-col justify-between py-1">
                  <h2 className="font-serif font-medium text-heading-md text-text-primary leading-[1.1] pr-7 truncate m-0">
                    {product.name}
                  </h2>

                  <div className="flex items-end justify-between gap-2">
                    <div className="flex flex-col">
                      {product.originalPrice && (
                        <span className="font-sans text-body-sm text-text-muted line-through">
                          {formatVND(product.originalPrice)}
                        </span>
                      )}
                      <span className="font-sans font-bold text-[24px] leading-none text-primary">
                        {formatVND(product.price)}
                      </span>
                    </div>

                    {/* Quantity stepper */}
                    <div className="flex items-center border border-neutral-border rounded-[10px] bg-neutral-canvas">
                      <button
                        onClick={() => setQty(product.id, qty - 1)}
                        className="px-3 h-[30px] flex items-center text-text-secondary"
                        aria-label="Giảm số lượng"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>remove</span>
                      </button>
                      <span className="w-6 text-center font-sans font-bold text-body-sm text-text-primary">
                        {qty}
                      </span>
                      <button
                        onClick={() => setQty(product.id, qty + 1)}
                        className="px-3 h-[30px] flex items-center text-text-secondary"
                        aria-label="Tăng số lượng"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Delete */}
                <button
                  onClick={() => remove(product.id)}
                  className="absolute top-4 right-4 text-text-secondary hover:text-primary transition-colors"
                  aria-label={`Xóa ${product.name}`}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
                </button>
              </div>
            ))}
          </div>

          {/* Voucher + summary */}
          <div className="px-5 pt-6 flex flex-col gap-6">
            {/* TODO(logic): open a voucher picker */}
            <button className="flex items-center justify-between bg-neutral-surface border border-neutral-border rounded-lg p-4">
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-deep" style={{ fontSize: 20 }}>
                  local_offer
                </span>
                <span className="font-sans font-medium text-body text-primary-deep">Áp dụng voucher</span>
              </span>
              <span className="material-symbols-outlined text-text-secondary" style={{ fontSize: 18 }}>
                chevron_right
              </span>
            </button>

            <div className="border-t border-neutral-border pt-4 flex flex-col gap-2">
              <SummaryRow label="Tạm tính" value={formatVND(subtotal)} />
              <SummaryRow label="Giảm giá" value={"-" + formatVND(discount)} deep />
              <SummaryRow label="Phí giao hàng" value={formatVND(delivery)} />
              <div className="border-t border-dashed border-neutral-border pt-2 mt-1 flex items-end justify-between">
                <span className="font-sans font-bold text-[18px] text-text-primary">Tổng cộng</span>
                <span className="font-serif font-medium text-[32px] leading-none text-text-primary">
                  {formatVND(total)}
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Sticky checkout bar */}
      <div className="fixed bottom-0 left-0 w-full px-5 pt-8 pb-5 bg-gradient-to-t from-neutral-canvas from-50% to-transparent pointer-events-none">
        {/* TODO(logic): only checkout the selected items */}
        <Link
          href="/checkout/delivery"
          aria-disabled={selectedCount === 0}
          className={`pointer-events-auto flex items-center justify-between rounded-full px-6 py-4 font-sans font-semibold text-[12px] uppercase tracking-[0.09em] text-white transition-colors ${
            selectedCount === 0 ? "bg-secondary pointer-events-none" : "bg-primary hover:bg-primary-hover"
          }`}
        >
          <span>Thanh toán</span>
          <span>({selectedCount} món)</span>
        </Link>
      </div>
    </div>
  );
}
