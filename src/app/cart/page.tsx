"use client";

import Link from "next/link";
import Button from "@/components/ui/Button";
import Header from "@/components/layout/Header";
import Notice, { NoticeButton, NoticeLink } from "@/components/ui/Notice";
import ProductImage from "@/components/ui/ProductImage";
import { useCartPage } from "@/features/cart/hooks/use-cart-page";
import type { CartLine } from "@/lib/services/cart";
import { formatVND } from "@/lib/utils";

/**
 * Cart — /cart
 *
 * The signed-in Customer's server Cart. Prices are current list prices, not an Order snapshot: the
 * Order fixes them at checkout. Flagged lines stay visible and block checkout until fixed.
 */
/**
 * UI map:
 * - Top: desktop storefront Header, or the mobile back-bar; then the page title.
 * - Loading / failed / guest / empty states use `Notice`.
 * - Cart lines: left column of `CartLineCard`s, with error and suspended-account notices above them.
 * - Summary: right sidebar on large screens (subtotal, shipping, warnings, checkout button);
 *   below lg the checkout button is a fixed bar at the bottom of the screen instead.
 * - Cart state and actions live in `features/cart/hooks/use-cart-page.ts`.
 */
export default function CartPage() {
  const page = useCartPage();
  const checkoutLabel = page.shopper === "suspended" ? "Tạm khóa đặt hàng" : "Thanh toán";

  return (
    <div className="min-h-dvh bg-neutral-canvas pb-32 lg:pb-0">
      {/* Desktop: shared storefront Header. */}
      <div className="hidden md:block">
        <Header />
      </div>

      {/* Mobile: back arrow and title. */}
      <header className="md:hidden sticky top-0 z-20 flex items-center px-3 py-4 bg-neutral-canvas border-b border-neutral-border">
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

      {/* Desktop page title. */}
      <div className="hidden md:block mx-auto w-full max-w-[1240px] px-10 pt-8">
        <h1 className="font-serif font-medium text-[40px] text-primary leading-none m-0">
          Giỏ hàng
        </h1>
      </div>

      {/* Loading, error, signed-out, and empty-cart messages. */}
      {page.view === "loading" && <Notice title="Đang tải giỏ hàng..." />}
      {page.view === "failed" && (
        <Notice title="Không thể tải giỏ hàng.">
          <NoticeButton onClick={() => void page.reload()}>THỬ LẠI</NoticeButton>
        </Notice>
      )}
      {page.view === "guest" && (
        <Notice title="Đăng nhập để xem và lưu giỏ hàng của bạn.">
          <NoticeLink href="/login">ĐĂNG NHẬP</NoticeLink>
        </Notice>
      )}
      {page.view === "empty" && (
        <Notice title="Giỏ hàng của bạn đang trống.">
          <NoticeLink href="/shop">TIẾP TỤC MUA SẮM</NoticeLink>
        </Notice>
      )}

      {/* Cart contents: line cards on the left, order summary on the right (lg). */}
      {page.view === "lines" && (
        <div className="md:mx-auto md:w-full md:max-w-[1240px] md:px-10 md:pt-6 lg:grid lg:grid-cols-[1fr_360px] lg:gap-8 lg:items-start">
          <div className="flex flex-col gap-4">
            {/* Error from the last cart change, and the suspended-account notice. */}
            {page.error && (
              <p role="alert" className="mx-5 md:mx-0 rounded-xl border border-primary bg-neutral-surface p-4 font-sans text-body-sm text-primary m-0">
                {page.error}
              </p>
            )}
            {page.shopper === "suspended" && (
              <p className="mx-5 md:mx-0 rounded-xl border border-neutral-border bg-neutral-surface p-4 font-sans text-body-sm text-text-secondary m-0">
                Tài khoản của bạn đang bị tạm khóa đặt hàng. Bạn vẫn có thể chỉnh sửa giỏ hàng.
              </p>
            )}
            {/* One card per cart line. */}
            {page.lines.map((line) => (
              <CartLineCard
                key={line.productId}
                line={line}
                busy={page.isBusy(line)}
                onDecrease={() => void page.decrease(line)}
                onIncrease={() => void page.increase(line)}
                onRemove={() => void page.remove(line)}
              />
            ))}
          </div>

          {/* Order summary: subtotal, shipping, notes, and the desktop checkout button. */}
          <aside className="px-5 pt-6 flex flex-col gap-6 lg:mt-0 lg:px-5 lg:pt-5 lg:pb-6 lg:border lg:border-neutral-border lg:rounded-2xl lg:bg-neutral-surface lg:sticky lg:top-24">
            <div className="flex flex-col gap-2">
              <SummaryRow label="Tạm tính (giá hiện tại)" value={formatVND(page.cart?.subtotal ?? 0)} />
              <SummaryRow label="Phí giao hàng" value="Miễn phí" />
              <p className="font-sans text-body-sm text-text-muted m-0 mt-1">
                Giá và tồn kho được kiểm tra lại khi bạn đặt hàng.
              </p>
              {page.cart?.hasProblems && (
                <p className="font-sans text-body-sm text-primary m-0">
                  Vui lòng xóa hoặc điều chỉnh các sản phẩm được đánh dấu trước khi thanh toán.
                </p>
              )}
            </div>

            <CheckoutLink
              className="hidden lg:flex"
              enabled={page.canCheckout}
              label={checkoutLabel}
              lineCount={page.lines.length}
            />
          </aside>
        </div>
      )}

      {/* Mobile/tablet fixed checkout bar at the bottom of the screen. */}
      {page.showCheckoutBar && (
        <div className="fixed bottom-0 left-0 w-full px-5 pt-8 pb-5 bg-gradient-to-t from-neutral-canvas from-50% to-transparent pointer-events-none lg:hidden">
          <CheckoutLink
            className="pointer-events-auto flex"
            enabled={page.canCheckout}
            label={checkoutLabel}
            lineCount={page.lines.length}
          />
        </div>
      )}
    </div>
  );
}

/** One cart line: thumbnail, name, problem badge, price, quantity stepper, and delete button. Problem lines get a red border. */
function CartLineCard({
  line,
  busy,
  onDecrease,
  onIncrease,
  onRemove,
}: {
  line: CartLine;
  busy: boolean;
  onDecrease: () => void;
  onIncrease: () => void;
  onRemove: () => void;
}) {
  return (
    <div
      className={`relative flex items-start gap-[9px] bg-neutral-surface border p-4 ${
        line.problem ? "border-primary" : "border-neutral-border"
      } ${busy ? "opacity-60" : ""}`}
    >
      {/* Product thumbnail. */}
      <div className="relative w-20 h-24 flex-none rounded-lg overflow-hidden bg-neutral-raised">
        <ProductImage src={line.mainImageUrl} alt={line.name} sizes="80px" />
      </div>

      <div className="flex-1 min-w-0 self-stretch flex flex-col justify-between gap-2 py-1">
        {/* Product name and problem badge (e.g. out of stock). */}
        <div className="pr-7">
          <h2 className="font-serif font-medium text-heading-md text-text-primary leading-[1.1] truncate m-0">
            {line.name}
          </h2>
          {line.problem && (
            <span className="mt-1 inline-block rounded-md bg-tertiary px-2 py-[2px] font-sans text-label font-bold tracking-badge text-primary">
              {line.problem}
            </span>
          )}
        </div>

        <div className="flex items-end justify-between gap-2">
          {/* Current list price. */}
          <span className="font-sans font-bold text-[24px] leading-none text-primary">
            {formatVND(line.basePrice)}
          </span>

          {/* Quantity stepper: − / count / +. */}
          <div className="flex items-center border border-neutral-border rounded-[10px] bg-neutral-canvas">
            <Button
              onClick={onDecrease}
              disabled={busy}
              className="px-3 h-[30px] flex items-center text-text-secondary"
              aria-label={line.quantity === 1 ? `Xóa ${line.name}` : "Giảm số lượng"}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>remove</span>
            </Button>
            <span className="w-6 text-center font-sans font-bold text-body-sm text-text-primary">
              {line.quantity}
            </span>
            <Button
              onClick={onIncrease}
              disabled={busy || !line.canIncrease}
              className="px-3 h-[30px] flex items-center text-text-secondary disabled:opacity-40"
              aria-label="Tăng số lượng"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
            </Button>
          </div>
        </div>
      </div>

      <Button
        onClick={onRemove}
        disabled={busy}
        className="absolute top-4 right-4 text-text-secondary hover:text-primary transition-colors"
        aria-label={`Xóa ${line.name}`}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
      </Button>
    </div>
  );
}

/** One label/value line in the order summary. */
function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-sans text-body text-text-secondary">{label}</span>
      <span className="font-sans text-body text-text-secondary">{value}</span>
    </div>
  );
}

/** Pill-shaped "Thanh toán (N món)" link to /checkout/delivery; greyed out when checkout is blocked. */
function CheckoutLink({
  className,
  enabled,
  label,
  lineCount,
}: {
  className: string;
  enabled: boolean;
  label: string;
  lineCount: number;
}) {
  return (
    <Link
      href="/checkout/delivery"
      aria-disabled={!enabled}
      className={`${className} items-center justify-between rounded-full px-6 py-4 font-sans font-semibold text-[12px] uppercase tracking-[0.09em] text-white transition-colors ${
        enabled ? "bg-primary hover:bg-primary-hover" : "bg-secondary pointer-events-none"
      }`}
    >
      <span>{label}</span>
      <span>({lineCount} món)</span>
    </Link>
  );
}
