"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import AccountSidebar from "@/features/account/components/AccountSidebar";
import { AccountGate } from "@/features/account/account-context";

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

const TITLES: Record<string, string> = {
  "/account/info": "Thông tin tài khoản",
  "/account/info/password-reset": "Đặt lại mật khẩu",
  "/account/orders": "Quản lý đơn hàng",
  "/account/notifications": "Thông báo",
  "/account/vouchers": "Kho voucher",
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const title = TITLES[pathname];

  return (
    <AccountGate>
      {/* Desktop: shared storefront chrome */}
      <div className="hidden md:block">
        <Header />
      </div>

      <div className="md:mx-auto md:w-full md:max-w-[1120px] md:px-10 md:py-8 md:grid md:grid-cols-[248px_1fr] md:gap-8 md:items-start">
        <AccountSidebar />
        <div className="md:min-w-0">
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
