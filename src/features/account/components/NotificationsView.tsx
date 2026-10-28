"use client";
import Button from "@/components/ui/Button";

import { useState } from "react";
import DetailHeader from "@/features/account/components/DetailHeader";
import type { Notification, NotificationKind } from "@/lib/types";

/**
 * Notifications view for /account/notifications.
 *
 * Data comes from the account service; local state tracks read/unread so tapping a
 * notification marks it read. Filtering is a pure client pass.
 *
 * TODO(api): persist the read state.
 */

const FILTERS: { key: "all" | NotificationKind; label: string }[] = [
  { key: "all", label: "TẤT CẢ" },
  { key: "order", label: "ĐƠN HÀNG" },
  { key: "voucher", label: "ƯU ĐÃI" },
  { key: "account", label: "TÀI KHOẢN" },
];

export default function NotificationsView({ notifications: seed }: { notifications: Notification[] }) {
  const [notes, setNotes] = useState(seed);
  const [filter, setFilter] = useState<"all" | NotificationKind>("all");

  const markRead = (id: string) =>
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)));

  const visible = notes.filter((n) => filter === "all" || n.kind === filter);

  return (
    <div className="min-h-dvh flex flex-col bg-neutral-canvas md:min-h-0 md:block md:bg-transparent">
      {/* Mobile-only back-bar; desktop uses the account layout title. */}
      <DetailHeader title="Thông báo" />

      {/* Filter pills */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar px-[18px] py-4 md:px-0 md:pt-0 md:flex-wrap md:overflow-visible">
        {FILTERS.map(({ key, label }) => {
          const on = key === filter;
          return (
            <Button
              key={key}
              onClick={() => setFilter(key)}
              aria-pressed={on}
              className={`whitespace-nowrap flex-shrink-0 rounded-full py-[11px] px-5 font-sans font-bold text-body-sm tracking-badge transition-colors ${
                on
                  ? "bg-tertiary text-text-primary border-none"
                  : "bg-transparent border border-neutral-border text-text-muted hover:bg-neutral-surface"
              }`}
            >
              {label}
            </Button>
          );
        })}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto no-scrollbar md:flex-none md:overflow-hidden md:mt-2 md:border md:border-neutral-border md:rounded-2xl">
        {/* One notification row: category, title, body, time. Unread rows have a tinted background. */}
        {visible.map((n) => (
          <Button
            key={n.id}
            onClick={() => markRead(n.id)}
            className={`block w-full text-left px-[22px] py-6 border-b border-neutral-border last:border-b-0 ${
              n.unread ? "bg-neutral-surface" : ""
            }`}
          >
            <p className="font-sans font-bold text-label tracking-badge text-text-muted m-0">{n.cat}</p>
            <h2 className="font-serif font-medium text-heading-md leading-[1.15] text-text-primary mt-2 m-0">
              {n.title}
            </h2>
            <p className="font-sans text-body text-text-secondary mt-2 m-0">{n.body}</p>
            <p className="font-sans text-body-sm text-text-muted text-right mt-[14px] m-0">{n.time}</p>
          </Button>
        ))}
      </div>
    </div>
  );
}
