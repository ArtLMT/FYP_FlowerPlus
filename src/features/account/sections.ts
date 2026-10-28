/** The account sections, in menu order — shared by the mobile menu, the desktop sidebar and page titles. */
export const ACCOUNT_SECTIONS = [
  { label: "Thông tin tài khoản", icon: "person", href: "/account/info" },
  { label: "Quản lý đơn hàng", icon: "local_shipping", href: "/account/orders" },
  { label: "Thông báo", icon: "notifications", href: "/account/notifications" },
  { label: "Kho voucher", icon: "local_offer", href: "/account/vouchers" },
];

/** The desktop page title for an account route. */
export function accountTitle(pathname: string): string | undefined {
  if (pathname === "/account/info/password-reset") return "Đặt lại mật khẩu";
  if (pathname.startsWith("/account/orders/")) return "Chi tiết đơn hàng";
  return ACCOUNT_SECTIONS.find((section) => section.href === pathname)?.label;
}
