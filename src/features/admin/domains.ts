import type { AccountUser } from "@/lib/services/auth";

/** The admin workbench sections, and who may open them. The backend enforces the same rules. */

export type AdminDomain = "orders" | "products" | "users" | "materials" | "inventory" | "transactions" | "addresses";

export const DOMAIN_NAMES: Record<AdminDomain, string> = {
  orders: "Orders",
  products: "Products",
  users: "Staff accounts",
  materials: "Materials",
  inventory: "Inventory",
  transactions: "Stock transactions",
  addresses: "Address lookup",
};

export const DOMAIN_DESCRIPTIONS: Record<AdminDomain, string> = {
  orders: "Confirm, progress, and cancel customer orders without editing their contents.",
  products: "Manage product availability and review catalog details.",
  users: "Create staff accounts and manage their access status.",
  materials: "Manage the materials used in product recipes.",
  inventory: "Receive material deliveries and review stock batches.",
  transactions: "Every stock movement, newest first.",
  addresses: "Look up a saved customer delivery address.",
};

/** The letter shown in each section's nav badge. */
export const DOMAIN_INITIALS: Record<AdminDomain, string> = {
  orders: "O",
  products: "P",
  materials: "M",
  inventory: "I",
  transactions: "T",
  users: "S",
  addresses: "A",
};

export const isManager = (user: AccountUser) => user.role === "ADMIN" || user.role === "STAFF";

/** Sections the account may open, in nav order. Staff manage the catalog; Admins also see people. */
export function allowedDomainsFor(user: AccountUser | null): AdminDomain[] {
  if (user?.role === "ADMIN") return ["orders", "products", "materials", "inventory", "transactions", "users", "addresses"];
  if (user?.role === "STAFF") return ["orders", "products", "materials", "inventory", "transactions"];
  return [];
}

/** The section shown first. */
export const defaultDomain = (user: AccountUser | null): AdminDomain =>
  user && isManager(user) ? "orders" : "products";
