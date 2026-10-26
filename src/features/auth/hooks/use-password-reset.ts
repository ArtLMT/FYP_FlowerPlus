import { useState, type FormEvent } from "react";
import type { ApiError } from "@/lib/api";
import { useAsyncAction } from "@/lib/hooks/use-async-action";
import { useCountdown } from "@/lib/hooks/use-countdown";
import { requestPasswordReset, resetPassword } from "@/lib/services/auth";

export type PasswordResetStep = "request" | "reset" | "success";

const RESEND_SECONDS = 60;

const normalizeEmail = (email: string) => email.trim().toLowerCase();

/**
 * Forgot / reset password: request a code by email, then set a new password with it.
 * `accountEmail` is given when a signed-in customer resets their own password (email locked).
 */
export function usePasswordReset(accountEmail?: string) {
  const { busy, error, setError, run } = useAsyncAction();
  const [step, setStep] = useState<PasswordResetStep>("request");
  const [email, setEmail] = useState(accountEmail ?? "");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendSeconds, startResendCountdown] = useCountdown();
  const [cooldownEmail, setCooldownEmail] = useState("");

  function startCooldown(seconds: number) {
    startResendCountdown(seconds);
    setCooldownEmail(normalizeEmail(email));
  }

  // The service already words the message (with "try again in…" when throttled).
  function onError(failure: ApiError) {
    if (failure.retryAfterSeconds > 0) startCooldown(failure.retryAfterSeconds);
    else if (failure.is("OTP_ATTEMPTS_EXCEEDED")) setCode("");
  }

  function submitRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    return run(async () => {
      await requestPasswordReset(email);
      setStep("reset");
      setCode("");
      startCooldown(RESEND_SECONDS);
    }, onError);
  }

  const resendCode = () => run(async () => {
    await requestPasswordReset(email);
    startCooldown(RESEND_SECONDS);
  }, onError);

  function submitReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!/^\d{6}$/.test(code)) return setError("Vui lòng nhập đủ sáu chữ số trong mã xác nhận.");
    if (password.length < 8 || password.length > 72) return setError("Mật khẩu phải có từ 8 đến 72 ký tự.");
    if (password !== confirmPassword) return setError("Mật khẩu xác nhận không khớp.");
    return run(async () => {
      await resetPassword(email, code, password);
      setStep("success");
    }, onError);
  }

  function goBackToEmail() {
    setStep("request");
    setCode("");
    setPassword("");
    setConfirmPassword("");
    setError(null);
  }

  return {
    isAccountReset: accountEmail !== undefined,
    step,
    email,
    setEmail,
    code,
    /** Keeps only the first six digits typed. */
    setCode: (value: string) => setCode(value.replace(/\D/g, "").slice(0, 6)),
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    showPassword,
    toggleShowPassword: () => setShowPassword((visible) => !visible),
    showConfirmPassword,
    toggleShowConfirmPassword: () => setShowConfirmPassword((visible) => !visible),
    resendSeconds,
    emailIsCoolingDown: resendSeconds > 0 && normalizeEmail(email) === cooldownEmail,
    error,
    busy,
    submitRequest,
    resendCode,
    submitReset,
    goBackToEmail,
  };
}
