"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { takeReturn } from "@/features/auth/return-after-login";
import { getCurrentUser } from "@/lib/services/auth";

/**
 * After Google login the backend lands on "/" (OAUTH2_REDIRECT_URI). If the user left from a page that
 * asked them to sign in, such as /custom, send them back there once the session is confirmed.
 * Does nothing, and makes no request, when no return was remembered.
 */
export default function ReturnAfterGoogleLogin() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/") return;
    const path = takeReturn();
    if (!path) return;
    getCurrentUser().then(
      (user) => {
        if (user) router.replace(path);
      },
      () => {},
    );
  }, [pathname, router]);

  return null;
}
