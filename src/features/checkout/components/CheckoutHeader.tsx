import Link from "next/link";

/**
 * CheckoutHeader — back-header for checkout stack screens.
 * Like the account DetailHeader, but the title is Karla-bold in the primary
 * colour (matching the checkout mockup) and the back target is configurable
 * because each step goes back to a different place.
 */
export default function CheckoutHeader({
  title,
  backHref,
}: {
  title: string;
  backHref: string;
}) {
  return (
    <header className="flex items-center px-[18px] py-[18px] border-b border-neutral-border bg-neutral-canvas sticky top-0 z-20">
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
  );
}
