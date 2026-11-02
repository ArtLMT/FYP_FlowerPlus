"use client";

import Link from "next/link";
import Button from "@/components/ui/Button";
import BottomNav from "@/components/layout/BottomNav";
import { useAccount } from "@/features/account/account-context";
import { ACCOUNT_SECTIONS } from "@/features/account/sections";
import { useDesktopRedirect } from "@/features/account/hooks/use-desktop-redirect";
import { useSignOut } from "@/features/account/hooks/use-sign-out";

/**
 * Profile — /account
 *
 *   • Mobile  → a "tab" screen: own menu header + drill-in menu + BottomNav
 *     (active="profile"). Tapping a menu item opens that section.
 *   • Desktop → there is no distinct "/account" view; the sidebar
 *     (account/layout.tsx) is the navigator, so we redirect to /account/info
 *     and let the info screen be the base landing.
 */
export default function ProfilePage() {
  const user = useAccount();
  const signOut = useSignOut();
  useDesktopRedirect("/account/info");

  return (
    <div className="min-h-dvh flex flex-col bg-neutral-canvas md:min-h-0 md:block md:bg-transparent">
      {/* Header: menu · wordmark · bag — mobile only (desktop redirects to info) */}
      <header className="md:hidden flex items-center justify-between px-[22px] py-[18px] border-b border-neutral-border">
        <Button
          className="w-[34px] h-[34px] flex items-center text-text-primary"
          aria-label="Menu"
        >
          <span className="material-symbols-outlined">menu</span>
        </Button>
        <span className="font-serif font-medium italic text-[28px] text-primary leading-none">
          FlowerPlus
        </span>
        <Button
          className="w-[34px] h-[34px] flex items-center justify-end text-text-primary"
          aria-label="Giỏ hàng"
        >
          <span className="material-symbols-outlined">shopping_bag</span>
        </Button>
      </header>

      {/* Scrollable body — mobile only (desktop redirects to /account/info) */}
      <div className="md:hidden flex-1 overflow-y-auto no-scrollbar pb-4">
        {/* Avatar + name */}
        <div className="flex flex-col items-center px-[22px] pt-[44px]">
          {/* TODO(api): swap this placeholder for the user's avatar (next/image). */}
          <div className="w-[132px] h-[156px] rounded-[18px] bg-neutral-surface border border-neutral-border flex items-center justify-center text-text-muted">
            <span className="material-symbols-outlined" style={{ fontSize: 56 }}>
              person
            </span>
          </div>
          <h1 className="font-serif font-medium text-[34px] text-text-primary mt-[30px] m-0">
            {user.fullName ?? user.username}
          </h1>
        </div>

        {/* Menu list */}
        <nav className="mt-[56px] px-[22px]">
          {ACCOUNT_SECTIONS.map(({ label, icon, href }) => (
            <Link
              key={label}
              href={href}
              className="w-full flex items-center gap-[18px] border-t border-neutral-border py-[22px] px-1 hover:bg-neutral-surface/60 transition-colors"
            >
              <span className="material-symbols-outlined text-text-secondary">{icon}</span>
              <span className="flex-1 text-left font-sans text-[19px] text-text-primary">
                {label}
              </span>
              <span className="material-symbols-outlined text-text-muted">chevron_right</span>
            </Link>
          ))}
          <div className="border-t border-neutral-border" />
        </nav>

        {/* Sign out */}
        <div className="flex justify-center py-[50px]">
          <Button
            onClick={signOut}
            className="bg-transparent text-primary border-[1.5px] border-secondary rounded-full py-[14px] px-[44px] font-sans font-bold text-body-sm tracking-badge hover:bg-neutral-surface transition-colors"
          >
            ĐĂNG XUẤT
          </Button>
        </div>
      </div>

      {/* Mobile bottom tab bar with Account selected. */}
      <BottomNav active="profile" />
    </div>
  );
}
