"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Button from "@/components/ui/Button";

/** The admin section menu on small screens (S4): slides over the page, closes on Escape or a tap outside. */
export default function AdminDrawer({ onClose, children }: { onClose: () => void; children: ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.showModal();
    return () => dialog.close();
  }, []);

  return <dialog
    ref={dialogRef}
    aria-label="Menu quản trị"
    onCancel={(event) => { event.preventDefault(); onClose(); }}
    onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
    className="fixed inset-y-0 left-0 m-0 h-dvh max-h-none w-[min(20rem,85vw)] max-w-none border-0 bg-transparent p-0 shadow-2xl backdrop:bg-black/50"
  >
    <div className="flex h-full flex-col overflow-y-auto bg-white px-4 py-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm font-extrabold tracking-[0.12em] text-primary-deep">FLOWERPLUS</p>
        <Button type="button" onClick={onClose} aria-label="Đóng menu" className="grid size-11 place-items-center rounded-lg text-text-secondary hover:bg-neutral-surface">
          <span className="material-symbols-outlined" aria-hidden="true">close</span>
        </Button>
      </div>
      <nav aria-label="Các khu vực quản trị" className="flex flex-col gap-1.5">{children}</nav>
    </div>
  </dialog>;
}
