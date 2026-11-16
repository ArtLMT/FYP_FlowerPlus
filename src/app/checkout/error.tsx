"use client";

import ErrorState from "@/components/ui/ErrorState";

/**
 * Checkout failure. The order may or may not have been placed, so the customer is pointed to their
 * orders before trying again, to avoid placing it twice.
 */
export default function CheckoutError({ error, unstable_retry }: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return <ErrorState
    error={error}
    retry={unstable_retry}
    title="Thanh toán gặp sự cố"
    message="Bước thanh toán chưa tải được. Trước khi đặt lại, hãy kiểm tra mục Đơn hàng trong tài khoản để tránh đặt trùng."
    homeHref="/account/orders"
    homeLabel="Xem đơn hàng"
  />;
}
