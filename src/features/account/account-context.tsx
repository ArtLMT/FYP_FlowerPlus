"use client";

import { createContext, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useResource } from "@/lib/hooks/use-resource";
import { getCurrentUser, type AccountUser } from "@/lib/services/auth";

const AccountContext = createContext<AccountUser | null>(null);

/** Loads the signed-in account; a guest is sent to /login. */
function useSignedInAccount() {
  const router = useRouter();
  const { data: user, error } = useResource(getCurrentUser, "current-user");

  useEffect(() => {
    if (user === null) router.replace("/login");
  }, [user, router]);

  return { user, failed: error !== null };
}

/** Renders its children only for a signed-in user, who is then available through useAccount(). */
export function AccountGate({ children }: { children: React.ReactNode }) {
  const { user, failed } = useSignedInAccount();

  // Plain text messages shown in place of the account pages while loading or after a failure.
  if (failed) return <p className="p-6">Không thể tải tài khoản. Vui lòng tải lại trang.</p>;
  if (!user) return <p className="p-6">Đang tải tài khoản...</p>;
  return <AccountContext.Provider value={user}>{children}</AccountContext.Provider>;
}

export function useAccount() {
  const user = useContext(AccountContext);
  if (!user) throw new Error("useAccount requires AccountGate");
  return user;
}
