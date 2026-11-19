"use client";
import Button from "@/components/ui/Button";

import { useEffect, useRef } from "react";

/** success = it worked · warning = it worked or was refused, but the user should look · error = it failed. */
export type ToastKind = "success" | "warning" | "error";

export interface ToastMessage {
  id: number;
  kind: ToastKind;
  text: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

const STYLES: Record<ToastKind, {
  box: string; icon: string; iconBox: string; close: string; bar: string; label: string; duration: number; enter: string;
}> = {
  success: {
    box: "border-emerald-700 bg-white text-text-primary",
    icon: "check_circle", iconBox: "bg-emerald-600 text-white",
    close: "text-text-secondary hover:bg-neutral-surface", bar: "bg-emerald-600",
    label: "Thành công", duration: 4000, enter: "toast-enter",
  },
  warning: {
    box: "border-amber-600 bg-amber-300 text-amber-950",
    icon: "warning", iconBox: "bg-amber-950 text-amber-200",
    close: "text-amber-950 hover:bg-amber-400", bar: "bg-amber-950/60",
    label: "Lưu ý", duration: 9000, enter: "toast-enter",
  },
  error: {
    box: "border-red-800 bg-red-600 text-white",
    icon: "error", iconBox: "bg-white text-red-600",
    close: "text-white hover:bg-red-700", bar: "bg-white/70",
    label: "Thất bại", duration: 12000, enter: "toast-enter-error",
  },
};

/**
 * Toast banner: top-centre on every screen, for customers and staff alike.
 * Three kinds, deliberately loud — success (white, green), warning (amber), error (solid red,
 * shakes once) — each closes by itself (errors stay longest) or via its Close button.
 *
 * It is a manual popover, so it is drawn in the browser's top layer: above modal <dialog>s and
 * their dimmed backdrop, which a plain z-index cannot beat.
 */
export default function Toast({ toast, onClose }: ToastProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!toast) return;

    // Re-show on every new toast so it is the newest layer, even above a dialog opened since.
    const element = ref.current;
    if (element && typeof element.showPopover === "function") {
      try {
        if (element.matches(":popover-open")) element.hidePopover();
        element.showPopover();
      } catch {
        // Not in the document yet, or the browser lacks the Popover API: the fixed fallback still shows.
      }
    }

    const timeout = window.setTimeout(onClose, STYLES[toast.kind].duration);
    return () => window.clearTimeout(timeout);
  }, [toast, onClose]);

  if (!toast) return null;

  const style = STYLES[toast.kind];
  const urgent = toast.kind !== "success";

  return (
    <div
      key={toast.id}
      ref={ref}
      popover="manual"
      role={urgent ? "alert" : "status"}
      aria-live={urgent ? "assertive" : "polite"}
      className={`${style.enter} fixed inset-x-0 bottom-auto top-4 z-[60] mx-auto my-0 w-[calc(100%-2rem)] max-w-sm overflow-hidden rounded-xl border p-0 shadow-lg sm:top-5 ${style.box}`}
    >
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <span aria-hidden="true" className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${style.iconBox}`}>
          <span className="material-symbols-outlined" style={{ fontSize: 18, fontVariationSettings: "'FILL' 1, 'wght' 500" }}>{style.icon}</span>
        </span>
        <p className="min-w-0 flex-1 break-words text-sm font-semibold leading-snug">
          <span className="block text-[10px] font-extrabold uppercase tracking-wider opacity-80">{style.label}</span>
          {toast.text}
        </p>
        <Button type="button" onClick={onClose} aria-label="Đóng thông báo" className={`shrink-0 rounded-md px-2 py-1 text-xs font-bold ${style.close}`}>Đóng</Button>
      </div>
      <div
        aria-hidden="true"
        className={`toast-progress h-0.5 w-full ${style.bar}`}
        style={{ ["--toast-duration" as string]: `${style.duration}ms` }}
      />
    </div>
  );
}
