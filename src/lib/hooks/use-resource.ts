import { useCallback, useEffect, useEffectEvent, useState } from "react";
import { asApiError, type ApiError } from "@/lib/api";

export interface Resource<T> {
  /** The last successfully loaded value (kept while a newer request is in flight or after a failure). */
  data: T | undefined;
  /** Why the last request failed, or null when it succeeded. */
  error: ApiError | null;
  /** True until the request for the current key has finished. */
  loading: boolean;
  /** Loads the current key again. */
  reload: () => void;
  /** Replaces the loaded value locally, e.g. with a record the server just returned from a save. */
  setData: (update: (current: T | undefined) => T | undefined) => void;
}

interface Settled<T> {
  key: string;
  data?: T;
  error: ApiError | null;
}

/**
 * Loads data from a service and keeps it in step with `key`: whenever the key changes the loader
 * runs again, and answers that arrive for an older key are ignored. A null key loads nothing.
 */
export function useResource<T>(load: () => Promise<T>, key: string | null): Resource<T> {
  const [attempt, setAttempt] = useState(0);
  const [settled, setSettled] = useState<Settled<T> | null>(null);
  const requestKey = key === null ? null : `${key}#${attempt}`;
  const runLoad = useEffectEvent(load);

  useEffect(() => {
    if (requestKey === null) return;
    let current = true;
    runLoad().then(
      (data) => {
        if (current) setSettled({ key: requestKey, data, error: null });
      },
      (cause: unknown) => {
        if (current) setSettled((previous) => ({ key: requestKey, data: previous?.data, error: asApiError(cause) }));
      },
    );
    return () => {
      current = false;
    };
  }, [requestKey]);

  const reload = useCallback(() => setAttempt((count) => count + 1), []);
  const setData = useCallback(
    (update: (current: T | undefined) => T | undefined) =>
      setSettled((previous) => previous && { ...previous, data: update(previous.data) }),
    [],
  );

  return {
    data: settled?.data,
    error: settled?.error ?? null,
    loading: requestKey !== null && settled?.key !== requestKey,
    reload,
    setData,
  };
}
