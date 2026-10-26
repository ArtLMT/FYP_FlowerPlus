"use client";

import Link from "next/link";
import Button from "@/components/ui/Button";
import { useLoginForm } from "@/features/auth/hooks/use-login-form";
import { GOOGLE_LOGIN_URL } from "@/lib/services/auth";

// Shared bottom-border field styling (DESIGN.md: transparent, 1.5px secondary,
// deepens to primary on focus).
const FIELD =
  "w-full bg-transparent border-b-[1.5px] border-secondary rounded-t-[2px] py-2 px-[2px] font-sans text-[19px] text-text-primary placeholder:text-text-muted outline-none focus:border-primary transition-colors";

/**
 * Login / Register — /login
 *
 * UI map:
 * - Desktop: one wide card split into a left brand panel and a right form column.
 * - Mobile: a narrow card with the wordmark above the form.
 * - Form column: Login/Register tabs → the active tab's fields and submit button → error message
 *   → "HOẶC" divider → Google button.
 * - Form state, validation, and API calls live in `features/auth/hooks/use-login-form.ts`.
 */
export default function LoginPage() {
  const form = useLoginForm();
  const pwType = form.showPassword ? "text" : "password";

  // Underlined tab style for the Login/Register switcher.
  const tabClass = (active: boolean) =>
    `py-[14px] font-serif text-[23px] transition-colors border-b-[2.5px] -mb-px ${
      active ? "text-primary border-primary" : "text-text-muted border-transparent"
    }`;

  // Password input with the show/hide eye button; shared by both tabs.
  const passwordField = (wrapperClassName: string) => (
    <div className={wrapperClassName}>
      <input type={pwType} value={form.password} onChange={(e) => form.setPassword(e.target.value)} placeholder="Mật khẩu" className={`${FIELD} pr-8`} aria-label="Mật khẩu" />
      <Button
        onClick={form.toggleShowPassword}
        className="absolute right-0 top-1 p-1 text-text-secondary"
        aria-label={form.showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
          {form.showPassword ? "visibility" : "visibility_off"}
        </span>
      </Button>
    </div>
  );

  return (
    <div className="min-h-dvh bg-neutral-canvas flex items-start justify-center px-5 pt-9 pb-16 md:items-center md:pt-16">
      <div className="w-full max-w-[380px] bg-neutral-surface border border-neutral-border rounded-3xl px-9 pt-11 pb-14 md:max-w-[840px] md:p-0 md:flex md:overflow-hidden">
        {/* Desktop brand panel (left half) */}
        <div className="hidden md:flex md:w-1/2 md:flex-col md:justify-center bg-primary text-white p-12">
          <p className="font-serif font-medium text-[52px] leading-[1.05] tracking-heading m-0">
            FlowerPlus
          </p>
          <p className="font-sans text-body-lg text-white/85 mt-4 mb-0 leading-relaxed">
            Trải nghiệm hoa tươi hiện đại. Đăng nhập để theo dõi đơn hàng, lưu ưu đãi và đặt hoa nhanh hơn.
          </p>
          <div className="mt-10 flex items-center gap-3 text-white/75">
            <span className="material-symbols-outlined">local_florist</span>
            <span className="font-sans text-body">Giao hoa tận nơi mỗi ngày</span>
          </div>
        </div>

        {/* Form column */}
        <div className="md:w-1/2 md:px-10 md:pt-11 md:pb-12">
          {/* Brand — mobile only (desktop shows the brand panel) */}
          <div className="text-center mb-2 md:hidden">
            <p className="font-serif font-medium text-[46px] leading-[1.05] tracking-heading text-primary m-0">
              FlowerPlus
            </p>
          </div>
          <p className="text-center font-sans text-body-lg text-text-secondary mt-0 mb-8 md:hidden">
            Trải nghiệm hoa tươi hiện đại.
          </p>

        {/* Tabs */}
        <div className="grid grid-cols-2 border-b border-neutral-border mb-1">
          <Button onClick={() => form.switchTab("login")} className={tabClass(form.tab === "login")}>
            Đăng nhập
          </Button>
          <Button onClick={() => form.switchTab("register")} className={tabClass(form.tab === "register")}>
            Đăng ký
          </Button>
        </div>

        {/* LOGIN */}
        {form.tab === "login" && (
          <div className="pt-[30px]">
            {/* Email field, password field, "Quên mật khẩu?" link, and "ĐĂNG NHẬP" button. */}
            <div className="mb-[30px]">
              <input type="email" value={form.email} onChange={(e) => form.setEmail(e.target.value)} placeholder="Email" className={FIELD} aria-label="Email" />
            </div>
            {passwordField("mb-[14px] relative")}
            <div className="text-right mb-[30px]">
              <Link href="/login/forgot-password" className="font-sans text-[16px] text-text-muted no-underline hover:text-primary">
                Quên mật khẩu?
              </Link>
            </div>
            <Button
              onClick={() => void form.submitLogin()}
              disabled={!form.canLogin}
              className="block w-full text-center bg-primary text-white rounded-lg py-[17px] font-sans font-bold text-body-sm tracking-[0.1em] hover:bg-primary-hover transition-colors"
            >
              ĐĂNG NHẬP
            </Button>
          </div>
        )}

        {/* REGISTER */}
        {form.tab === "register" && (
          <div className="pt-[30px]">
            {/* Full name, email, password, confirm password, terms checkbox, and "TẠO TÀI KHOẢN" button. */}
            <div className="mb-[26px]">
              <input type="text" value={form.fullName} onChange={(e) => form.setFullName(e.target.value)} placeholder="Họ và tên" className={FIELD} aria-label="Họ và tên" />
            </div>
            <div className="mb-[26px]">
              <input type="email" value={form.email} onChange={(e) => form.setEmail(e.target.value)} placeholder="Email" className={FIELD} aria-label="Email" />
            </div>
            {passwordField("mb-[26px] relative")}
            <div className="mb-[22px]">
              <input type={pwType} value={form.confirmPassword} onChange={(e) => form.setConfirmPassword(e.target.value)} placeholder="Xác nhận mật khẩu" className={FIELD} aria-label="Xác nhận mật khẩu" />
            </div>
            <label className="flex items-start gap-[10px] mb-7 font-sans text-[14px] leading-[1.5] text-text-secondary cursor-pointer">
              <input type="checkbox" checked={form.agreed} onChange={(e) => form.setAgreed(e.target.checked)} className="mt-[2px] w-4 h-4 accent-[var(--color-primary)]" />
              <span>
                Tôi đồng ý với{" "}
                <Link href="#" className="text-primary underline">Điều khoản</Link> và{" "}
                <Link href="#" className="text-primary underline">Chính sách bảo mật</Link>.
              </span>
            </label>
            <Button
              onClick={() => void form.submitRegister()}
              disabled={!form.canRegister}
              className="block w-full text-center bg-primary text-white rounded-lg py-[17px] font-sans font-bold text-body-sm tracking-[0.1em] hover:bg-primary-hover transition-colors"
            >
              TẠO TÀI KHOẢN
            </Button>
          </div>
        )}

        {/* Login/register error message. */}
        {form.error && <p role="alert" className="mt-4 text-red-700">{form.error}</p>}

        {/* OR divider */}
        <div className="flex items-center gap-4 my-[30px]">
          <div className="flex-1 h-px bg-neutral-border" />
          <span className="font-sans font-bold text-[12px] tracking-[0.1em] text-text-muted">HOẶC</span>
          <div className="flex-1 h-px bg-neutral-border" />
        </div>

        {/* Google: a full-page navigation to the backend OAuth flow, so a link rather than a button. */}
        <a href={GOOGLE_LOGIN_URL} className="w-full bg-transparent border-[1.5px] border-secondary rounded-lg py-[15px] flex items-center justify-center gap-3 hover:border-primary transition-colors">
          <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
          </svg>
          <span className="font-sans font-bold text-body-sm tracking-button text-text-primary">
            TIẾP TỤC VỚI GOOGLE
          </span>
        </a>
        </div>
        {/* end form column */}
      </div>
    </div>
  );
}
