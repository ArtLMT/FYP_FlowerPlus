import { useEffect, useState } from "react";

/** Seconds left on a countdown that ticks once a second and stops at zero. Call `start(n)` to (re)start it. */
export function useCountdown(initialSeconds = 0) {
  const [seconds, start] = useState(initialSeconds);

  useEffect(() => {
    if (seconds <= 0) return;
    const timeout = window.setTimeout(() => start((left) => left - 1), 1000);
    return () => window.clearTimeout(timeout);
  }, [seconds]);

  return [seconds, start] as const;
}
