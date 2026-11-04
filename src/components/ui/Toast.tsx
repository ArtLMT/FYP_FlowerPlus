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
 * Toast banner: fixed top-centre on every screen, for customers and staff alike.
 * Red for errors, white for success; closes by itself (errors stay longer) or via its Close button.
 */
export default function Toast({ toast, onClose }: ToastProps) {
  useEffect(() => {
    if (!toast) return;

    const timeout = window.setTimeout(onClose, toast.kind === "error" ? 8000 : 4000);
    return () => window.clearTimeout(timeout);
  }, [toast, onClose]);

  if (!toast) return null;

  const isError = toast.kind === "error";

  return (
    <div
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
      className={`fixed inset-x-4 top-4 z-[60] mx-auto flex max-w-md items-start justify-between gap-4 rounded-xl border px-4 py-3 text-sm shadow-lg sm:top-6 ${isError ? "border-red-200 bg-red-50 text-red-800" : "border-accent-sage-light bg-white text-text-primary"}`}
    >
      <p>{toast.text}</p>
      <Button type="button" onClick={onClose} aria-label="Đóng thông báo" className="shrink-0 font-semibold">Đóng</Button>
    </div>
  );
}
