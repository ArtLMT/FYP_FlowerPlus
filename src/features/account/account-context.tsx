"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RequestError } from "@/lib/api";
import { currentUser, type AccountUser } from "@/lib/services/auth";

const AccountContext = createContext<AccountUser | null>(null);

export function AccountGate({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AccountUser | null>(null);
  const [error, setError] = useState(false);
  const router = useRouter();

  useEffect(() => {
    currentUser().then(setUser).catch((cause) => {
      if (cause instanceof RequestError && cause.status === 401) router.replace("/login");
      else setError(true);
    });
  }, [router]);

  if (error) return <p className="p-6">Không thể tải tài khoản. Vui lòng tải lại trang.</p>;
  if (!user) return <p className="p-6">Đang tải tài khoản...</p>;
  return <AccountContext.Provider value={user}>{children}</AccountContext.Provider>;
}

export function useAccount() {
  const user = useContext(AccountContext);
  if (!user) throw new Error("useAccount requires AccountGate");
  return user;
}
