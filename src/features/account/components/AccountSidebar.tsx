"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Button from "@/components/ui/Button";
import { useAccount } from "@/features/account/account-context";
import { useSignOut } from "@/features/account/hooks/use-sign-out";
import { ACCOUNT_SECTIONS } from "@/features/account/sections";

/**
 * AccountSidebar — the persistent left rail of the desktop account dashboard.
 *
 * Desktop-only (hidden md:flex): the mobile experience keeps the drill-in menu
 * (/account) + BottomNav instead. Rendered once by account/layout.tsx so every
 * account route shares the same rail; the active link is derived from the path.
 */
export default function AccountSidebar() {
  const pathname = usePathname();
  const user = useAccount();
  const signOut = useSignOut();

  return (
    <aside className="hidden md:flex md:flex-col md:gap-6 md:sticky md:top-24">
      {/* Profile card */}
      <div className="flex flex-col items-center text-center bg-neutral-surface border border-neutral-border rounded-2xl px-5 py-6">
        {/* TODO(api): swap this placeholder for the user's avatar (next/image). */}
        <div className="w-20 h-20 rounded-full bg-tertiary text-primary flex items-center justify-center ring-4 ring-neutral-raised">
          <span className="material-symbols-outlined" style={{ fontSize: 40 }}>person</span>
        </div>
        {/* Display name and email. */}
        <p className="w-full font-serif font-medium text-[19px] text-text-primary leading-tight mt-3 mb-0 truncate">
          {user.fullName ?? user.username}
        </p>
        <p className="w-full font-sans text-body-sm text-text-muted mt-1 mb-0 truncate">{user.email}</p>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1">
        {ACCOUNT_SECTIONS.map(({ label, icon, href }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          // One section link (icon + label); the current section is filled.
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 font-sans text-[15px] transition-colors ${
                active
                  ? "bg-primary text-white font-bold"
                  : "text-text-secondary hover:bg-neutral-surface"
              }`}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                {icon}
              </span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <Button
        onClick={signOut}
        className="flex items-center gap-3 rounded-xl px-4 py-3 font-sans text-[15px] text-text-secondary hover:bg-neutral-surface transition-colors"
      >
        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
          logout
        </span>
        Đăng xuất
      </Button>
    </aside>
  );
}
