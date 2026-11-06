import type { AccountUser } from "@/lib/services/auth";

/** The admin workbench sections, and who may open them. The backend enforces the same rules. */

export type AdminDomain = "overview" | "orders" | "products" | "categories" | "arrangementTypes" | "users" | "materials" | "inventory" | "transactions" | "addresses";

export const DOMAIN_NAMES: Record<AdminDomain, string> = {
  overview: "Tổng quan",
  orders: "Đơn hàng",
  products: "Sản phẩm",
  categories: "Danh mục",
  arrangementTypes: "Kiểu cắm",
  users: "Tài khoản nhân viên",
  materials: "Nguyên liệu",
  inventory: "Kho",
  transactions: "Giao dịch kho",
  addresses: "Tra cứu địa chỉ",
};

export const DOMAIN_DESCRIPTIONS: Record<AdminDomain, string> = {
  overview: "Những việc cửa hàng cần xử lý ngay.",
  orders: "Xác nhận, xử lý và hủy đơn của khách mà không sửa nội dung đơn.",
  products: "Quản lý trạng thái bán và thông tin sản phẩm.",
  categories: "Tạo, đổi tên và xóa các danh mục khách hàng dùng để lọc sản phẩm.",
  arrangementTypes: "Các kiểu cắm và phí công khách có thể chọn khi thiết kế bó hoa.",
  users: "Tạo tài khoản nhân viên và quản lý quyền truy cập.",
  materials: "Quản lý nguyên liệu dùng trong công thức sản phẩm và đơn thiết kế.",
  inventory: "Nhập lô hàng và xem các lô trong kho.",
  transactions: "Mọi thay đổi tồn kho, mới nhất trước.",
  addresses: "Tra cứu địa chỉ giao hàng khách đã lưu.",
};

/** The letters shown in each section's nav badge. */
export const DOMAIN_INITIALS: Record<AdminDomain, string> = {
  overview: "TQ",
  orders: "ĐH",
  products: "SP",
  categories: "DM",
  arrangementTypes: "KC",
  materials: "NL",
  inventory: "KH",
  transactions: "GD",
  users: "NV",
  addresses: "ĐC",
};

export const ROLE_LABELS: Record<AccountUser["role"], string> = {
  ADMIN: "Quản trị viên",
  STAFF: "Nhân viên",
  CUSTOMER: "Khách hàng",
};

export const isManager = (user: AccountUser) => user.role === "ADMIN" || user.role === "STAFF";

/** Sections the account may open, in nav order. Staff manage the catalog; Admins also see people. */
export function allowedDomainsFor(user: AccountUser | null): AdminDomain[] {
  if (user?.role === "ADMIN") return ["overview", "orders", "products", "categories", "arrangementTypes", "materials", "inventory", "transactions", "users", "addresses"];
  if (user?.role === "STAFF") return ["overview", "orders", "products", "categories", "arrangementTypes", "materials", "inventory", "transactions"];
  return [];
}

/** The section shown first. */
export const defaultDomain = (user: AccountUser | null): AdminDomain =>
  user && isManager(user) ? "overview" : "products";
