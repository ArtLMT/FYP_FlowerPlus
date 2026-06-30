const QUICK_ACTIONS = [
  { label: "Đơn hàng", icon: "shopping_bag" },
  { label: "Đặt riêng", icon: "edit" },
  { label: "Ưu đãi", icon: "local_offer" },
  { label: "Tài khoản", icon: "person" },
] as const;

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-neutral-canvas px-margin-mobile pt-4 pb-3">
      {/* Row 1: Wordmark + icon buttons */}
      <div className="flex items-center justify-between mb-[14px]">
        <span className="font-serif text-[24px] italic text-primary leading-none tracking-heading">
          FlowerPlus
        </span>
        <div className="flex gap-[10px]">
          <button
            className="w-[38px] h-[38px] rounded-full bg-neutral-raised flex items-center justify-center text-text-secondary hover:bg-neutral-border transition-colors"
            aria-label="Giỏ hàng"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              shopping_cart
            </span>
          </button>
          <button
            className="w-[38px] h-[38px] rounded-full bg-neutral-raised flex items-center justify-center text-text-secondary hover:bg-neutral-border transition-colors"
            aria-label="Tài khoản"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              person
            </span>
          </button>
        </div>
      </div>

      {/* Row 2: Search bar */}
      <div className="flex items-center gap-[10px] bg-neutral-surface border border-neutral-border rounded-full px-4 py-[11px] mb-[14px]">
        <span className="material-symbols-outlined text-text-muted" style={{ fontSize: 17 }}>
          search
        </span>
        <span className="font-sans text-[14px] text-text-muted">Tìm hoa, dịp lễ...</span>
      </div>

      {/* Row 3: Quick actions */}
      <div className="grid grid-cols-4 gap-2">
        {QUICK_ACTIONS.map(({ label, icon }) => (
          <button
            key={label}
            className="flex flex-col items-center gap-[7px] bg-neutral-surface border border-neutral-border rounded-xl py-[11px] px-1 cursor-pointer text-text-secondary hover:bg-neutral-raised transition-colors"
          >
            <span className="material-symbols-outlined text-primary" style={{ fontSize: 20 }}>
              {icon}
            </span>
            <span className="font-sans font-bold text-[10.5px] tracking-[0.02em] text-text-primary">
              {label}
            </span>
          </button>
        ))}
      </div>
    </header>
  );
}
