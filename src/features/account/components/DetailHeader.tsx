import Link from "next/link";

/**
 * DetailHeader — mobile back-bar for "stack" screens pushed on top of the
 * Profile tab (Account Info, Orders, Notifications, Vouchers).
 *
 * Mobile-only (md:hidden): on desktop these screens live inside the account
 * dashboard (account/layout.tsx), which provides the storefront Header, the
 * left sidebar, and the section title — so this bar would be redundant there.
 *
 * The back arrow returns to /account because every screen is opened from the
 * Profile menu. Shared by all four so the chrome stays identical.
 */
export default function DetailHeader({ title, backHref = "/account" }: { title: string; backHref?: string }) {
  return (
    <header className="md:hidden flex items-center px-[18px] py-[18px] border-b border-neutral-border bg-neutral-canvas sticky top-0 z-20">
      {/* Back arrow button. */}
      <Link
        href={backHref}
        className="w-10 h-10 rounded-full flex items-center justify-center text-text-primary hover:bg-neutral-surface transition-colors"
        aria-label="Quay lại"
      >
        <span className="material-symbols-outlined">arrow_back</span>
      </Link>
      {/* Centered screen title. */}
      <h1 className="flex-1 text-center font-serif font-medium text-heading-md text-primary m-0">
        {title}
      </h1>
      {/* Spacer to keep the title visually centered against the back button */}
      <div className="w-10" aria-hidden="true" />
    </header>
  );
}
