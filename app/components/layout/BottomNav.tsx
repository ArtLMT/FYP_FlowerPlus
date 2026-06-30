const NAV_ITEMS = [
  { label: "Trang chủ", icon: "home", href: "/", active: true },
  { label: "Khám phá", icon: "search", href: "/shop", active: false },
  { label: "Giỏ hàng", icon: "shopping_cart", href: "/cart", active: false },
  { label: "Tài khoản", icon: "person", href: "/account", active: false },
] as const;

export default function BottomNav() {
  return (
    <>
      <nav
        className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-neutral-canvas/95 backdrop-blur-md grid grid-cols-4 py-[10px] pb-[14px] border-t border-neutral-border"
        aria-label="Điều hướng chính"
      >
        {NAV_ITEMS.map(({ label, icon, href, active }) => (
          <a
            key={label}
            href={href}
            className={`flex flex-col items-center gap-[5px] ${active ? "text-primary" : "text-text-muted hover:text-primary"} transition-colors`}
            aria-label={label}
            aria-current={active ? "page" : undefined}
          >
            <span
              className="material-symbols-outlined"
              style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {icon}
            </span>
            <span className={`font-sans text-[10.5px] ${active ? "font-bold" : "font-normal"}`}>
              {label}
            </span>
          </a>
        ))}
      </nav>

      <div className="h-20 md:hidden" aria-hidden="true" />
    </>
  );
}
