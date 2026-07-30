/**
 * Container — the responsive width wrapper used by every homepage section.
 *
 * Mobile: full width with a 20px gutter (px-5).
 * Desktop: capped at 1240px, centered, with a 40px gutter (md:px-10).
 *
 * This is the single source of truth for page width. The desktop mockup
 * repeats `max-width: 1240px; margin: 0 auto; padding: 0 40px` on every
 * section — this component captures that once. Change the max-width here
 * and the whole site follows.
 */
export default function Container({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-[1240px] px-5 md:px-10 ${className}`}>
      {children}
    </div>
  );
}
