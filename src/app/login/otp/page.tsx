"use client";

import Link from "next/link";
import Button from "@/components/ui/Button";
import OtpCodeInput from "@/features/auth/components/OtpCodeInput";
import { useEmailVerification } from "@/features/auth/hooks/use-email-verification";

/** OTP verification — /login/otp */
export default function OtpPage() {
  const otp = useEmailVerification();

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
        {/* Mail icon tile. */}
        <div className="mt-11 w-[132px] h-[132px] rounded-[26px] bg-neutral-raised flex items-center justify-center text-primary">
          <span className="material-symbols-outlined" style={{ fontSize: 56 }}>
            mail
          </span>
        </div>

        {/* Title and the email the code was sent to. */}
        <h1 className="font-serif font-medium text-[30px] text-primary mt-[34px] m-0">
          Kiểm tra hộp thư
        </h1>
        <p className="font-sans text-[18px] text-text-muted mt-3 m-0 text-center">
          Chúng tôi đã gửi mã đến <span className="text-text-secondary">{otp.email}</span>
        </p>

        {/* Six-digit code boxes. */}
        <OtpCodeInput onChange={otp.setCode} />

        {/* Resend */}
        <p className="font-sans text-[16px] text-text-muted mt-[26px] m-0">
          {otp.resendSeconds > 0 ? (
            <span className="underline text-text-muted">Gửi lại mã</span>
          ) : (
            <Button onClick={() => void otp.resend()} disabled={otp.busy || !otp.email} className="underline text-primary">Gửi lại mã</Button>
          )}
          {otp.resendSeconds > 0 && ` — sau ${otp.countdown}`}
        </p>
        {/* Verification error message. */}
        {otp.error && <p role="alert" className="mt-4 text-red-700">{otp.error}</p>}
      </div>

      {/* Verify */}
      <div className="px-[22px] pt-4 pb-[30px]">
        <Button
          onClick={() => void otp.verify()}
          disabled={otp.busy || !otp.email}
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
