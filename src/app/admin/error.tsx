"use client";

import ErrorState from "@/components/ui/ErrorState";

/** Admin area failure: retry, or go back to the admin overview instead of the storefront. */
export default function AdminError({ error, unstable_retry }: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return <ErrorState
    error={error}
    retry={unstable_retry}
    message="Khu vực quản trị chưa tải được. Thao tác vừa rồi có thể chưa được lưu, hãy kiểm tra lại sau khi tải lại."
    homeHref="/admin"
    homeLabel="Về trang tổng quan"
  />;
}
