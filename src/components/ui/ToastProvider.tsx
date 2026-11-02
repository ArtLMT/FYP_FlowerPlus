"use client";

import Toast, { type ToastMessage } from "@/components/ui/Toast";
import { createContext, useCallback, useContext, useRef, useState } from "react";

interface ToastContextValue {
  showToast: (kind: ToastMessage["kind"], text: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/** Holds the single visible toast and renders it above the page; call `useToast().showToast` to display one. */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const toastId = useRef(0);

  const showToast = useCallback((kind: ToastMessage["kind"], text: string) => {
    toastId.current += 1;
    setToast({ id: toastId.current, kind, text });
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast toast={toast} onClose={dismissToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider.");
  return context;
}
