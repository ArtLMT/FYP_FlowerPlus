"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import AccountSidebar from "@/features/account/components/AccountSidebar";
import { AccountGate } from "@/features/account/account-context";
import { accountTitle } from "@/features/account/sections";

/**
 * Account layout — the desktop dashboard shell shared by every /account route.
 *
 *   • Mobile  → transparent: renders {children} only, so each page keeps its own
 *     mobile chrome (the /account menu + BottomNav, or a DetailHeader back-bar).
 *   • Desktop (md:) → storefront Header + a persistent left AccountSidebar and a
 *     right content pane. The section title is derived from the path so pages
 *     don't each repeat it (their mobile DetailHeader carries it on mobile).
 *
 * Client Component because the title + sidebar active-state come from usePathname.
 */

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const title = accountTitle(usePathname());

  return (
    <AccountGate>
      {/* Redirects/blocks signed-out users before any account UI renders. */}
      {/* Desktop: shared storefront chrome */}
      <div className="hidden md:block">
        <Header />
      </div>

      {/* Desktop two-column grid: sidebar on the left, page content on the right. On mobile it is a plain wrapper. */}
      <div className="md:mx-auto md:w-full md:max-w-[1120px] md:px-10 md:py-8 md:grid md:grid-cols-[248px_1fr] md:gap-8 md:items-start">
        {/* Desktop-only left navigation (profile card, section links, sign-out). */}
        <AccountSidebar />
        <div className="md:min-w-0">
          {/* Desktop section title derived from the current path. */}
          {title && (
            <h1 className="hidden md:block font-serif font-medium text-[34px] text-primary m-0 mb-6">
              {title}
            </h1>
          )}
          {children}
        </div>
      </div>
    </AccountGate>
  );
}
