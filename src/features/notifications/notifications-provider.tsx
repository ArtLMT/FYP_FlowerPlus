"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";
import { useCart } from "@/features/cart/cart-provider";
import { asApiError } from "@/lib/api";
import {
  getUnreadNotificationCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  notificationHref,
  type UserNotification,
} from "@/lib/services/notifications";

/**
 * Notifications store — the signed-in account's unread count, shared by the header bell, the account
 * menu and /account/notifications.
 *
 * There is no WebSocket in this release (decision 2026-11-20): the count is polled every 60 s while a
 * bell or the notifications page is on screen and the tab is visible, and again whenever the tab comes
 * back into view. When a poll finds more unread notices than the last one, open lists reload and a
 * toast names the newest notice.
 */

const POLL_MS = 60_000;

interface NotificationsContextValue {
  /** A guest has no notifications and sees no bell. */
  signedIn: boolean;
  /** Unread notices; null for a guest or until the first count arrives. */
  unread: number | null;
  /** Goes up each time a poll finds new notices, so an open list knows to load again. */
  revision: number;
  /** Marks one notice read, then re-counts. Throws ApiError. */
  markRead: (id: string) => Promise<void>;
  /** Throws ApiError. */
  markAllRead: () => Promise<void>;
  /** Registers a screen that shows notifications; polling runs only while one is mounted. Returns the release. */
  watch: () => () => void;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { shopper } = useCart();
  const { showToast } = useToast();
  const signedIn = shopper === "active" || shopper === "suspended";
  const [unread, setUnread] = useState<number | null>(null);
  const [revision, setRevision] = useState(0);
  const [watchers, setWatchers] = useState(0);
  /** The previous poll's count; null when polling (re)starts, so notices already there never toast. */
  const lastCount = useRef<number | null>(null);

  const toastNewest = useCallback(() => listNotifications(0, 1).then(
    (page) => {
      const newest = page.content[0];
      if (newest && !newest.read) showToast("info", `${newest.title}. ${newest.content}`);
    },
    () => undefined,
  ), [showToast]);

  const poll = useCallback(() => getUnreadNotificationCount().then(
    (count) => {
      const previous = lastCount.current;
      lastCount.current = count;
      setUnread(count);
      if (previous !== null && count > previous) {
        setRevision((value) => value + 1);
        void toastNewest();
      }
    },
    () => undefined, // Keep the last count; the next poll tries again.
  ), [toastNewest]);

  const polling = signedIn && watchers > 0;
  useEffect(() => {
    if (!polling) return;
    lastCount.current = null;
    void poll();
    const pollIfVisible = () => {
      if (document.visibilityState === "visible") void poll();
    };
    const timer = window.setInterval(pollIfVisible, POLL_MS);
    document.addEventListener("visibilitychange", pollIfVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", pollIfVisible);
    };
  }, [polling, poll]);

  const markRead = useCallback(async (id: string) => {
    await markNotificationRead(id);
    await poll();
  }, [poll]);

  const markAllRead = useCallback(async () => {
    await markAllNotificationsRead();
    lastCount.current = 0;
    setUnread(0);
  }, []);

  const watch = useCallback(() => {
    setWatchers((count) => count + 1);
    return () => setWatchers((count) => count - 1);
  }, []);

  const value: NotificationsContextValue = {
    signedIn,
    unread: signedIn ? unread : null,
    revision,
    markRead,
    markAllRead,
    watch,
  };

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) throw new Error("useNotifications must be used within a NotificationsProvider");
  return context;
}

/**
 * Opening a notice: marks it read (an unread one) and goes to its order. A failed mark-read is shown
 * as a toast; the order still opens. `onRead` lets a list mark its own row once the server agrees.
 */
export function useOpenNotice() {
  const router = useRouter();
  const { markRead } = useNotifications();
  const { showToast } = useToast();

  return useCallback((notice: UserNotification, onRead?: () => void) => {
    if (!notice.read) {
      markRead(notice.id).then(onRead, (cause: unknown) => showToast("error", asApiError(cause).message));
    }
    const href = notificationHref(notice);
    if (href) router.push(href);
  }, [markRead, router, showToast]);
}
