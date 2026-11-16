"use client";

import Link from "next/link";
import { useEffect } from "react";
import Button from "@/components/ui/Button";

/**
 * Shared body of the route `error.tsx` files: what went wrong, a retry, and a way out.
 * The error's own message is never shown: in production a server error carries only a digest,
 * and a client error may carry technical text.
 */
export default function ErrorState({
  error,
  retry,
  title = "Đã có lỗi xảy ra",
  message = "Trang này chưa tải được. Bạn thử lại sau giây lát nhé.",
  homeHref = "/",
  homeLabel = "Về trang chủ",
}: {
  error: Error & { digest?: string };
  retry: () => void;
  title?: string;
  message?: string;
  homeHref?: string;
  homeLabel?: string;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main role="alert" className="flex min-h-[60vh] flex-1 flex-col items-center justify-center px-margin-mobile pt-16 text-center">
      <h1 className="mb-4 font-serif text-heading-lg italic text-text-primary">{title}</h1>
      <p className="mx-auto mb-8 max-w-md text-text-secondary">{message}</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          type="button"
          onClick={retry}
          className="rounded-full bg-primary px-[28px] py-[12px] font-bold uppercase text-text-on-primary transition-colors hover:bg-primary-hover"
        >
          Thử lại
        </Button>
        <Link
          href={homeHref}
          className="rounded-full border border-neutral-border px-[28px] py-[12px] font-bold uppercase text-text-secondary transition-colors hover:border-secondary"
        >
          {homeLabel}
        </Link>
      </div>
      {error.digest && <p className="mt-6 text-xs text-text-muted">Mã lỗi: {error.digest}</p>}
    </main>
  );
}
