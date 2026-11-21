"use client";

import { useNotifications } from "@/features/notifications/notifications-provider";

/** The unread-notifications count beside the "Thông báo" menu entry; nothing when all are read. */
export default function UnreadPill({ inverted = false }: { inverted?: boolean }) {
  const { unread } = useNotifications();
  if (!unread) return null;

  return (
    <span
      aria-label={`${unread} chưa đọc`}
      className={`ml-auto min-w-[22px] h-[22px] px-[6px] rounded-full font-sans text-[11px] font-bold flex items-center justify-center ${
        inverted ? "bg-white text-primary" : "bg-primary text-white"
      }`}
    >
      {unread > 99 ? "99+" : unread}
    </span>
  );
}
