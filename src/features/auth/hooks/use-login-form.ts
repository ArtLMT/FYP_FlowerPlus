import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAsyncAction } from "@/lib/hooks/use-async-action";
import { googleLoginError, login, register } from "@/lib/services/auth";
import { useCart } from "@/features/cart/cart-provider";
import { nextFromUrl, rememberReturn, takeReturn } from "@/features/auth/return-after-login";

export type LoginTab = "login" | "register";

/** The ?next= page to return to after login, or the account page. */
function pageAfterLogin() {
  return nextFromUrl() ?? "/account";
}

/** The /login card: sign in, or register and continue to email verification. */
export function useLoginForm() {
  const router = useRouter();
  const { refresh: refreshCart } = useCart();
  const { busy, error, setError, run } = useAsyncAction();
  const [tab, setTab] = useState<LoginTab>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);

  // A failed Google sign-in comes back as /login?error=CODE, which only exists in the browser.
  useEffect(() => {
    const message = googleLoginError(new URLSearchParams(window.location.search).get("error"));
    if (message) Promise.resolve().then(() => setError(message));
  }, [setError]);

  function switchTab(next: LoginTab) {
    setTab(next);
    setError(null);
  }

  const submitLogin = () => run(async () => {
    await login(email, password);
    takeReturn(); // a Google attempt abandoned earlier must not redirect a later visit to "/"
    await refreshCart();
    router.replace(pageAfterLogin());
    router.refresh();
  });

  function submitRegister() {
    if (password !== confirmPassword) return setError("Mật khẩu xác nhận không khớp.");
    if (!agreed) return setError("Vui lòng đồng ý với điều khoản và chính sách bảo mật.");
    return run(async () => {
      await register(fullName, email, password);
      const next = nextFromUrl();
      router.push(`/login/otp?email=${encodeURIComponent(email.trim())}${next ? `&next=${encodeURIComponent(next)}` : ""}`);
    });
  }

  return {
    tab,
    switchTab,
    showPassword,
    toggleShowPassword: () => setShowPassword((visible) => !visible),
    email,
    setEmail,
    password,
    setPassword,
    fullName,
    setFullName,
    confirmPassword,
    setConfirmPassword,
    agreed,
    setAgreed,
    error,
    busy,
    canLogin: !busy && Boolean(email) && Boolean(password),
    canRegister: !busy && Boolean(fullName && email && password && confirmPassword),
    submitLogin,
    submitRegister,
    /** Google leaves the site; remember ?next= so ReturnAfterGoogleLogin can come back to it. */
    rememberGoogleReturn: () => rememberReturn(nextFromUrl()),
  };
}
