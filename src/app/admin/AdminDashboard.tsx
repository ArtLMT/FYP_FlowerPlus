"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import AddressLookup from "@/features/admin/AddressLookup";
import CategoryManager from "@/features/admin/CategoryManager";
import InventoryManager from "@/features/admin/InventoryManager";
import MaterialManager from "@/features/admin/MaterialManager";
import OrderManager from "@/features/admin/OrderManager";
import ProductManager from "@/features/admin/ProductManager";
import StaffManager from "@/features/admin/StaffManager";
import StockAlert from "@/features/admin/StockAlert";
import { useStockShortages } from "@/features/admin/hooks/use-stock-shortages";
import TransactionLedger from "@/features/admin/TransactionLedger";
import {
  allowedDomainsFor,
  defaultDomain,
  DOMAIN_DESCRIPTIONS,
  DOMAIN_INITIALS,
  DOMAIN_NAMES,
  type AdminDomain,
} from "@/features/admin/domains";
import type { AccountUser } from "@/lib/services/auth";

/**
 * Admin page shell and section switcher.
 *
 * UI map:
 * - The desktop sidebar and mobile navigation are in this file.
 * - The page title/description header is in this file.
 * - The stock alert under the header shows on every section: `src/features/admin/StockAlert.tsx`.
 * - Each workspace body lives in its matching `src/features/admin/*Manager.tsx` component.
 */
export default function AdminDashboard({
  user,
  initialError,
}: {
  user: AccountUser | null;
  initialError: string;
}) {
  const [domain, setDomain] = useState<AdminDomain>(defaultDomain(user));
  const allowedDomains = allowedDomainsFor(user);
  const stock = useStockShortages(allowedDomains.length > 0);
  // A new object each time, so asking for the same Order or material twice still acts.
  const [openOrder, setOpenOrder] = useState<{ orderId: string } | null>(null);
  const [receive, setReceive] = useState<{ materialId: string } | null>(null);

  function showOrder(orderId: string) {
    setOpenOrder({ orderId });
    setDomain("orders");
  }

  function receiveStock(materialId: string) {
    setReceive({ materialId });
    setDomain("inventory");
  }

  const navContent = allowedDomains.map((item) => {
    const badge = item === "inventory" && stock.shortCount > 0 ? stock.shortCount : 0;
    return <Button
      key={item}
      type="button"
      aria-current={domain === item ? "page" : undefined}
      aria-label={badge ? `${DOMAIN_NAMES[item]}, ${badge} nguyên liệu đang thiếu` : undefined}
      onClick={() => {
        setDomain(item);
        setOpenOrder(null);
        setReceive(null);
      }}
      className={`flex min-h-11 shrink-0 items-center gap-3 rounded-xl px-3.5 text-left text-sm font-semibold transition-colors ${domain === item ? "bg-primary text-white shadow-sm" : "text-text-secondary hover:bg-neutral-surface hover:text-primary-deep"}`}
    >
      <span aria-hidden="true" className="grid size-7 shrink-0 place-items-center rounded-lg bg-white/20 text-xs font-bold">{DOMAIN_INITIALS[item]}</span>
      <span className="flex-1">{DOMAIN_NAMES[item]}</span>
      {badge > 0 && <span aria-hidden="true" className="grid h-[22px] min-w-[22px] place-items-center rounded-full bg-red-700 px-1.5 text-xs font-extrabold text-white">{badge}</span>}
    </Button>;
  });

  return <main className="min-h-screen w-full min-w-0 max-w-full overflow-x-hidden bg-neutral-canvas lg:grid lg:grid-cols-[252px_minmax(0,1fr)]">
    {/* Desktop navigation sidebar. Mobile navigation is rendered in the page header below. */}
    <aside className="hidden border-r border-neutral-border bg-white px-4 py-6 lg:flex lg:min-h-screen lg:flex-col">
      <div className="mb-9 flex items-center gap-3 px-2">
        <span className="grid size-10 place-items-center rounded-2xl bg-primary text-xl text-white">✿</span>
        <div><p className="text-sm font-extrabold tracking-[0.12em] text-primary-deep">FLOWERPLUS</p><p className="mt-0.5 text-xs text-text-muted">Admin workbench</p></div>
      </div>
      <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-text-muted">Workspace</p>
      <nav aria-label="Admin sections" className="flex flex-col gap-1.5">{navContent}</nav>
      <div className="mt-auto rounded-2xl bg-neutral-canvas p-3.5">
        <p className="truncate text-sm font-semibold text-text-primary">{user?.fullName || user?.username || "Signed out"}</p>
        <p className="mt-1 text-xs text-text-muted">{user?.role || "FlowerPlus account"}</p>
      </div>
    </aside>

    <div className="min-w-0 px-4 pb-8 pt-4 sm:px-7 sm:pt-6 lg:px-8 lg:py-7 xl:px-10">
      {/* Shared heading for whichever Admin workspace is currently selected. */}
      <header className="mx-auto mb-5 max-w-[1500px]">
        {/*<div className="flex items-center justify-between border-b border-neutral-border pb-4 lg:pb-5">*/}
        {/*  <div className="flex items-center gap-2 lg:hidden"><span className="grid size-8 place-items-center rounded-xl bg-primary text-white">✿</span><span className="text-xs font-extrabold tracking-[0.1em] text-primary-deep">FLOWERPLUS</span></div>*/}
        {/*  <p className="hidden text-sm text-text-muted lg:block">Admin / <span className="font-semibold text-text-secondary">{DOMAIN_NAMES[domain]}</span></p>*/}
        {/*  {user && <span className="rounded-full border border-neutral-border bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-text-secondary">{user.role}</span>}*/}
        {/*</div>*/}
        {allowedDomains.length > 0 && <nav aria-label="Admin sections" className="no-scrollbar -mx-1 mt-3 flex gap-2 overflow-x-auto pb-1 lg:hidden">{navContent}</nav>}
        <div className="pt-5 lg:pt-7">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary-deep">FlowerPlus · Administration</p>
          <h1 className="mt-1 font-serif text-3xl font-semibold text-text-primary sm:text-4xl">{DOMAIN_NAMES[domain]}</h1>
          <p className="mt-1.5 text-sm text-text-secondary">{user?.fullName ? `Welcome back, ${user.fullName}. ` : ""}{DOMAIN_DESCRIPTIONS[domain]}</p>
        </div>
      </header>

      {/* Selected workspace content. Add or move Admin sections in this switch. */}
      <div className="mx-auto min-w-0 max-w-[1500px]">
        {user && allowedDomains.length > 0 && <div className="mb-5"><StockAlert stock={stock} onReceive={receiveStock} onOpenOrder={showOrder} /></div>}
        {!user && <section className="rounded-2xl border border-neutral-border bg-white p-4 shadow-sm sm:p-6"><p className="text-text-secondary">{initialError || "Could not load your account."} <a className="font-semibold text-primary-deep underline" href="/login">Sign in</a></p></section>}
        {user && allowedDomains.length === 0 && <section className="rounded-2xl border border-neutral-border bg-white p-5 shadow-sm"><h2 className="font-serif text-2xl text-text-primary">No access</h2><p className="mt-2 text-text-secondary">This page is available to Staff and Admin accounts.</p></section>}
        {user && allowedDomains.length > 0 && domain === "products" && <ProductManager />}
        {user && allowedDomains.length > 0 && domain === "categories" && <CategoryManager />}
        {user && allowedDomains.length > 0 && domain === "orders" && <OrderManager stockByOrder={stock.stockByOrder} openRequest={openOrder} onStockChanged={stock.reload} />}
        {user && allowedDomains.length > 0 && domain === "materials" && <MaterialManager />}
        {user && allowedDomains.length > 0 && domain === "inventory" && <InventoryManager receiveRequest={receive} onStockChanged={stock.reload} />}
        {user && allowedDomains.length > 0 && domain === "transactions" && <TransactionLedger />}
        {user && user.role === "ADMIN" && domain === "users" && <StaffManager />}
        {user && user.role === "ADMIN" && domain === "addresses" && <AddressLookup />}
      </div>
    </div>
  </main>;
}
