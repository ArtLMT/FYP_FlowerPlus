"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/features/cart/cart-provider";

type NavKey = "home" | "browse" | "custom" | "cart" | "profile";

const NAV_ITEMS: { key: NavKey; label: string; icon: string; href: string }[] = [
  { key: "home", label: "Trang chủ", icon: "home", href: "/" },
  { key: "browse", label: "Khám phá", icon: "search", href: "/shop" },
  { key: "custom", label: "Thiết kế", icon: "local_florist", href: "/custom" },
  { key: "cart", label: "Giỏ hàng", icon: "shopping_cart", href: "/cart" },
  { key: "profile", label: "Tài khoản", icon: "person", href: "/account" },
];

/**
 * BottomNav — mobile-only fixed bottom tab bar (md:hidden).
 *
 * Reused on every "tab" screen. The active tab is derived from the URL via
 * usePathname (so it can't drift); the `active` prop is only a fallback for
 * routes that aren't one of the tabs. This is why it's ONE component, not four
 * copies. Detail screens (notifications, account info, vouchers) simply don't
 * render it.
 */
export default function BottomNav({ active = "home" }: { active?: NavKey }) {
  const { count } = useCart();
  const pathname = usePathname();

  // Which tab does the current path fall under? (exact match for "/")
  const current =
    NAV_ITEMS.find(({ href }) =>
      href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/")
    )?.key ?? active;
  return (
    <>
      {/* Five shortcut links: Home, Browse, Custom builder, Cart and Account. */}
      <nav
        className="md:hidden fixed bottom-[calc(env(safe-area-inset-bottom)+0.5rem)] left-1/2 -translate-x-1/2 z-50 grid w-[calc(100%-1.5rem)] max-w-[480px] grid-cols-5 items-center gap-1 rounded-full border border-neutral-border/80 bg-neutral-canvas/95 px-2 py-2 shadow-[0_8px_30px_rgba(45,28,24,0.16)] backdrop-blur-xl"
        aria-label="Điều hướng chính"
      >
        {NAV_ITEMS.map(({ key, label, icon, href }) => {
          const isActive = key === current;
          const isCreate = key === "custom";
          return (
            <Link
              key={key}
              href={href}
              className={`relative flex min-h-12 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                isCreate
                  ? "mx-auto h-12 w-12 bg-primary text-white shadow-md hover:bg-primary-hover"
                  : `w-full ${isActive ? "bg-primary/10 text-primary" : "text-text-muted hover:bg-neutral-raised hover:text-primary"}`
              }`}
              aria-label={label}
              aria-current={isActive ? "page" : undefined}
              title={label}
            >
              <span className="relative">
                <span
                  className="material-symbols-outlined leading-none"
                  style={isActive || isCreate ? { fontVariationSettings: "'FILL' 1" } : undefined}
                  aria-hidden="true"
                >
                  {isCreate ? "add" : icon}
                </span>
                {/* Cart item-count badge. */}
                {key === "cart" && count > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-white ring-2 ring-neutral-canvas">
                    {count}
                  </span>
                )}
              </span>
              <span className="sr-only">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Spacer so content isn't hidden behind the fixed nav bar */}
      <div className="h-20 md:hidden" aria-hidden="true" />
    </>
  );
}
