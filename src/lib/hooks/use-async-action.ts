import { useState } from "react";
import { asApiError, type ApiError } from "@/lib/api";

/**
 * Runs a user action (submit, save, resend…) against a service: `busy` while it runs, and `error`
 * holding the service's message if it fails. `onError` lets the caller react to specific errors.
 */
export function useAsyncAction() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(action: () => Promise<void>, onError?: (error: ApiError) => void | Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (cause) {
      const failure = asApiError(cause);
      setError(failure.message);
      await onError?.(failure);
    } finally {
      setBusy(false);
    }
  }

  return { busy, error, setError, run };
}
