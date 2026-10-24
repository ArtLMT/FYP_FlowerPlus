"use client";
import Button from "@/components/ui/Button";

import { useEffect } from "react";

export interface ToastMessage {
  id: number;
  kind: "success" | "error";
  text: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

/**
 * Toast banner: fixed at the top (full width on mobile, top-right on desktop).
 * Red for errors, white for success; auto-closes after 4 seconds or via its Close button.
 */
export default function Toast({ toast, onClose }: ToastProps) {
  useEffect(() => {
    if (!toast) return;

    const timeout = window.setTimeout(onClose, 4000);
    return () => window.clearTimeout(timeout);
  }, [toast, onClose]);

  if (!toast) return null;

  const isError = toast.kind === "error";

  return (
    <div
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
      className={`fixed inset-x-4 top-4 z-50 flex items-start justify-between gap-4 rounded-xl border px-4 py-3 text-sm shadow-lg sm:inset-x-auto sm:right-6 sm:top-6 sm:w-[min(24rem,calc(100vw-3rem))] ${isError ? "border-red-200 bg-red-50 text-red-800" : "border-accent-sage-light bg-white text-text-primary"}`}
    >
      <p>{toast.text}</p>
      <Button type="button" onClick={onClose} aria-label="Đóng thông báo" className="shrink-0 font-semibold">Đóng</Button>
    </div>
  );
}
