import Link from "next/link";
import Header from "@/components/layout/Header";

/**
 * CheckoutHeader — back-header for checkout stack screens.
 *
 *   • Mobile  (md:hidden)      → back arrow + centered title. Like the account
 *     DetailHeader, but the title is Karla-bold in the primary colour (matching
 *     the checkout mockup) and the back target is configurable because each step
 *     goes back to a different place.
 *   • Desktop (hidden md:block) → the shared storefront Header, so checkout
 *     shares the same top chrome as the rest of the site.
 */
export default function CheckoutHeader({
  title,
  backHref,
}: {
  title: string;
  backHref: string;
}) {
  return (
    <>
      {/* Desktop: shared storefront chrome */}
      <div className="hidden md:block">
        <Header />
      </div>

      {/* Mobile: back arrow + centered title */}
      <header className="md:hidden flex items-center px-[18px] py-[18px] border-b border-neutral-border bg-neutral-canvas sticky top-0 z-20">
        <Link
          href={backHref}
          className="w-10 h-10 rounded-full flex items-center justify-center text-text-primary hover:bg-neutral-surface transition-colors"
          aria-label="Quay lại"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <h1 className="flex-1 text-center font-sans font-bold text-[19px] text-primary m-0">
          {title}
        </h1>
        <div className="w-10" aria-hidden="true" />
      </header>
    </>
  );
}
