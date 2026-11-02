"use client";

import { useRef } from "react";

const CELLS = [0, 1, 2, 3, 4, 5];

/**
 * Six one-digit cells. Typing a digit moves to the next cell, Backspace on an empty cell moves back,
 * and pasting a whole code fills the cells in order. Reports the joined code on every change.
 */
export default function OtpCodeInput({ onChange }: { onChange: (code: string) => void }) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const reportCode = () => onChange(inputs.current.map((input) => input?.value ?? "").join(""));

  const handleInput = (i: number, e: React.FormEvent<HTMLInputElement>) => {
    const digit = e.currentTarget.value.replace(/\D/g, "").slice(-1);
    e.currentTarget.value = digit;
    if (digit && i < CELLS.length - 1) inputs.current[i + 1]?.focus();
    reportCode();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !e.currentTarget.value && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  };

  // Paste a whole code into any cell → spread one digit per cell, focus the end.
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, CELLS.length);
    if (!digits) return;
    e.preventDefault();
    digits.split("").forEach((d, idx) => {
      const cell = inputs.current[idx];
      if (cell) cell.value = d;
    });
    inputs.current[Math.min(digits.length, CELLS.length) - 1]?.focus();
    reportCode();
  };

  return (
    <div className="flex gap-[9px] w-full mt-9">
      {/* One input box per digit. */}
      {CELLS.map((i) => (
        <input
          key={i}
          ref={(el) => {
            inputs.current[i] = el;
          }}
          inputMode="numeric"
          maxLength={1}
          onInput={(e) => handleInput(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          aria-label={`Chữ số ${i + 1}`}
          className="flex-1 min-w-0 h-24 bg-white border-b-[2.5px] border-neutral-border rounded-t-[5px] text-center font-serif text-[30px] text-text-primary outline-none focus:border-primary transition-colors"
        />
      ))}
    </div>
  );
}
