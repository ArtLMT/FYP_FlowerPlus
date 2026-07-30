"use client";

import Link from "next/link";
import { useCart } from "@/features/cart/cart-provider";

type NavKey = "home" | "browse" | "cart" | "profile";

const NAV_ITEMS: { key: NavKey; label: string; icon: string; href: string }[] = [
  { key: "home", label: "Trang chủ", icon: "home", href: "/" },
  { key: "browse", label: "Khám phá", icon: "search", href: "/shop" },
  { key: "cart", label: "Giỏ hàng", icon: "shopping_cart", href: "/cart" },
  { key: "profile", label: "Tài khoản", icon: "person", href: "/account" },
];

/**
 * BottomNav — mobile-only fixed bottom tab bar (md:hidden).
 *
 * Reused on every "tab" screen. The caller passes `active` to mark the current
 * tab — this is why it's ONE component, not four copies. Detail screens
 * (notifications, account info, vouchers) simply don't render it.
 */
export default function BottomNav({ active = "home" }: { active?: NavKey }) {
  const { count } = useCart();
  return (
    <>
      <nav
        className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-neutral-canvas/95 backdrop-blur-md grid grid-cols-4 py-[10px] pb-[14px] border-t border-neutral-border"
        aria-label="Điều hướng chính"
      >
        {NAV_ITEMS.map(({ key, label, icon, href }) => {
          const isActive = key === active;
          return (
            <Link
              key={key}
              href={href}
              className={`flex flex-col items-center gap-[5px] ${isActive ? "text-primary" : "text-text-muted hover:text-primary"} transition-colors`}
              aria-label={label}
              aria-current={isActive ? "page" : undefined}
            >
              <span className="relative">
                <span
                  className="material-symbols-outlined"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {icon}
                </span>
                {key === "cart" && count > 0 && (
                  <span className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center">
                    {count}
                  </span>
                )}
              </span>
              <span className={`font-sans text-[10.5px] ${isActive ? "font-bold" : "font-normal"}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Spacer so content isn't hidden behind the fixed nav bar */}
      <div className="h-20 md:hidden" aria-hidden="true" />
    </>
  );
}
