"use client";

import { useEffect } from "react";
import type { ToastKind } from "@/components/ui/Toast";
import { useToast } from "@/components/ui/ToastProvider";

/**
 * Shows `text` as a toast whenever it changes to a non-empty value. Actions that reset their
 * message to "" / null before running (as the managers and useAsyncAction do) therefore show
 * every result, even when the same message repeats.
 */
export function useFeedbackToast(kind: ToastKind, text: string | null | undefined) {
  const { showToast } = useToast();

  useEffect(() => {
    if (text) showToast(kind, text);
  }, [kind, text, showToast]);
}
