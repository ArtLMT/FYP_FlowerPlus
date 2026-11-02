"use client";

import type { ReactNode } from "react";
import Notice, { NoticeButton, NoticeLink } from "@/components/ui/Notice";
import { useCheckoutGate } from "@/features/checkout/hooks/use-checkout-gate";

/** Shows the checkout step only when checkout is open; everyone else gets the reason and a way forward. */
export default function CheckoutGate({ children }: { children: ReactNode }) {
  const { state, reload } = useCheckoutGate();

  switch (state) {
    case "loading":
      return <Notice title="Đang tải giỏ hàng..." />;
    case "failed":
      return (
        <Notice title="Không thể tải giỏ hàng.">
          <NoticeButton onClick={() => void reload()}>THỬ LẠI</NoticeButton>
        </Notice>
      );
    case "guest":
      return (
        <Notice title="Vui lòng đăng nhập để thanh toán.">
          <NoticeLink href="/login">ĐĂNG NHẬP</NoticeLink>
        </Notice>
      );
    case "suspended":
      return (
        <Notice title="Tài khoản của bạn đang bị tạm khóa đặt hàng.">
          <NoticeLink href="/cart">VỀ GIỎ HÀNG</NoticeLink>
        </Notice>
      );
    case "empty":
      return (
        <Notice title="Giỏ hàng của bạn đang trống.">
          <NoticeLink href="/shop">TIẾP TỤC MUA SẮM</NoticeLink>
        </Notice>
      );
    case "problems":
      return (
        <Notice title="Có sản phẩm trong giỏ cần được điều chỉnh trước khi thanh toán.">
          <NoticeLink href="/cart">VỀ GIỎ HÀNG</NoticeLink>
        </Notice>
      );
    // Checkout is open: render the actual step page.
    case "open":
      return <>{children}</>;
  }
}
