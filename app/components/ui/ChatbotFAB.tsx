"use client";

import { useState } from "react";

/**
 * ChatbotFAB — floating action button, fixed bottom-right.
 * Client Component because it manages the pulse animation via useState:
 *   - Pulses exactly twice on page load (CSS animation-iteration-count: 2)
 *   - On first click, removes the pulse class so it never replays
 *
 * Full chatbot panel UI can be built into this component when the
 * AI chat feature is ready (expand/collapse state, message list, etc.)
 */
export default function ChatbotFAB() {
  const [pulsing, setPulsing] = useState(true);

  return (
    <div
      id="chatbot-fab"
      className={`fixed bottom-24 right-6 z-[100] ${pulsing ? "animate-pulse-gentle" : ""}`}
    >
      <button
        onClick={() => setPulsing(false)}
        className="bg-primary text-text-on-primary w-12 h-12 rounded-full flex items-center justify-center hover:bg-primary-hover transition-colors shadow-md"
        aria-label="Open FlowerPlus chat assistant"
      >
        <span className="material-symbols-outlined">forum</span>
      </button>
    </div>
  );
}
