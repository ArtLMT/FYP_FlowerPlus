/**
 * The account sections, in menu order — shared by the mobile menu, the desktop sidebar and page titles.
 * Notifications is left out until notifications are built (W11, screen decision Q2); its page stays.
 */
export const ACCOUNT_SECTIONS = [
  { label: "Thông tin tài khoản", icon: "person", href: "/account/info" },
  { label: "Quản lý đơn hàng", icon: "local_shipping", href: "/account/orders" },
  { label: "Kho voucher", icon: "local_offer", href: "/account/vouchers" },
];

/** The desktop page title for an account route. */
export function accountTitle(pathname: string): string | undefined {
  if (pathname === "/account/info/password-reset") return "Đặt lại mật khẩu";
  if (pathname === "/account/notifications") return "Thông báo";
  if (pathname.startsWith("/account/orders/")) return "Chi tiết đơn hàng";
  return ACCOUNT_SECTIONS.find((section) => section.href === pathname)?.label;
}
