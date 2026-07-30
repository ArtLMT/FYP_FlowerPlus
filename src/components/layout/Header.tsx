import Link from "next/link";
import Container from "@/components/ui/Container";
import HeaderIcons from "@/components/layout/HeaderIcons";

/**
 * Header — responsive top bar, shown on every storefront-style page.
 *
 *   • Mobile  (md:hidden)     → wordmark + icons, search pill
 *   • Desktop (hidden md:flex) → wordmark + nav links + search + icons, capped at 1240px
 *
 * NOTE: the QuickActions "sub navigation" row is NOT part of the header — it is
 * home-page content (rendered by app/(storefront)/page.tsx), so it appears on
 * the home page only and never follows the header onto other pages.
 */

const DESKTOP_NAV = [
  { label: "Trang chủ", href: "/", active: true },
  { label: "Bộ sưu tập", href: "/shop", active: false },
  { label: "Đặt riêng", href: "/custom", active: false },
  { label: "Ưu đãi", href: "/deals", active: false },
];

function SearchPill({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-center gap-[10px] bg-neutral-surface border border-neutral-border rounded-full ${className}`}
    >
      <span className="material-symbols-outlined text-text-muted" style={{ fontSize: 17 }}>
        search
      </span>
      <span className="font-sans text-[13px] text-text-muted">Tìm hoa, dịp lễ...</span>
    </div>
  );
}

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-neutral-canvas/90 backdrop-blur-sm border-b border-neutral-border md:border-b">
      {/* ── Mobile ── */}
      <div className="md:hidden px-margin-mobile pt-4 pb-3">
        <div className="flex items-center justify-between mb-[14px]">
          <span className="font-serif text-[24px] italic text-primary leading-none tracking-heading">
            FlowerPlus
          </span>
          <HeaderIcons />
        </div>
        <SearchPill className="px-4 py-[11px]" />
      </div>

      {/* ── Desktop ── */}
      <div className="hidden md:block">
        <Container className="h-[74px] flex items-center gap-9">
          <span className="font-serif text-[28px] italic text-primary leading-none tracking-heading">
            FlowerPlus
          </span>
          <nav className="flex gap-7 items-center">
            {DESKTOP_NAV.map(({ label, href, active }) => (
              <Link
                key={label}
                href={href}
                className={`font-sans font-bold text-[14px] transition-colors ${
                  active ? "text-primary" : "text-text-secondary hover:text-primary"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex-1" />
          <SearchPill className="px-4 py-[9px] w-60" />
          <HeaderIcons />
        </Container>
      </div>
    </header>
  );
}
