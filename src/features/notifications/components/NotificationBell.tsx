"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Button from "@/components/ui/Button";
import { SkeletonRows } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/ToastProvider";
import { useNotifications, useOpenNotice } from "@/features/notifications/notifications-provider";
import { asApiError } from "@/lib/api";
import { useResource } from "@/lib/hooks/use-resource";
import { formatNoticeTime, listNotifications } from "@/lib/services/notifications";

const LATEST = 10;

/**
 * Header bell for a signed-in account: unread badge, and a panel with the latest 10 notices,
 * "mark all read" and a link to /account/notifications. Clicking a notice marks it read and opens
 * its order. A guest sees nothing.
 *
 * UI map: bell button (+ badge) → panel: title row with "mark all read" → list (loading, error,
 * empty or rows) → "Xem tất cả". On a phone the panel spans the screen under the header; from md it
 * hangs under the bell.
 */
export default function NotificationBell() {
  const { signedIn, unread, revision, markAllRead, watch } = useNotifications();
  const openNotice = useOpenNotice();
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  /** Counts openings, so every opening loads the list again. */
  const [opened, setOpened] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const box = useRef<HTMLDivElement>(null);
  const latest = useResource(() => listNotifications(0, LATEST), open ? `${opened}:${revision}` : null);

  useEffect(() => watch(), [watch]);

  // Close on a click outside the bell and its panel, or on Escape.
  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => {
      if (!box.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  if (!signedIn) return null;

  const count = unread ?? 0;
  const notices = latest.data?.content;

  const toggle = () => {
    if (!open) {
      setOpened((value) => value + 1);
      setNow(Date.now());
    }
    setOpen(!open);
  };

  const readAll = async () => {
    try {
      await markAllRead();
      latest.setData((page) => page && { ...page, content: page.content.map((notice) => ({ ...notice, read: true })) });
    } catch (cause) {
      showToast("error", asApiError(cause).message);
    }
  };

  return (
    <div ref={box} className="relative">
      {/* Bell button with the unread badge. */}
      <Button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={`Thông báo${count ? `, ${count} chưa đọc` : ""}`}
        className="relative w-10 h-10 rounded-full bg-neutral-raised flex items-center justify-center text-text-secondary hover:bg-neutral-border transition-colors"
      >
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
          notifications
        </span>
        {count > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </Button>

      {open && (
        <div
          role="dialog"
          aria-label="Thông báo"
          className="fixed inset-x-4 top-16 z-50 overflow-hidden rounded-2xl border border-neutral-border bg-neutral-canvas text-left shadow-[0_12px_40px_rgba(45,28,24,0.18)] md:absolute md:inset-x-auto md:right-0 md:top-12 md:w-[380px]"
        >
          {/* Title row with "mark all read". */}
          <div className="flex items-center justify-between gap-3 border-b border-neutral-border px-4 py-3">
            <p className="m-0 font-serif text-[20px] font-medium text-primary">Thông báo</p>
            <Button
              type="button"
              onClick={readAll}
              disabled={count === 0}
              className="font-sans text-body-sm font-bold text-primary disabled:text-text-muted"
            >
              Đánh dấu tất cả đã đọc
            </Button>
          </div>

          {/* The latest notices, or the loading, error or empty state. */}
          <div className="max-h-[min(60vh,440px)] overflow-y-auto">
            {latest.error ? (
              <div role="alert" className="px-4 py-8 text-center font-sans text-body-sm text-primary">
                {latest.error.message}{" "}
                <Button type="button" onClick={latest.reload} className="font-bold underline">Thử lại</Button>
              </div>
            ) : !notices ? (
              <SkeletonRows label="Đang tải thông báo..." className="p-4" />
            ) : notices.length === 0 ? (
              <p className="m-0 px-4 py-8 text-center font-serif italic text-heading-sm text-text-muted">
                Chưa có thông báo nào.
              </p>
            ) : (
              <ul className="m-0 list-none p-0">
                {notices.map((notice) => (
                  <li key={notice.id} className="border-b border-neutral-border last:border-b-0">
                    {/* One notice: unread dot, title, text, time. */}
                    <Button
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        openNotice(notice);
                      }}
                      className={`flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-neutral-surface ${
                        notice.read ? "" : "bg-neutral-surface/70"
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`mt-[7px] h-2 w-2 flex-none rounded-full ${notice.read ? "bg-transparent" : "bg-primary"}`}
                      />
                      <span className="min-w-0 flex-1">
                        <span className={`block font-sans text-body-sm text-text-primary ${notice.read ? "" : "font-bold"}`}>
                          {notice.title}
                          {!notice.read && <span className="sr-only"> (chưa đọc)</span>}
                        </span>
                        <span className="line-clamp-2 block font-sans text-body-sm text-text-secondary">{notice.content}</span>
                        <span className="mt-1 block font-sans text-label text-text-muted">
                          {formatNoticeTime(notice.createdAt, now)}
                        </span>
                      </span>
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Link to the full, paged list. */}
          <Link
            href="/account/notifications"
            onClick={() => setOpen(false)}
            className="block border-t border-neutral-border px-4 py-3 text-center font-sans text-body-sm font-bold text-primary hover:bg-neutral-surface"
          >
            Xem tất cả
          </Link>
        </div>
      )}
    </div>
  );
}
