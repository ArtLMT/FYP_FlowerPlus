"use client";

import Link from "next/link";
import DetailHeader from "@/features/account/components/DetailHeader";
import { useAccount } from "@/features/account/account-context";
import PasswordResetFlow from "@/features/auth/PasswordResetFlow";

export default function AccountPasswordResetPage() {
  const user = useAccount();

  return (
    <div className="flex min-h-dvh flex-col bg-neutral-canvas md:min-h-0 md:block md:bg-transparent">
      <DetailHeader title="Đặt lại mật khẩu" backHref="/account/info" />
      <div className="flex-1 overflow-y-auto px-[22px] pb-8 md:px-0">
        <Link href="/account/info" className="mb-4 hidden text-sm font-semibold text-text-muted no-underline hover:text-primary md:inline-flex">
          ← Quay lại thông tin tài khoản
        </Link>
        <p className="mb-5 max-w-2xl font-sans text-sm leading-relaxed text-text-secondary">
          Mã xác nhận sẽ được gửi đến email trên tài khoản. Sau khi đặt lại mật khẩu, hãy đăng nhập lại để tiếp tục.
        </p>
        <PasswordResetFlow accountEmail={user.email} />
      </div>
    </div>
  );
}
