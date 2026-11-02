import Link from "next/link";
import type { ReactNode } from "react";
import Button from "@/components/ui/Button";

/** A centered full-width message (loading, empty, signed out…) with an optional action below it. */
export default function Notice({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="text-center py-24 px-6">
      <p className="font-serif italic text-heading-sm text-text-muted m-0">{title}</p>
      {children}
    </div>
  );
}

const actionClass =
  "inline-block mt-6 bg-primary text-white rounded-full py-3 px-8 font-sans font-bold text-body-sm tracking-button hover:bg-primary-hover transition-colors";

/** Pill-shaped link shown under a Notice (e.g. "Back to shop"). */
export function NoticeLink({ href, children }: { href: string; children: ReactNode }) {
  return <Link href={href} className={actionClass}>{children}</Link>;
}

/** Pill-shaped button shown under a Notice (e.g. "Retry"). */
export function NoticeButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return <Button onClick={onClick} className={actionClass}>{children}</Button>;
}
