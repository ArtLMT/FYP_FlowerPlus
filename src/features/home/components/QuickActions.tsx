/**
 * QuickActions — the 4 shortcut buttons (Đơn hàng / Đặt riêng / Ưu đãi / Tài khoản).
 *
 * Reused in TWO places with different shapes (one component, `layout` prop):
 *   • layout="grid" → in the mobile Header (icon stacked over label)
 *   • layout="row"  → below the desktop Hero (icon beside label, left-aligned)
 *
 * The data lives here once; only the presentation changes.
 */
const ACTIONS = [
  { label: "Đơn hàng", icon: "shopping_bag" },
  { label: "Đặt riêng", icon: "edit" },
  { label: "Ưu đãi", icon: "local_offer" },
  { label: "Tài khoản", icon: "person" },
];

export default function QuickActions({
  layout = "grid",
  className = "",
}: {
  layout?: "grid" | "row";
  className?: string;
}) {
  const isRow = layout === "row";

  return (
    <div className={`grid grid-cols-4 ${isRow ? "gap-[18px]" : "gap-2"} ${className}`}>
      {ACTIONS.map(({ label, icon }) => (
        <button
          key={label}
          className={`bg-neutral-surface border border-neutral-border cursor-pointer text-text-secondary hover:bg-neutral-raised transition-colors ${
            isRow
              ? "flex items-center gap-[14px] rounded-2xl px-[22px] py-[18px] text-left"
              : "flex flex-col items-center gap-[7px] rounded-xl px-1 py-[11px]"
          }`}
        >
          <span
            className="material-symbols-outlined text-primary"
            style={{ fontSize: 20 }}
          >
            {icon}
          </span>
          <span
            className={`font-sans font-bold text-text-primary ${
              isRow ? "text-[14px]" : "text-[10.5px] tracking-[0.02em]"
            }`}
          >
            {label}
          </span>
        </button>
      ))}
    </div>
  );
}
