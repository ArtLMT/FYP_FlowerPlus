"use client";

import Link from "next/link";
import DetailHeader from "@/features/account/components/DetailHeader";
import { useAccount } from "@/features/account/account-context";
import PasswordResetFlow from "@/features/auth/PasswordResetFlow";

/**
 * Signed-in password reset — /account/info/password-reset.
 * Mobile back-bar → desktop back link → explanation text → reset flow pre-filled with the
 * account email. The form steps themselves live in `features/auth/PasswordResetFlow.tsx`.
 */
export default function AccountPasswordResetPage() {
  const user = useAccount();

  return (
    <div className="flex min-h-dvh flex-col bg-neutral-canvas md:min-h-0 md:block md:bg-transparent">
      {/* Mobile-only top bar with back arrow and title. */}
      <DetailHeader title="Đặt lại mật khẩu" backHref="/account/info" />
      <div className="flex-1 overflow-y-auto px-[22px] pb-8 md:px-0">
        {/* Desktop-only back link to account info. */}
        <Link href="/account/info" className="mb-4 hidden text-sm font-semibold text-text-muted no-underline hover:text-primary md:inline-flex">
          ← Quay lại thông tin tài khoản
        </Link>
        {/* Explanation of where the code is sent. */}
        <p className="mb-5 max-w-2xl font-sans text-sm leading-relaxed text-text-secondary">
          Mã xác nhận sẽ được gửi đến email trên tài khoản. Sau khi đặt lại mật khẩu, hãy đăng nhập lại để tiếp tục.
        </p>
        {/* OTP request, code entry, and new-password form. */}
        <PasswordResetFlow accountEmail={user.email} />
      </div>
    </div>
  );
}
