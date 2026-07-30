"use client";

import Link from "next/link";
import { useCart } from "@/features/cart/cart-provider";

/**
 * Header cart + account icons. Client Component so the cart badge reflects the
 * live cart count. Used by the (server) Header on both mobile and desktop.
 */
export default function HeaderIcons() {
  const { count } = useCart();

  return (
    <div className="flex gap-[10px]">
      <Link
        href="/cart"
        aria-label={`Giỏ hàng${count ? `, ${count} món` : ""}`}
        className="relative w-10 h-10 rounded-full bg-neutral-raised flex items-center justify-center text-text-secondary hover:bg-neutral-border transition-colors"
      >
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
          shopping_cart
        </span>
        {count > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
            {count}
          </span>
        )}
      </Link>
      <Link
        href="/account"
        aria-label="Tài khoản"
        className="w-10 h-10 rounded-full bg-neutral-raised flex items-center justify-center text-text-secondary hover:bg-neutral-border transition-colors"
      >
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
          person
        </span>
      </Link>
    </div>
  );
}
