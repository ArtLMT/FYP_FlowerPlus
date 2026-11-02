import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAsyncAction } from "@/lib/hooks/use-async-action";
import { useCountdown } from "@/lib/hooks/use-countdown";
import { resendOtp, verifyEmail } from "@/lib/services/auth";
import { useCart } from "@/features/cart/cart-provider";

const RESEND_SECONDS = 59;

/** /login/otp: verify the six-digit code sent after registration, or ask for a new one. */
export function useEmailVerification() {
  const router = useRouter();
  const { refresh: refreshCart } = useCart();
  const { busy, error, setError, run } = useAsyncAction();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [resendSeconds, startResendCountdown] = useCountdown(RESEND_SECONDS);

  // The address comes from ?email=…, which only exists in the browser.
  useEffect(() => {
    Promise.resolve().then(() => setEmail(new URLSearchParams(window.location.search).get("email") ?? ""));
  }, []);

  function verify() {
    if (code.length !== 6 || !email) return setError("Vui lòng nhập đủ sáu chữ số.");
    return run(async () => {
      await verifyEmail(email, code);
      await refreshCart();
      router.replace("/account");
      router.refresh();
    });
  }

  const resend = () => run(async () => {
    await resendOtp(email);
    startResendCountdown(RESEND_SECONDS);
  });

  return {
    email,
    setCode,
    error,
    busy,
    resendSeconds,
    countdown: `0:${String(resendSeconds).padStart(2, "0")}`,
    verify,
    resend,
  };
}
