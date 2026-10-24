"use client";
import Button from "@/components/ui/Button";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Container from "@/components/ui/Container";
import HeaderIcons from "@/components/layout/HeaderIcons";

/**
 * Header — responsive top bar, shown on every storefront-style page.
 *
 *   • Mobile  (md:hidden)     → wordmark + icons, search field
 *   • Desktop (hidden md:flex) → wordmark + nav links + search + icons, capped at 1240px
 *
 * Client Component: the nav active-state comes from usePathname (no hardcoded
 * flag to drift), and the search field routes to /shop?q=… on submit.
 *
 * NOTE: the QuickActions "sub navigation" row is NOT part of the header — it is
 * home-page content (rendered by app/(storefront)/page.tsx), so it appears on
 * the home page only and never follows the header onto other pages.
 */

// Only routes that actually exist. /custom (core "Đặt riêng" flow) and /deals
// are intentionally absent until they're built — a dead 404 in the primary nav
// is worse than a missing entry. Re-add /custom here when P1.5 ships it.
const DESKTOP_NAV = [
  { label: "Trang chủ", href: "/" },
  { label: "Bộ sưu tập", href: "/shop" },
];

/** Active when the path IS the href or sits under it (exact match for "/"). */
function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

/** Rounded search field (icon + input); submitting goes to /shop?q=…. Used in both mobile and desktop rows. */
function SearchBar({ className = "" }: { className?: string }) {
  const router = useRouter();
  const [q, setQ] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    router.push(term ? `/shop?q=${encodeURIComponent(term)}` : "/shop");
  };

  return (
    <form
      role="search"
      onSubmit={submit}
      className={`flex items-center gap-[10px] bg-neutral-surface border border-neutral-border rounded-full ${className}`}
    >
      <Button type="submit" aria-label="Tìm kiếm" className="flex items-center text-text-muted">
        <span className="material-symbols-outlined" style={{ fontSize: 17 }}>
          search
        </span>
      </Button>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Tìm hoa, dịp lễ..."
        aria-label="Tìm hoa, dịp lễ"
        className="flex-1 min-w-0 bg-transparent font-sans text-[13px] text-text-primary placeholder:text-text-muted outline-none"
      />
    </form>
  );
}

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-neutral-canvas/90 backdrop-blur-sm border-b border-neutral-border md:border-b">
      {/* ── Mobile ── */}
      <div className="md:hidden px-margin-mobile pt-4 pb-3">
        <div className="flex items-center justify-between mb-[14px]">
          {/* Wordmark and cart/account icons. */}
          <span className="font-serif text-[24px] italic text-primary leading-none tracking-heading">
            FlowerPlus
          </span>
          <HeaderIcons />
        </div>
        {/* Full-width search field under the wordmark. */}
        <SearchBar className="px-4 py-[9px]" />
      </div>

      {/* ── Desktop ── */}
      <div className="hidden md:block">
        <Container className="h-[74px] flex items-center gap-9">
          {/* Wordmark. */}
          <span className="font-serif text-[28px] italic text-primary leading-none tracking-heading">
            FlowerPlus
          </span>
          {/* Primary nav links; the active one is highlighted. */}
          <nav className="flex gap-7 items-center">
            {DESKTOP_NAV.map(({ label, href }) => {
              const active = isActivePath(pathname, href);
              return (
                <Link
                  key={label}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`font-sans font-bold text-[14px] transition-colors ${
                    active ? "text-primary" : "text-text-secondary hover:text-primary"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
          <div className="flex-1" />
          {/* Right side: search field, then cart/account icons. */}
          <SearchBar className="px-4 py-[7px] w-60" />
          <HeaderIcons />
        </Container>
      </div>
    </header>
  );
}
