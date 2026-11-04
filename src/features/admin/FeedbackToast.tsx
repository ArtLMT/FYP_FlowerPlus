"use client";

import { useEffect, useRef } from "react";
import { useToast } from "@/components/ui/ToastProvider";

type Feedback = { kind: "success" | "error"; text: string };

/** Shows a section's success or failure message as a toast, once per message. */
export default function FeedbackToast({ feedback }: { feedback: Feedback | null }) {
  const { showToast } = useToast();
  const shown = useRef<Feedback | null>(null);

  useEffect(() => {
    if (!feedback || feedback === shown.current) return;
    shown.current = feedback;
    showToast(feedback.kind, feedback.text);
  }, [feedback, showToast]);

  return null;
}
