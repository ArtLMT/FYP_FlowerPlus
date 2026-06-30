import Link from "next/link";

/**
 * Global 404 Not Found Page
 * App Router automatically renders this when a page is missing or notFound() is called.
 */
export default function NotFound() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center min-h-[60vh] px-margin-mobile text-center pt-16">
      <h2 className="font-serif text-display italic mb-4 text-text-primary tracking-heading">
        Page Not Found
      </h2>
      <p className="font-sans text-body text-text-secondary mb-8 max-w-md mx-auto">
        We couldn&apos;t find the page you&apos;re looking for. It might have been moved or the link might be broken.
      </p>
      <Link 
        href="/"
        className="bg-primary hover:bg-primary-hover text-text-on-primary py-[12px] px-[28px] rounded-full font-bold text-label uppercase tracking-button transition-colors inline-block"
      >
        Return to Home
      </Link>
    </main>
  );
}
