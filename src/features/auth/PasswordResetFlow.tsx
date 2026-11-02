"use client";

import Link from "next/link";
import Button from "@/components/ui/Button";
import { usePasswordReset } from "@/features/auth/hooks/use-password-reset";
import { formatWait } from "@/lib/utils";

const FIELD =
  "w-full bg-transparent border-b-[1.5px] border-secondary rounded-t-[2px] py-2 px-[2px] font-sans text-[18px] text-text-primary placeholder:text-text-muted outline-none focus:border-primary transition-colors";

/** Forgot / reset password — used by /login/forgot-password and by the signed-in account screen. */
/**
 * UI map:
 * - Standalone (/login/forgot-password): desktop left brand panel + right form card; mobile shows
 *   the back link and wordmark above the form instead.
 * - Inside the account (/account/info/password-reset): just the form card, email locked.
 * - The form card is: title → 3-step indicator → one of the request / reset / success steps.
 * - Step state and API calls live in `hooks/use-password-reset.ts`.
 */
export default function PasswordResetFlow({ accountEmail, startWithCode = false, setup = false }: {
  accountEmail?: string;
  startWithCode?: boolean;
  /** A new Staff member's first password (/login/set-password): one screen, no code requests. */
  setup?: boolean;
}) {
  const {
    isAccountReset,
    isSetup,
    step,
    haveCode,
    toggleHaveCode,
    codeSentNow,
    email,
    setEmail,
    code,
    setCode,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    showPassword,
    toggleShowPassword,
    showConfirmPassword,
    toggleShowConfirmPassword,
    resendSeconds,
    emailIsCoolingDown,
    error,
    busy,
    submitRequest,
    resendCode,
    submitReset,
    goBackToEmail,
  } = usePasswordReset(accountEmail, startWithCode, setup);

  return (
    <main className={isAccountReset ? "w-full" : "min-h-dvh bg-neutral-canvas flex items-start justify-center px-4 py-6 md:items-center md:px-6 md:py-12"}>
      <div className={isAccountReset ? "w-full overflow-hidden rounded-2xl border border-neutral-border bg-neutral-surface" : "w-full max-w-[840px] overflow-hidden rounded-3xl border border-neutral-border bg-neutral-surface md:flex"}>
        {/* Desktop-only left brand panel (standalone page only). */}
        {!isAccountReset && <aside className="hidden w-1/2 flex-col justify-center bg-primary p-12 text-white md:flex">
          <p className="m-0 font-serif text-[52px] font-medium leading-tight tracking-heading">FlowerPlus</p>
          <p className="mt-4 font-sans text-body-lg leading-relaxed text-white/85">
            {isSetup
              ? "Chào mừng bạn đến với FlowerPlus. Đặt mật khẩu để bắt đầu làm việc."
              : "Đặt lại mật khẩu để tiếp tục quản lý tài khoản và đơn hàng của bạn."}
          </p>
          <div className="mt-10 flex items-center gap-3 text-white/75">
            <span className="material-symbols-outlined" aria-hidden="true">local_florist</span>
            <span className="font-sans text-body">Giao hoa tận nơi mỗi ngày</span>
          </div>
        </aside>}

        {/* Form card. */}
        <section className={isAccountReset ? "w-full px-5 py-6 sm:px-8 sm:py-8" : "w-full px-6 py-8 sm:px-9 sm:py-10 md:w-1/2 md:px-10 md:py-12"}>
          {/* Back-to-login link and mobile wordmark (standalone page only). */}
          {!isAccountReset && <Link href="/login" className="text-sm font-semibold text-text-muted no-underline hover:text-primary">
            ← Quay lại đăng nhập
          </Link>}

          {!isAccountReset && <div className="mb-7 mt-6 text-center md:hidden">
            <p className="m-0 font-serif text-[42px] font-medium leading-tight tracking-heading text-primary">FlowerPlus</p>
          </div>}

          {/* Title for the current step. */}
          <h1 className={`${isAccountReset ? "mt-0" : "mt-2"} font-serif text-[30px] font-medium text-primary`}>
            {step === "request" && (isAccountReset ? "Đặt lại mật khẩu" : "Quên mật khẩu?")}
            {step === "reset" && (isSetup ? "Thiết lập mật khẩu" : "Tạo mật khẩu mới")}
            {step === "success" && (isSetup ? "Mật khẩu đã được thiết lập" : "Mật khẩu đã được cập nhật")}
          </h1>

          {/* Step indicator: Email → Xác nhận → Hoàn tất (set-up: Thiết lập → Hoàn tất). */}
          <ol className={`my-6 grid ${isSetup ? "grid-cols-2" : "grid-cols-3"} gap-2 text-center font-sans text-xs text-text-muted`} aria-label="Các bước đặt lại mật khẩu">
            {(isSetup
              ? [
                { label: "Thiết lập", active: step === "reset" },
                { label: "Hoàn tất", active: step === "success" },
              ]
              : [
                { label: "Email", active: step === "request" },
                { label: "Xác nhận", active: step === "reset" },
                { label: "Hoàn tất", active: step === "success" },
              ]).map(({ label, active }) => (
              <li key={label} aria-current={active ? "step" : undefined} className={`border-t-2 pt-2 ${active ? "border-primary font-semibold text-primary" : "border-neutral-border"}`}>
                {label}
              </li>
            ))}
          </ol>

          {/* Step 1: email field and "GỬI MÃ XÁC NHẬN" button, or "TIẾP TỤC" when the user already has a code. */}
          {step === "request" && (
            <>
              <p className="mb-6 text-sm leading-relaxed text-text-secondary">
                {haveCode
                  ? "Nhập email đã nhận mã. Bạn sẽ nhập mã ở bước tiếp theo; không có mã mới nào được gửi."
                  : isAccountReset
                    ? "Chúng tôi sẽ gửi mã xác nhận đến email trên tài khoản của bạn."
                    : "Nhập email đã đăng ký. Nếu email có tài khoản hợp lệ, chúng tôi sẽ gửi mã đặt lại mật khẩu."}
              </p>
              <form onSubmit={(event) => void submitRequest(event)}>
                <label htmlFor="reset-email" className="mb-2 block text-sm font-semibold text-text-secondary">Email</label>
                <input
                  id="reset-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  readOnly={isAccountReset}
                  className={`${FIELD} ${isAccountReset ? "bg-neutral-surface" : ""}`}
                  placeholder="you@example.com"
                />
                {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
                <Button
                  type="submit"
                  disabled={busy || !email.trim() || (!haveCode && emailIsCoolingDown)}
                  className="mt-8 block w-full rounded-lg bg-primary py-4 text-center font-sans text-sm font-bold tracking-[0.1em] text-white hover:bg-primary-hover"
                >
                  {haveCode ? "TIẾP TỤC" : busy ? "ĐANG GỬI..." : emailIsCoolingDown ? `THỬ LẠI SAU ${formatWait(resendSeconds)}` : "GỬI MÃ XÁC NHẬN"}
                </Button>
              </form>
              <Button type="button" onClick={toggleHaveCode} disabled={busy} className="mt-5 text-sm font-semibold text-primary underline">
                {haveCode ? "Chưa có mã? Gửi mã mới" : "Tôi đã có mã"}
              </Button>
            </>
          )}

          {/* Step 2: "code sent" notice, then code / new password / confirm password form. */}
          {step === "reset" && (
            <>
              <div role="status" className="mb-6 rounded-xl border border-neutral-border bg-white/70 p-4 text-sm leading-relaxed text-text-secondary">
                {isSetup
                  ? "Nhập email công việc, mã trong email chào mừng và mật khẩu mới. Mã có hiệu lực 24 giờ. Nếu mã đã hết hạn, hãy nhờ quản trị viên bấm “Gửi lại email thiết lập”."
                  : codeSentNow
                    ? "Nếu email có tài khoản hợp lệ, mã xác nhận đã được gửi. Mã có hiệu lực trong 5 phút. Kiểm tra cả thư mục spam nếu bạn chưa thấy email."
                    : "Nhập mã trong email bạn đã nhận. Mã đặt lại mật khẩu có hiệu lực 5 phút; nếu mã đã hết hạn, chọn “Gửi lại mã”."}
                {!isSetup && <div className="mt-2 break-all font-semibold text-text-primary">{email.trim()}</div>}
              </div>

              <form onSubmit={(event) => void submitReset(event)}>
                {/* Set-up only: there was no email step, so the email is asked for here. */}
                {isSetup && <>
                  <label htmlFor="setup-email" className="mb-2 block text-sm font-semibold text-text-secondary">Email công việc</label>
                  <input
                    id="setup-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className={`${FIELD} mb-6`}
                    placeholder="you@example.com"
                  />
                </>}
                <label htmlFor="reset-code" className="mb-2 block text-sm font-semibold text-text-secondary">Mã xác nhận</label>
                <input
                  id="reset-code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  required
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  className={`${FIELD} text-center font-serif text-2xl tracking-[0.8em]`}
                  aria-describedby="reset-code-help"
                />
                <p id="reset-code-help" className="mt-2 text-xs text-text-muted">Nhập mã gồm sáu chữ số.</p>

                {/* New password with show/hide toggle. */}
                <label htmlFor="new-password" className="mb-2 mt-6 block text-sm font-semibold text-text-secondary">Mật khẩu mới</label>
                <div className="relative">
                  <input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className={`${FIELD} pr-10`}
                    aria-describedby="password-help"
                  />
                  <Button type="button" onClick={toggleShowPassword} className="absolute right-0 top-1 p-1 text-text-secondary" aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}>
                    <span className="material-symbols-outlined" aria-hidden="true">{showPassword ? "visibility" : "visibility_off"}</span>
                  </Button>
                </div>
                <p id="password-help" className="mt-2 text-xs text-text-muted">Mật khẩu gồm từ 8 đến 72 ký tự.</p>

                {/* Confirm password with show/hide toggle. */}
                <label htmlFor="confirm-password" className="mb-2 mt-5 block text-sm font-semibold text-text-secondary">Xác nhận mật khẩu</label>
                <div className="relative">
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className={`${FIELD} pr-10`}
                  />
                  <Button type="button" onClick={toggleShowConfirmPassword} className="absolute right-0 top-1 p-1 text-text-secondary" aria-label={showConfirmPassword ? "Ẩn mật khẩu xác nhận" : "Hiện mật khẩu xác nhận"}>
                    <span className="material-symbols-outlined" aria-hidden="true">{showConfirmPassword ? "visibility" : "visibility_off"}</span>
                  </Button>
                </div>

                {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}

                <Button
                  type="submit"
                  disabled={busy}
                  className="mt-7 block w-full rounded-lg bg-primary py-4 text-center font-sans text-sm font-bold tracking-[0.1em] text-white hover:bg-primary-hover"
                >
                  {busy ? "ĐANG CẬP NHẬT..." : isSetup ? "THIẾT LẬP MẬT KHẨU" : "ĐẶT LẠI MẬT KHẨU"}
                </Button>
              </form>

              {/* Change-email and resend-code links under the form. Not in set-up: a code requested
                  here would be a password-reset code, not a set-up one. */}
              {!isSetup && <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm">
                {!isAccountReset && <Button type="button" onClick={goBackToEmail} className="text-text-secondary underline">Đổi email</Button>}
                <Button type="button" onClick={() => void resendCode()} disabled={busy || resendSeconds > 0} className="font-semibold text-primary underline">
                  {resendSeconds > 0 ? `Gửi lại sau ${formatWait(resendSeconds)}` : "Gửi lại mã"}
                </Button>
              </div>}
            </>
          )}

          {/* Step 3: success message and "ĐI ĐẾN ĐĂNG NHẬP" button. */}
          {step === "success" && (
            <div className="mt-5">
              <p className="mb-7 text-sm leading-relaxed text-text-secondary">
                {isAccountReset
                  ? "Phiên trên trình duyệt này đã kết thúc. Hãy đăng nhập lại bằng mật khẩu mới; các thiết bị khác cũng sẽ cần đăng nhập lại khi phiên hiện tại hết hạn."
                  : isSetup
                    ? "Mật khẩu đã được lưu. Hãy đăng nhập bằng email công việc và mật khẩu mới."
                    : "Mật khẩu mới đã được lưu. Hãy đăng nhập lại bằng mật khẩu mới."}
              </p>
              <Link href="/login" className="block rounded-lg bg-primary py-4 text-center font-sans text-sm font-bold tracking-[0.1em] text-white no-underline hover:bg-primary-hover">
                ĐI ĐẾN ĐĂNG NHẬP
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
