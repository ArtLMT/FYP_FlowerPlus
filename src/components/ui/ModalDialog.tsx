"use client";
import Button from "@/components/ui/Button";

import { useEffect, useRef } from "react";

interface ModalDialogProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
}

export default function ModalDialog({ title, onClose, children, footer, wide = false }: ModalDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    dialog.showModal();
    return () => dialog.close();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-label={title}
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
      className={`fixed inset-0 m-auto h-fit max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-none overflow-hidden border-0 bg-transparent p-0 shadow-none backdrop:bg-black/65 backdrop:backdrop-blur-[2px] sm:max-h-[calc(100dvh-3rem)] sm:w-full ${wide ? "sm:max-w-2xl" : "sm:max-w-xl"}`}
    >
      <div className="flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-2xl border border-neutral-border bg-neutral-canvas shadow-2xl sm:max-h-[calc(100dvh-3rem)]">
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-neutral-border bg-white px-5 py-4 sm:px-7">
          <h2 className="font-serif text-2xl font-semibold text-text-primary">{title}</h2>
          <Button type="button" onClick={onClose} aria-label="Đóng hộp thoại" className="rounded-lg px-3 py-2 text-sm font-semibold text-text-muted hover:bg-neutral-surface hover:text-text-primary">Đóng</Button>
        </header>
        <div className="max-h-[calc(100dvh-12rem)] overflow-y-auto overscroll-contain px-5 py-5 sm:max-h-[calc(100dvh-12rem)] sm:px-7">{children}</div>
        {footer && <footer className="shrink-0 border-t border-neutral-border bg-white px-5 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:px-7 sm:pb-4">{footer}</footer>}
      </div>
    </dialog>
  );
}
