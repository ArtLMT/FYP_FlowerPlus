import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { refreshSession } from "@/lib/api";

/**
 * `/admin` checks the account on the server, which cannot renew an expired access token because only
 * the browser can store the new cookies. So the browser renews it here and asks the server to render
 * again. Returns true while that is happening, so "please sign in" does not flash first.
 */
export function useSessionRestore(signedIn: boolean): boolean {
  const router = useRouter();
  const [checking, setChecking] = useState(!signedIn);
  const [rendering, startRendering] = useTransition();

  useEffect(() => {
    if (signedIn) return;
    void refreshSession().then((renewed) => {
      if (renewed) startRendering(() => router.refresh());
      setChecking(false);
    });
  }, [signedIn, router]);

  return checking || rendering;
}
