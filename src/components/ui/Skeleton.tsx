import type { ReactNode } from "react";

/**
 * Loading placeholders: soft blocks in the shape of what is coming, so a screen shows its layout
 * at once instead of a line of "Đang tải…" text. The pulse stops for people who ask for reduced motion.
 */
export function Skeleton({ className = "" }: { className?: string }) {
  return <span aria-hidden="true" className={`block rounded-[4px] bg-neutral-raised motion-safe:animate-pulse ${className}`} />;
}

/**
 * Wraps placeholders so screen readers hear the loading message once instead of nothing. An empty
 * label is for a group inside another group, which already announces the loading.
 */
export function SkeletonGroup({ label, className = "", children }: { label: string; className?: string; children: ReactNode }) {
  if (!label) return <div className={className}>{children}</div>;
  return <div role="status" aria-live="polite" className={className}>
    <span className="sr-only">{label}</span>
    {children}
  </div>;
}

/** A list or table that is loading: a few rows of a title line and a shorter detail line. */
export function SkeletonRows({ label, rows = 4, className = "" }: { label: string; rows?: number; className?: string }) {
  return <SkeletonGroup label={label} className={`divide-y divide-neutral-border ${className}`}>
    {Array.from({ length: rows }, (_, index) => <div key={index} className="flex items-center gap-4 py-3">
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-2/3 max-w-xs" />
        <Skeleton className="h-3 w-1/3 max-w-[10rem]" />
      </div>
      <Skeleton className="h-4 w-16 flex-shrink-0" />
    </div>)}
  </SkeletonGroup>;
}

/** The shop's product card while it loads: square image, two-line name, a detail line and a price. */
export function ProductCardSkeleton() {
  return <div className="flex h-full flex-col rounded-[4px] border border-neutral-border bg-neutral-surface p-[14px]">
    <Skeleton className="mb-4 aspect-square w-full" />
    <Skeleton className="h-5 w-4/5" />
    <Skeleton className="mt-2 h-5 w-1/2" />
    <Skeleton className="mt-3 h-3.5 w-2/3" />
    <Skeleton className="mt-4 h-5 w-1/3" />
  </div>;
}
