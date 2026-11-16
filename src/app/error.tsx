"use client";

import ErrorState from "@/components/ui/ErrorState";

/** Fallback for any page that fails while rendering; sections with their own error.tsx override it. */
export default function Error({ error, unstable_retry }: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return <ErrorState error={error} retry={unstable_retry} />;
}
