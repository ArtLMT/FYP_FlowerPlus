"use client";
import Button from "@/components/ui/Button";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { errorText } from "@/lib/api";
import { resendOtp, verifyEmail } from "@/lib/services/auth";

/**
 * OTP verification — /login/otp
 *
 * UI-only. The focus-advance between cells and the resend countdown are pure
 * interface behaviour (no server involved).
 *
 * TODO(api): send the real code to the user's email/phone.
 * TODO(logic): VERIFY should submit the entered code for validation before
 *              routing onward.
 */
const CELLS = [0, 1, 2, 3, 4, 5];

export default function OtpPage() {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const [secs, setSecs] = useState(59);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  useEffect(() => {
    Promise.resolve().then(() => setEmail(new URLSearchParams(window.location.search).get("email") ?? ""));
  }, []);

  const verify = async () => {
    const code = inputs.current.map((input) => input?.value ?? "").join("");
    if (code.length !== 6 || !email) { setError("Vui lòng nhập đủ sáu chữ số."); return; }
    setBusy(true);
    setError("");
    try {
      await verifyEmail(email, code);
      router.replace("/account");
      router.refresh();
    } catch (cause) { setError(errorText(cause)); }
    finally { setBusy(false); }
  };

  const resend = async () => {
    setBusy(true);
    setError("");
    try { await resendOtp(email); setSecs(59); }
    catch (cause) { setError(errorText(cause)); }
    finally { setBusy(false); }
  };

  // Resend countdown — one interval for the component's life (a functional
  // update clamps at 0). Deps MUST stay [] — using [secs] tore the interval
  // down and recreated it every tick.
  useEffect(() => {
    const t = setInterval(() => setSecs((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  const handleInput = (i: number, e: React.FormEvent<HTMLInputElement>) => {
    const digit = e.currentTarget.value.replace(/\D/g, "").slice(-1);
    e.currentTarget.value = digit;
    if (digit && i < CELLS.length - 1) inputs.current[i + 1]?.focus();
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
    const last = Math.min(digits.length, CELLS.length) - 1;
    inputs.current[last]?.focus();
  };

  const countdown = `0:${String(secs).padStart(2, "0")}`;

  return (
    <div className="min-h-dvh flex flex-col bg-neutral-canvas md:items-center md:justify-center md:px-5">
      {/* Card wrapper — transparent on mobile, centered card on desktop (md) */}
      <div className="contents md:block md:w-full md:max-w-[440px] md:my-16 md:bg-neutral-surface md:border md:border-neutral-border md:rounded-3xl md:overflow-hidden md:pb-6">
      {/* Back */}
      <div className="px-[18px] pt-5">
        <Link
          href="/"
          className="w-10 h-10 rounded-full flex items-center justify-center text-text-primary hover:bg-neutral-surface transition-colors"
          aria-label="Quay lại"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col items-center px-[30px]">
        <div className="mt-11 w-[132px] h-[132px] rounded-[26px] bg-neutral-raised flex items-center justify-center text-primary">
          <span className="material-symbols-outlined" style={{ fontSize: 56 }}>
            mail
          </span>
        </div>

        <h1 className="font-serif font-medium text-[30px] text-primary mt-[34px] m-0">
          Kiểm tra hộp thư
        </h1>
        <p className="font-sans text-[18px] text-text-muted mt-3 m-0 text-center">
          Chúng tôi đã gửi mã đến <span className="text-text-secondary">{email}</span>
        </p>

        {/* OTP cells */}
        <div className="flex gap-[9px] w-full mt-9">
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

        {/* Resend */}
        <p className="font-sans text-[16px] text-text-muted mt-[26px] m-0">
          {secs > 0 ? (
            <span className="underline text-text-muted">Gửi lại mã</span>
          ) : (
            // TODO(logic): trigger a real resend
            <Button onClick={resend} disabled={busy || !email} className="underline text-primary">Gửi lại mã</Button>
          )}
          {secs > 0 && ` — sau ${countdown}`}
        </p>
        {error && <p role="alert" className="mt-4 text-red-700">{error}</p>}
      </div>

      {/* Verify */}
      <div className="px-[22px] pt-4 pb-[30px]">
        {/* TODO(logic): validate the code before navigating */}
        <Button
          onClick={verify}
          disabled={busy || !email}
          className="block w-full text-center bg-primary text-white rounded-[13px] py-[19px] font-sans font-bold text-body-sm tracking-[0.12em] hover:bg-primary-hover transition-colors"
        >
          XÁC THỰC
        </Button>
      </div>
      </div>
      {/* end card wrapper */}
    </div>
  );
}
